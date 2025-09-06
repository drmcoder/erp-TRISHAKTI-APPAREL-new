// src/shared/hooks/useRealtimeSync.ts
import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RealtimeService } from '@/services/realtime-service';
import { queryKeys } from '@/app/providers/query-keys';
import { useAuthStore } from '@/app/store';

interface UseRealtimeSyncOptions {
  enabled?: boolean;
  syncWorkItems?: boolean;
  syncNotifications?: boolean;
  syncWallet?: boolean;
  syncOperatorStatus?: boolean;
  onError?: (error: any) => void;
}

/**
 * Custom hook for managing real-time data synchronization
 * Automatically sets up and cleans up subscriptions based on user role
 */
export const useRealtimeSync = (options: UseRealtimeSyncOptions = {}) => {
  const {
    enabled = true,
    syncWorkItems = true,
    syncNotifications = true,
    syncWallet = true,
    syncOperatorStatus = false,
    onError
  } = options;

  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  const subscriptionsRef = useRef<string[]>([]);

  // Sync work items for operators
  const syncUserWorkItems = useCallback(() => {
    if (!user || !syncWorkItems) return;

    if (user.role === 'operator') {
      const subscriptionId = RealtimeService.subscribeToUserWork(
        user.id,
        (workItems) => {
          // Update React Query cache
          queryClient.setQueryData(
            queryKeys.work.workItemsByOperator(user.id),
            workItems
          );

          // Invalidate related queries to trigger refetch
          queryClient.invalidateQueries({
            queryKey: queryKeys.work.availableWork()
          });
        }
      );

      subscriptionsRef.current.push(subscriptionId);
    }
  }, [user, syncWorkItems, queryClient]);

  // Sync damage reports for supervisors
  const syncDamageReports = useCallback(() => {
    if (!user) return;

    if (user.role === 'supervisor') {
      const subscriptionId = RealtimeService.subscribeToDamageReports(
        user.id,
        (reports) => {
          // Update React Query cache
          queryClient.setQueryData(
            queryKeys.quality.damageReportsBySupervisor(user.id),
            reports
          );

          // Invalidate pending damage reports
          queryClient.invalidateQueries({
            queryKey: queryKeys.quality.pendingDamageReports()
          });
        }
      );

      subscriptionsRef.current.push(subscriptionId);
    }
  }, [user, queryClient]);

  // Sync notifications for all users
  const syncUserNotifications = useCallback(() => {
    if (!user || !syncNotifications) return;

    const subscriptionId = RealtimeService.subscribeToNotifications(
      user.id,
      (notifications) => {
        // Update React Query cache
        queryClient.setQueryData(
          queryKeys.notifications.unread(user.id),
          notifications
        );

        // Update notification store if available
        import('@/app/store/notification-store').then(({ useNotificationStore }) => {
          const addNotification = useNotificationStore.getState().addNotification;
          
          // Process new notifications
          notifications.forEach(notification => {
            if (!notification.processed) {
              addNotification({
                type: notification.type || 'info',
                title: notification.title,
                message: notification.message,
                priority: notification.priority || 'normal',
                persistent: notification.persistent || false,
                metadata: notification.metadata
              });
            }
          });
        });
      }
    );

    subscriptionsRef.current.push(subscriptionId);
  }, [user, syncNotifications, queryClient]);

  // Sync wallet balance for operators
  const syncWalletBalance = useCallback(() => {
    if (!user || !syncWallet || user.role !== 'operator') return;

    const subscriptionId = RealtimeService.subscribeToWalletBalance(
      user.id,
      (wallet) => {
        // Update React Query cache
        queryClient.setQueryData(
          queryKeys.earnings.walletBalance(user.id),
          wallet
        );

        // Invalidate related earnings queries
        queryClient.invalidateQueries({
          queryKey: queryKeys.earnings.operatorEarnings(user.id)
        });
      }
    );

    subscriptionsRef.current.push(subscriptionId);
  }, [user, syncWallet, queryClient]);

  // Sync operator status (for real-time presence)
  const syncStatus = useCallback(() => {
    if (!user || !syncOperatorStatus || user.role !== 'operator') return;

    const subscriptionId = RealtimeService.subscribeToOperatorStatus(
      user.id,
      (status) => {
        // Update React Query cache for real-time data
        queryClient.setQueryData(
          queryKeys.realtime.operatorStatus(),
          (prev: any) => ({
            ...prev,
            [user.id]: status
          })
        );
      }
    );

    subscriptionsRef.current.push(subscriptionId);

    // Update operator status to online
    RealtimeService.updateOperatorStatus(user.id, {
      status: 'working',
      lastActivity: Date.now(),
      machineStatus: 'running'
    }).catch(onError);
  }, [user, syncOperatorStatus, queryClient, onError]);

  // Initialize all subscriptions
  const initializeSubscriptions = useCallback(() => {
    if (!enabled || !user) return;

    try {
      syncUserWorkItems();
      syncDamageReports();
      syncUserNotifications();
      syncWalletBalance();
      syncStatus();

      console.log(`🔄 Initialized ${subscriptionsRef.current.length} real-time subscriptions for ${user.name}`);
    } catch (error) {
      console.error('Error initializing real-time subscriptions:', error);
      onError?.(error);
    }
  }, [
    enabled, 
    user, 
    syncUserWorkItems, 
    syncDamageReports, 
    syncUserNotifications, 
    syncWalletBalance, 
    syncStatus,
    onError
  ]);

  // Cleanup all subscriptions
  const cleanupSubscriptions = useCallback(() => {
    subscriptionsRef.current.forEach(subscriptionId => {
      RealtimeService.removeSubscription(subscriptionId);
    });
    subscriptionsRef.current = [];

    // Update operator status to offline when cleaning up
    if (user && user.role === 'operator') {
      RealtimeService.updateOperatorStatus(user.id, {
        status: 'offline',
        lastActivity: Date.now()
      }).catch(onError);
    }

    console.log('🔄 Cleaned up real-time subscriptions');
  }, [user, onError]);

  // Effect for managing subscriptions lifecycle
  useEffect(() => {
    if (enabled && user) {
      initializeSubscriptions();
    }

    return () => {
      cleanupSubscriptions();
    };
  }, [enabled, user?.id]); // Only re-run when enabled or user ID changes

  // Effect for cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSubscriptions();
    };
  }, []);

  // Return subscription management functions
  return {
    isEnabled: enabled && !!user,
    subscriptionCount: subscriptionsRef.current.length,
    reinitialize: initializeSubscriptions,
    cleanup: cleanupSubscriptions,
    getStats: () => RealtimeService.getSubscriptionStats()
  };
};

