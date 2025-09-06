import { RealtimeService } from './realtime-service';
import { ConnectionMonitor } from './connection-monitor';

interface Subscription {
  id: string;
  userId: string;
  type: 'user_work' | 'damage_reports' | 'notifications' | 'wallet' | 'operator_status' | 'work_progress' | 'live_metrics';
  params?: Record<string, any>;
  unsubscribe: () => void;
  callback: Function;
  createdAt: number;
  lastActivity: number;
  isActive: boolean;
}

interface SubscriptionStats {
  total: number;
  active: number;
  byType: Record<string, number>;
  byUser: Record<string, number>;
  memoryUsage: number;
}

class SubscriptionManagerService {
  private subscriptions = new Map<string, Subscription>();
  private userSubscriptions = new Map<string, Set<string>>();
  private connectionCallbacks = new Map<string, Function>();
  private cleanupInterval: NodeJS.Timeout | null = null;
  private maxSubscriptionsPerUser = 20;
  private subscriptionTimeout = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.startCleanupRoutine();
    this.setupConnectionHandling();
  }

  /**
   * Subscribe user to their work items
   */
  subscribeUserToWork(
    userId: string, 
    callback: (workItems: any[]) => void
  ): string {
    const subscriptionId = this.createSubscription(
      userId,
      'user_work',
      callback,
      () => RealtimeService.subscribeToUserWork(userId, callback)
    );

    return subscriptionId;
  }

  /**
   * Subscribe supervisor to damage reports
   */
  subscribeToDamageReports(
    supervisorId: string,
    callback: (reports: any[]) => void
  ): string {
    const subscriptionId = this.createSubscription(
      supervisorId,
      'damage_reports',
      callback,
      () => RealtimeService.subscribeToDamageReports(supervisorId, callback)
    );

    return subscriptionId;
  }

  /**
   * Subscribe to user notifications
   */
  subscribeToNotifications(
    userId: string,
    callback: (notifications: any[]) => void
  ): string {
    const subscriptionId = this.createSubscription(
      userId,
      'notifications',
      callback,
      () => RealtimeService.subscribeToNotifications(userId, callback)
    );

    return subscriptionId;
  }

  /**
   * Subscribe to operator wallet balance
   */
  subscribeToWallet(
    operatorId: string,
    callback: (wallet: any) => void
  ): string {
    const subscriptionId = this.createSubscription(
      operatorId,
      'wallet',
      callback,
      () => RealtimeService.subscribeToWalletBalance(operatorId, callback)
    );

    return subscriptionId;
  }

  /**
   * Subscribe to operator status
   */
  subscribeToOperatorStatus(
    operatorId: string,
    callback: (status: any) => void
  ): string {
    const subscriptionId = this.createSubscription(
      operatorId,
      'operator_status',
      callback,
      () => RealtimeService.subscribeToOperatorStatus(operatorId, callback)
    );

    return subscriptionId;
  }

  /**
   * Subscribe to work progress
   */
  subscribeToWorkProgress(
    workId: string,
    userId: string,
    callback: (progress: any) => void
  ): string {
    const subscriptionId = this.createSubscription(
      userId,
      'work_progress',
      callback,
      () => RealtimeService.subscribeToWorkProgress(workId, callback),
      { workId }
    );

    return subscriptionId;
  }

  /**
   * Subscribe to live metrics
   */
  subscribeToLiveMetrics(
    userId: string,
    callback: (metrics: any) => void
  ): string {
    const subscriptionId = this.createSubscription(
      userId,
      'live_metrics',
      callback,
      () => RealtimeService.subscribeToLiveMetrics(callback)
    );

    return subscriptionId;
  }

  /**
   * Generic subscription creation
   */
  private createSubscription(
    userId: string,
    type: Subscription['type'],
    callback: Function,
    subscribeFunction: () => string,
    params?: Record<string, any>
  ): string {
    // Check subscription limits
    if (!this.canCreateSubscription(userId)) {
      throw new Error(`Maximum subscriptions (${this.maxSubscriptionsPerUser}) reached for user: ${userId}`);
    }

    // Create the actual subscription
    const realtimeSubscriptionId = subscribeFunction();
    
    const subscription: Subscription = {
      id: realtimeSubscriptionId,
      userId,
      type,
      params,
      unsubscribe: () => RealtimeService.removeSubscription(realtimeSubscriptionId),
      callback,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      isActive: true,
    };

    // Store subscription
    this.subscriptions.set(realtimeSubscriptionId, subscription);
    
    // Track user subscriptions
    if (!this.userSubscriptions.has(userId)) {
      this.userSubscriptions.set(userId, new Set());
    }
    this.userSubscriptions.get(userId)!.add(realtimeSubscriptionId);

    console.log(`Created subscription: ${type} for user: ${userId}`);
    return realtimeSubscriptionId;
  }

  /**
   * Remove a specific subscription
   */
  removeSubscription(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;

    // Unsubscribe from realtime service
    subscription.unsubscribe();
    
    // Remove from tracking
    this.subscriptions.delete(subscriptionId);
    
    // Remove from user subscriptions
    const userSubs = this.userSubscriptions.get(subscription.userId);
    if (userSubs) {
      userSubs.delete(subscriptionId);
      if (userSubs.size === 0) {
        this.userSubscriptions.delete(subscription.userId);
      }
    }

    console.log(`Removed subscription: ${subscriptionId}`);
    return true;
  }

  /**
   * Remove all subscriptions for a user
   */
  removeUserSubscriptions(userId: string): number {
    const userSubs = this.userSubscriptions.get(userId);
    if (!userSubs) return 0;

    let removed = 0;
    for (const subscriptionId of userSubs) {
      if (this.removeSubscription(subscriptionId)) {
        removed++;
      }
    }

    console.log(`Removed ${removed} subscriptions for user: ${userId}`);
    return removed;
  }

  /**
   * Update subscription activity timestamp
   */
  updateSubscriptionActivity(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.lastActivity = Date.now();
    }
  }

  /**
   * Check if user can create more subscriptions
   */
  private canCreateSubscription(userId: string): boolean {
    const userSubs = this.userSubscriptions.get(userId);
    return !userSubs || userSubs.size < this.maxSubscriptionsPerUser;
  }

  /**
   * Get subscription statistics
   */
  getStats(): SubscriptionStats {
    const stats: SubscriptionStats = {
      total: this.subscriptions.size,
      active: Array.from(this.subscriptions.values()).filter(sub => sub.isActive).length,
      byType: {},
      byUser: {},
      memoryUsage: 0,
    };

    // Calculate stats
    for (const subscription of this.subscriptions.values()) {
      // By type
      stats.byType[subscription.type] = (stats.byType[subscription.type] || 0) + 1;
      
      // By user
      stats.byUser[subscription.userId] = (stats.byUser[subscription.userId] || 0) + 1;
    }

    // Rough memory usage calculation
    stats.memoryUsage = this.subscriptions.size * 1024; // Rough estimate

    return stats;
  }

  /**
   * Get subscriptions for a specific user
   */
  getUserSubscriptions(userId: string): Subscription[] {
    const userSubIds = this.userSubscriptions.get(userId);
    if (!userSubIds) return [];

    return Array.from(userSubIds)
      .map(id => this.subscriptions.get(id))
      .filter(Boolean) as Subscription[];
  }

  /**
   * Pause a subscription
   */
  pauseSubscription(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;

    subscription.isActive = false;
    subscription.unsubscribe();
    
    console.log(`Paused subscription: ${subscriptionId}`);
    return true;
  }

  /**
   * Resume a paused subscription
   */
  resumeSubscription(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return false;

    subscription.isActive = true;
    subscription.lastActivity = Date.now();
    
    // Recreate the subscription based on type
    try {
      const newUnsubscribe = this.recreateSubscription(subscription);
      subscription.unsubscribe = newUnsubscribe;
      
      console.log(`Resumed subscription: ${subscriptionId}`);
      return true;
    } catch (error) {
      console.error(`Failed to resume subscription: ${subscriptionId}`, error);
      return false;
    }
  }

  /**
   * Recreate subscription based on type
   */
  private recreateSubscription(subscription: Subscription): () => void {
    const { userId, type, callback, params } = subscription;
    
    switch (type) {
      case 'user_work':
        return () => RealtimeService.removeSubscription(
          RealtimeService.subscribeToUserWork(userId, callback)
        );
      case 'damage_reports':
        return () => RealtimeService.removeSubscription(
          RealtimeService.subscribeToDamageReports(userId, callback)
        );
      case 'notifications':
        return () => RealtimeService.removeSubscription(
          RealtimeService.subscribeToNotifications(userId, callback)
        );
      case 'wallet':
        return () => RealtimeService.removeSubscription(
          RealtimeService.subscribeToWalletBalance(userId, callback)
        );
      case 'operator_status':
        return () => RealtimeService.removeSubscription(
          RealtimeService.subscribeToOperatorStatus(userId, callback)
        );
      case 'work_progress':
        return () => RealtimeService.removeSubscription(
          RealtimeService.subscribeToWorkProgress(params?.workId || '', callback)
        );
      case 'live_metrics':
        return () => RealtimeService.removeSubscription(
          RealtimeService.subscribeToLiveMetrics(callback)
        );
      default:
        throw new Error(`Unknown subscription type: ${type}`);
    }
  }

  /**
   * Set up connection handling
   */
  private setupConnectionHandling(): void {
    // Handle reconnection - resume all subscriptions
    const onReconnect = () => {
      console.log('Connection restored, resuming subscriptions...');
      
      for (const subscription of this.subscriptions.values()) {
        if (subscription.isActive) {
          try {
            this.resumeSubscription(subscription.id);
          } catch (error) {
            console.error(`Failed to resume subscription on reconnect: ${subscription.id}`, error);
          }
        }
      }
    };

    // Handle disconnection - pause subscriptions
    const onDisconnect = () => {
      console.log('Connection lost, pausing subscriptions...');
      
      for (const subscription of this.subscriptions.values()) {
        if (subscription.isActive) {
          this.pauseSubscription(subscription.id);
        }
      }
    };

    this.connectionCallbacks.set('reconnect', onReconnect);
    this.connectionCallbacks.set('disconnect', onDisconnect);
  }

  /**
   * Start cleanup routine for inactive subscriptions
   */
  private startCleanupRoutine(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveSubscriptions();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Clean up inactive subscriptions
   */
  private cleanupInactiveSubscriptions(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [id, subscription] of this.subscriptions.entries()) {
      const timeSinceActivity = now - subscription.lastActivity;
      
      if (timeSinceActivity > this.subscriptionTimeout) {
        toRemove.push(id);
      }
    }

    if (toRemove.length > 0) {
      console.log(`Cleaning up ${toRemove.length} inactive subscriptions`);
      toRemove.forEach(id => this.removeSubscription(id));
    }
  }

  /**
   * Clean up service
   */
  cleanup(): void {
    // Clear cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Remove all subscriptions
    for (const subscription of this.subscriptions.values()) {
      subscription.unsubscribe();
    }

    // Clear all data
    this.subscriptions.clear();
    this.userSubscriptions.clear();
    this.connectionCallbacks.clear();

    console.log('Subscription manager cleaned up');
  }

  /**
   * Export subscription data for debugging
   */
  exportSubscriptionData() {
    return {
      subscriptions: Array.from(this.subscriptions.entries()).map(([id, sub]) => ({
        id,
        userId: sub.userId,
        type: sub.type,
        params: sub.params,
        createdAt: new Date(sub.createdAt).toISOString(),
        lastActivity: new Date(sub.lastActivity).toISOString(),
        isActive: sub.isActive,
        age: Date.now() - sub.createdAt,
        inactive: Date.now() - sub.lastActivity,
      })),
      stats: this.getStats(),
    };
  }
}

export const SubscriptionManager = new SubscriptionManagerService();