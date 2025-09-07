// src/app/store/notification-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'work_assignment' | 'quality_alert' | 'payment';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  read: boolean;
  persistent?: boolean; // If true, won't auto-dismiss
  actionable?: boolean; // If true, has actions to take
  actions?: Array<{
    label: string;
    action: string;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  metadata?: Record<string, any>; // Additional data for the notification
  createdAt: Date;
  expiresAt?: Date;
  dismissedAt?: Date;
}

interface NotificationState {
  // State
  notifications: Notification[];
  unreadCount: number;
  soundEnabled: boolean;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  removeNotification: (id: string) => void;
  clearExpiredNotifications: () => void;
  clearAllNotifications: () => void;
  toggleSound: () => void;
  
  // Real-time subscription actions
  subscribeToNotifications: (userId: string) => void;
  unsubscribeFromNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      notifications: [],
      unreadCount: 0,
      soundEnabled: true,

      // Actions
      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          read: false,
          createdAt: new Date()
        };

        set(state => {
          state.notifications.unshift(notification);
          state.unreadCount += 1;
        });

        // Play notification sound if enabled
        if (get().soundEnabled) {
          // TODO: Implement notification sound
          console.log('🔔 Notification sound played');
        }

        // Auto-dismiss non-persistent notifications after 5 seconds
        if (!notification.persistent) {
          setTimeout(() => {
            get().removeNotification(notification.id);
          }, 5000);
        }

        // Auto-expire notifications based on expiresAt
        if (notification.expiresAt) {
          const timeToExpiry = notification.expiresAt.getTime() - Date.now();
          if (timeToExpiry > 0) {
            setTimeout(() => {
              get().removeNotification(notification.id);
            }, timeToExpiry);
          }
        }

        return notification.id;
      },

      markAsRead: (id: string) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id);
          if (notification && !notification.read) {
            notification.read = true;
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        });
      },

      markAllAsRead: () => {
        set(state => {
          state.notifications.forEach(notification => {
            notification.read = true;
          });
          state.unreadCount = 0;
        });
      },

      dismissNotification: (id: string) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id);
          if (notification) {
            notification.dismissedAt = new Date();
            if (!notification.read) {
              notification.read = true;
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
          }
        });
      },

      removeNotification: (id: string) => {
        set(state => {
          const index = state.notifications.findIndex(n => n.id === id);
          if (index !== -1) {
            const notification = state.notifications[index];
            if (!notification.read) {
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            state.notifications.splice(index, 1);
          }
        });
      },

      clearExpiredNotifications: () => {
        set(state => {
          const now = new Date();
          const validNotifications = state.notifications.filter(notification => {
            if (notification.expiresAt && notification.expiresAt < now) {
              if (!notification.read) {
                state.unreadCount = Math.max(0, state.unreadCount - 1);
              }
              return false;
            }
            return true;
          });
          state.notifications = validNotifications;
        });
      },

      clearAllNotifications: () => {
        set(state => {
          state.notifications = [];
          state.unreadCount = 0;
        });
      },

      toggleSound: () => {
        set(state => {
          state.soundEnabled = !state.soundEnabled;
        });
      },

      subscribeToNotifications: (userId: string) => {
        // TODO: Implement Firebase real-time subscription
        console.log('Subscribing to notifications for user:', userId);
        
        // Mock real-time notifications for development
        if (import.meta.env.VITE_DEBUG_MODE === 'true') {
          const mockNotifications = [
            {
              type: 'work_assignment' as const,
              title: 'New Work Assignment',
              message: 'Bundle B003 has been assigned to you',
              priority: 'normal' as const,
              persistent: true,
              actionable: true,
              actions: [
                { label: 'View Work', action: 'view_work', variant: 'primary' as const },
                { label: 'Dismiss', action: 'dismiss', variant: 'secondary' as const }
              ],
              metadata: { bundleId: 'B003', workType: 'sleeve_attachment' }
            },
            {
              type: 'payment' as const,
              title: 'Payment Released',
              message: 'Your earnings for Bundle B001 have been released (Rs. 450)',
              priority: 'high' as const,
              persistent: false,
              metadata: { amount: 450, bundleId: 'B001' }
            }
          ];

          // Simulate periodic notifications
          setTimeout(() => {
            get().addNotification(mockNotifications[0]);
          }, 2000);

          setTimeout(() => {
            get().addNotification(mockNotifications[1]);
          }, 5000);
        }
      },

      unsubscribeFromNotifications: () => {
        // TODO: Implement Firebase subscription cleanup
        console.log('Unsubscribing from notifications');
      }
    })),
    { name: 'NotificationStore' }
  )
);

// Selectors
export const useNotifications = () => useNotificationStore(state => state.notifications);
export const useUnreadCount = () => useNotificationStore(state => state.unreadCount);
export const useNotificationSound = () => useNotificationStore(state => state.soundEnabled);

// Helper functions
export const createWorkAssignmentNotification = (bundleNumber: string, operation: string) => ({
  type: 'work_assignment' as const,
  title: 'New Work Assignment',
  message: `${operation} work for Bundle ${bundleNumber} has been assigned to you`,
  priority: 'normal' as const,
  persistent: true,
  actionable: true,
  actions: [
    { label: 'View Work', action: 'view_work', variant: 'primary' as const },
    { label: 'Dismiss', action: 'dismiss', variant: 'secondary' as const }
  ],
  metadata: { bundleNumber, operation }
});

export const createQualityAlertNotification = (bundleNumber: string, issueType: string) => ({
  type: 'quality_alert' as const,
  title: 'Quality Issue Reported',
  message: `${issueType} reported for Bundle ${bundleNumber}`,
  priority: 'high' as const,
  persistent: true,
  actionable: true,
  actions: [
    { label: 'View Details', action: 'view_quality_issue', variant: 'primary' as const },
    { label: 'Acknowledge', action: 'acknowledge', variant: 'secondary' as const }
  ],
  metadata: { bundleNumber, issueType }
});