// Hook for live metrics (management/supervisors)
export const useLiveMetrics = (enabled = true) => {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const subscriptionId = RealtimeService.subscribeToLiveMetrics((metrics) => {
      queryClient.setQueryData(queryKeys.realtime.liveMetrics(), metrics);
    });

    subscriptionRef.current = subscriptionId;

    return () => {
      if (subscriptionRef.current) {
        RealtimeService.removeSubscription(subscriptionRef.current);
      }
    };
  }, [enabled, queryClient]);

  return {
    isSubscribed: !!subscriptionRef.current
  };
};

// Hook for work progress tracking
export const useWorkProgress = (workId: string, enabled = true) => {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !workId) return;

    const subscriptionId = RealtimeService.subscribeToWorkProgress(
      workId,
      (progress) => {
        queryClient.setQueryData(
          queryKeys.realtime.workProgress(),
          (prev: any) => ({
            ...prev,
            [workId]: progress
          })
        );
      }
    );

    subscriptionRef.current = subscriptionId;

    return () => {
      if (subscriptionRef.current) {
        RealtimeService.removeSubscription(subscriptionRef.current);
      }
    };
  }, [enabled, workId, queryClient]);

  return {
    isSubscribed: !!subscriptionRef.current,
    updateProgress: (progress: any) => 
      RealtimeService.updateWorkProgress(workId, progress)
  };
};