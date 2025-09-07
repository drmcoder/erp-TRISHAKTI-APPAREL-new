import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/app/store/auth-store';
import { TokenService } from '@/services/token-service';

interface UseSessionManagementOptions {
  autoRefreshInterval?: number; // in minutes
  sessionWarningTime?: number; // in minutes before expiry
  enableAutoLogout?: boolean;
}

export const useSessionManagement = (options: UseSessionManagementOptions = {}) => {
  const {
    autoRefreshInterval = 5, // Check every 5 minutes
    sessionWarningTime = 5,  // Warn 5 minutes before expiry
    enableAutoLogout = true
  } = options;

  const { 
    checkSession, 
    extendSession, 
    autoRefreshToken, 
    initializeFromTokens 
  } = useAuthStore();

  const initializeSession = useCallback(async () => {
    try {
      await initializeFromTokens?.();
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  }, [initializeFromTokens]);

  const refreshTokenIfNeeded = useCallback(async () => {
    try {
      await autoRefreshToken?.();
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }, [autoRefreshToken]);

  const handleSessionWarning = useCallback(() => {
    const token = TokenService.getAccessToken();
    if (!token) return false;

    const isExpiringSoon = TokenService.isTokenExpiringSoon(token, sessionWarningTime);
    if (isExpiringSoon) {
      // Trigger session warning
      console.warn('Session expiring soon');
      return true;
    }
    return false;
  }, [sessionWarningTime]);

  const extendCurrentSession = useCallback(() => {
    extendSession();
    refreshTokenIfNeeded();
  }, [extendSession, refreshTokenIfNeeded]);

  // Initialize session on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Auto-refresh token periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (enableAutoLogout) {
        const sessionValid = checkSession();
        if (!sessionValid) {
          return; // checkSession will handle logout
        }
      }

      refreshTokenIfNeeded();
      handleSessionWarning();
    }, autoRefreshInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [
    autoRefreshInterval,
    enableAutoLogout,
    checkSession,
    refreshTokenIfNeeded,
    handleSessionWarning
  ]);

  // Listen for user activity to extend session
  useEffect(() => {
    const handleUserActivity = () => {
      const token = TokenService.getAccessToken();
      if (token && !TokenService.isTokenExpiringSoon(token, 30)) {
        // Only extend if not expiring in next 30 minutes to avoid too frequent updates
        extendCurrentSession();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    let activityTimer: NodeJS.Timeout;
    const debouncedActivityHandler = () => {
      clearTimeout(activityTimer);
      activityTimer = setTimeout(handleUserActivity, 1000); // Debounce to 1 second
    };

    events.forEach(event => {
      document.addEventListener(event, debouncedActivityHandler, true);
    });

    return () => {
      clearTimeout(activityTimer);
      events.forEach(event => {
        document.removeEventListener(event, debouncedActivityHandler, true);
      });
    };
  }, [extendCurrentSession]);

  return {
    initializeSession,
    refreshTokenIfNeeded,
    extendCurrentSession,
    handleSessionWarning,
  };
};