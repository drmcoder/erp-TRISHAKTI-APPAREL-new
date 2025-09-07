// src/app/store/auth-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { User, LoginCredentials } from '@/types/auth';

// Re-export types for backwards compatibility
export type { User, LoginCredentials } from '@/types/auth';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpiry: number | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
  checkSession: () => boolean;
  extendSession: () => void;
  autoRefreshToken: () => Promise<void>;
  initializeFromTokens: () => Promise<void>;
}

// Session duration constants
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const EXTENDED_SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        sessionExpiry: null,

        // Actions
        login: async (credentials: LoginCredentials) => {
          set(state => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // Use AuthService for authentication
            const { AuthService } = await import('@/services/auth-service');
            const result = await AuthService.login(credentials);

            if (result.success && result.data) {
              // Initialize JWT tokens
              const { TokenService } = await import('@/services/token-service');
              const { accessToken: _accessToken, refreshToken: _refreshToken } = TokenService.initializeTokens(result.data);
              
              const sessionDuration = credentials.rememberMe 
                ? EXTENDED_SESSION_DURATION 
                : SESSION_DURATION;

              set(state => {
                state.user = result.data!;
                state.isAuthenticated = true;
                state.isLoading = false;
                state.sessionExpiry = Date.now() + sessionDuration;
              });

              console.log('Login successful for:', result.data.name);
              console.log('JWT tokens initialized');
            } else {
              set(state => {
                state.isLoading = false;
                state.error = result.error || 'Login failed';
              });
            }
          } catch (error) {
            set(state => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Login failed';
            });
          }
        },

        logout: async () => {
          set(state => {
            state.isLoading = true;
          });

          try {
            // Use AuthService for logout
            const { AuthService } = await import('@/services/auth-service');
            const result = await AuthService.logout(get().user?.id);

            // Clear JWT tokens
            const { TokenService } = await import('@/services/token-service');
            TokenService.clearTokens();

            if (result.success) {
              set(state => {
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
                state.error = null;
                state.sessionExpiry = null;
              });

              console.log('Logout successful - JWT tokens cleared');
            } else {
              set(state => {
                state.isLoading = false;
                state.error = result.error || 'Logout failed';
              });
            }
          } catch (error) {
            set(state => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Logout failed';
            });
          }
        },

        refreshUser: async () => {
          const { user } = get();
          if (!user) return;

          set(state => {
            state.isLoading = true;
          });

          try {
            // Use AuthService to refresh user data
            const { AuthService } = await import('@/services/auth-service');
            const result = await AuthService.getUserById(user.id, user.role);

            if (result.success && result.data) {
              set(state => {
                state.user = result.data!;
                state.isLoading = false;
              });
              console.log('User data refreshed for:', result.data.name);
            } else {
              set(state => {
                state.isLoading = false;
                state.error = result.error || 'Failed to refresh user';
              });
            }
          } catch (error) {
            set(state => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to refresh user';
            });
          }
        },

        clearError: () => {
          set(state => {
            state.error = null;
          });
        },

        updateUserProfile: (updates: Partial<User>) => {
          set(state => {
            if (state.user) {
              Object.assign(state.user, updates);
            }
          });
        },

        checkSession: () => {
          const { sessionExpiry, user } = get();
          
          if (!user || !sessionExpiry) {
            return false;
          }

          const isValid = Date.now() < sessionExpiry;
          
          if (!isValid) {
            // Auto-logout on session expiry
            get().logout();
          }

          return isValid;
        },

        extendSession: () => {
          set(state => {
            if (state.sessionExpiry) {
              state.sessionExpiry = Date.now() + SESSION_DURATION;
            }
          });
        },

        // Initialize from stored tokens (for page refresh)
        initializeFromTokens: async () => {
          try {
            const { TokenService } = await import('@/services/token-service');
            const user = TokenService.getUserFromToken();
            const sessionExpiry = TokenService.getSessionExpiry();
            
            if (user && sessionExpiry && sessionExpiry > Date.now()) {
              set(state => {
                state.user = user;
                state.isAuthenticated = true;
                state.sessionExpiry = sessionExpiry;
                state.isLoading = false;
              });
              
              console.log('Session restored from tokens');
            } else {
              // Try to refresh token
              const refreshResult = await TokenService.refreshAccessToken();
              if (refreshResult.success) {
                const refreshedUser = TokenService.getUserFromToken();
                const newSessionExpiry = TokenService.getSessionExpiry();
                
                if (refreshedUser && newSessionExpiry) {
                  set(state => {
                    state.user = refreshedUser;
                    state.isAuthenticated = true;
                    state.sessionExpiry = newSessionExpiry;
                    state.isLoading = false;
                  });
                  
                  console.log('Session refreshed from refresh token');
                  return;
                }
              }
              
              // Clear invalid tokens
              const { TokenService: ClearTokenService } = await import('@/services/token-service');
              ClearTokenService.clearTokens();
              set(state => {
                state.user = null;
                state.isAuthenticated = false;
                state.sessionExpiry = null;
                state.isLoading = false;
              });
            }
          } catch (error) {
            console.error('Error initializing from tokens:', error);
            const { TokenService: ErrorTokenService } = await import('@/services/token-service');
            ErrorTokenService.clearTokens();
            set(state => {
              state.user = null;
              state.isAuthenticated = false;
              state.sessionExpiry = null;
              state.isLoading = false;
            });
          }
        },

        // Auto-refresh token if needed
        autoRefreshToken: async () => {
          const { TokenService } = await import('@/services/token-service');
          const success = await TokenService.autoRefreshToken();
          if (!success) {
            // Token refresh failed, logout user
            get().logout();
          }
        }
      })),
      {
        name: 'tsa-auth-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          sessionExpiry: state.sessionExpiry
        })
      }
    ),
    { name: 'AuthStore' }
  )
);

// Selectors for better performance
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);