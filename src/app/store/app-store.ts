// src/app/store/app-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types
interface SystemSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'np';
  dateFormat: 'AD' | 'BS';
  currency: 'NPR' | 'USD';
  timezone: string;
}

interface NotificationSettings {
  soundEnabled: boolean;
  pushEnabled: boolean;
  workAssignmentNotifications: boolean;
  qualityAlertNotifications: boolean;
  paymentNotifications: boolean;
}

interface UIState {
  sidebarCollapsed: boolean;
  currentPage: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
  isOnline: boolean;
  lastSync: Date | null;
}

interface AppState {
  // System state
  systemSettings: SystemSettings;
  notificationSettings: NotificationSettings;
  uiState: UIState;
  
  // System info
  version: string;
  buildTime: Date;
  environment: 'development' | 'staging' | 'production';

  // Actions
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateUIState: (state: Partial<UIState>) => void;
  toggleSidebar: () => void;
  setCurrentPage: (page: string, breadcrumbs?: Array<{ label: string; href?: string }>) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  updateLastSync: () => void;
  resetToDefaults: () => void;
}

// Default values
const defaultSystemSettings: SystemSettings = {
  theme: 'system',
  language: 'en',
  dateFormat: 'AD',
  currency: 'NPR',
  timezone: 'Asia/Kathmandu'
};

const defaultNotificationSettings: NotificationSettings = {
  soundEnabled: true,
  pushEnabled: true,
  workAssignmentNotifications: true,
  qualityAlertNotifications: true,
  paymentNotifications: true
};

const defaultUIState: UIState = {
  sidebarCollapsed: false,
  currentPage: 'dashboard',
  breadcrumbs: [{ label: 'Dashboard' }],
  isOnline: true,
  lastSync: null
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set, _get) => ({
        // Initial state
        systemSettings: defaultSystemSettings,
        notificationSettings: defaultNotificationSettings,
        uiState: defaultUIState,
        
        // System info
        version: import.meta.env.VITE_APP_VERSION || '2.0.0',
        buildTime: new Date(),
        environment: (import.meta.env.VITE_ENVIRONMENT || 'development') as 'development' | 'staging' | 'production',

        // Actions
        updateSystemSettings: (settings: Partial<SystemSettings>) => {
          set(state => {
            Object.assign(state.systemSettings, settings);
          });
        },

        updateNotificationSettings: (settings: Partial<NotificationSettings>) => {
          set(state => {
            Object.assign(state.notificationSettings, settings);
          });
        },

        updateUIState: (newState: Partial<UIState>) => {
          set(state => {
            Object.assign(state.uiState, newState);
          });
        },

        toggleSidebar: () => {
          set(state => {
            state.uiState.sidebarCollapsed = !state.uiState.sidebarCollapsed;
          });
        },

        setCurrentPage: (page: string, breadcrumbs?: Array<{ label: string; href?: string }>) => {
          set(state => {
            state.uiState.currentPage = page;
            if (breadcrumbs) {
              state.uiState.breadcrumbs = breadcrumbs;
            }
          });
        },

        setOnlineStatus: (isOnline: boolean) => {
          set(state => {
            state.uiState.isOnline = isOnline;
          });
        },

        updateLastSync: () => {
          set(state => {
            state.uiState.lastSync = new Date();
          });
        },

        resetToDefaults: () => {
          set(state => {
            state.systemSettings = { ...defaultSystemSettings };
            state.notificationSettings = { ...defaultNotificationSettings };
            state.uiState = { ...defaultUIState };
          });
        }
      })),
      {
        name: 'tsa-app-store',
        partialize: (state) => ({
          systemSettings: state.systemSettings,
          notificationSettings: state.notificationSettings,
          uiState: {
            sidebarCollapsed: state.uiState.sidebarCollapsed,
            currentPage: state.uiState.currentPage,
            breadcrumbs: state.uiState.breadcrumbs
          }
        })
      }
    ),
    { name: 'AppStore' }
  )
);

// Selectors for better performance
export const useSystemSettings = () => useAppStore(state => state.systemSettings);
export const useNotificationSettings = () => useAppStore(state => state.notificationSettings);
export const useUIState = () => useAppStore(state => state.uiState);
export const useAppInfo = () => useAppStore(state => ({ 
  version: state.version, 
  buildTime: state.buildTime, 
  environment: state.environment 
}));