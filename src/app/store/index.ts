// src/app/store/index.ts
// Export all stores and their selectors

// Auth Store
export {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError
} from './auth-store';

// App Store
export {
  useAppStore,
  useSystemSettings,
  useNotificationSettings,
  useUIState,
  useAppInfo
} from './app-store';

// Notification Store
export {
  useNotificationStore,
  useNotifications,
  useUnreadCount,
  useNotificationSound,
  createWorkAssignmentNotification,
  createQualityAlertNotification
} from './notification-store';

// Types (re-export commonly used types)
export type { User, LoginCredentials } from './auth-store';
export type { SystemSettings, NotificationSettings, UIState } from './app-store';
export type { Notification } from './notification-store';

// Store initialization helper
export const initializeStores = () => {
  console.log('🏪 Initializing Zustand stores...');
  
  // Initialize any required store state
  // This could include checking for existing sessions, loading settings, etc.
  
  console.log('✅ Stores initialized successfully');
};