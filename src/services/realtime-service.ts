// src/services/realtime-service.ts
import { 
  onSnapshot, 
  query, 
  collection, 
  where, 
  orderBy, 
  limit
} from 'firebase/firestore';
import type { DocumentData, Unsubscribe } from 'firebase/firestore';
import { 
  ref, 
  onValue, 
  off, 
  set, 
  update, 
  remove
} from 'firebase/database';
import type { DatabaseReference, Unsubscribe as RTUnsubscribe } from 'firebase/database';
import { db, rtdb, COLLECTIONS, RT_PATHS } from '../config/firebase';

// Types
interface RealtimeSubscription {
  id: string;
  type: 'firestore' | 'realtime';
  unsubscribe: Unsubscribe | RTUnsubscribe;
  callback: Function;
  active: boolean;
}

interface OperatorStatus {
  status: 'working' | 'break' | 'offline';
  currentWork: string | null;
  lastActivity: number;
  machineStatus: 'running' | 'stopped' | 'maintenance';
}

interface WorkProgress {
  completedPieces: number;
  remainingPieces: number;
  efficiency: number;
  estimatedCompletion: number;
  lastUpdate: number;
}

interface LiveMetrics {
  daily: {
    totalPieces: number;
    completedOrders: number;
    activeOperators: number;
    efficiency: number;
  };
}

export class RealtimeService {
  private static subscriptions: Map<string, RealtimeSubscription> = new Map();

  // Firestore real-time subscriptions
  
  /**
   * Subscribe to user's work items with real-time updates
   */
  static subscribeToUserWork(
    operatorId: string, 
    callback: (workItems: DocumentData[]) => void
  ): string {
    const subscriptionId = `work_${operatorId}_${Date.now()}`;
    
    const q = query(
      collection(db, COLLECTIONS.WORK_ITEMS),
      where('operatorId', '==', operatorId),
      where('status', 'in', ['assigned', 'in_progress']),
      orderBy('assignedAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const workItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(workItems);
      },
      (error) => {
        console.error('Error in work subscription:', error);
        this.removeSubscription(subscriptionId);
      }
    );

    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      type: 'firestore',
      unsubscribe,
      callback,
      active: true
    });

    return subscriptionId;
  }

  /**
   * Subscribe to supervisor's damage reports queue
   */
  static subscribeToDamageReports(
    supervisorId: string,
    callback: (reports: DocumentData[]) => void
  ): string {
    const subscriptionId = `damage_${supervisorId}_${Date.now()}`;
    
    const q = query(
      collection(db, COLLECTIONS.DAMAGE_REPORTS),
      where('supervisorId', '==', supervisorId),
      where('status', 'in', ['reported', 'acknowledged', 'rework_in_progress']),
      orderBy('reportedAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const reports = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(reports);
      },
      (error) => {
        console.error('Error in damage reports subscription:', error);
        this.removeSubscription(subscriptionId);
      }
    );

    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      type: 'firestore',
      unsubscribe,
      callback,
      active: true
    });

    return subscriptionId;
  }

  /**
   * Subscribe to user notifications
   */
  static subscribeToNotifications(
    userId: string,
    callback: (notifications: DocumentData[]) => void
  ): string {
    const subscriptionId = `notifications_${userId}_${Date.now()}`;
    
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('recipientId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(notifications);
      },
      (error) => {
        console.error('Error in notifications subscription:', error);
        this.removeSubscription(subscriptionId);
      }
    );

    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      type: 'firestore',
      unsubscribe,
      callback,
      active: true
    });

    return subscriptionId;
  }

  /**
   * Subscribe to operator wallet balance
   */
  static subscribeToWalletBalance(
    operatorId: string,
    callback: (wallet: DocumentData | null) => void
  ): string {
    const subscriptionId = `wallet_${operatorId}_${Date.now()}`;
    
    const q = query(
      collection(db, COLLECTIONS.OPERATOR_WALLETS),
      where('operatorId', '==', operatorId),
      limit(1)
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const wallet = snapshot.docs.length > 0 ? {
          id: snapshot.docs[0].id,
          ...snapshot.docs[0].data()
        } : null;
        callback(wallet);
      },
      (error) => {
        console.error('Error in wallet subscription:', error);
        this.removeSubscription(subscriptionId);
      }
    );

    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      type: 'firestore',
      unsubscribe,
      callback,
      active: true
    });

    return subscriptionId;
  }

  // Realtime Database subscriptions (for live status updates)

  /**
   * Subscribe to operator status updates
   */
  static subscribeToOperatorStatus(
    operatorId: string,
    callback: (status: OperatorStatus | null) => void
  ): string {
    const subscriptionId = `operator_status_${operatorId}_${Date.now()}`;
    const statusRef = ref(rtdb, `${RT_PATHS.OPERATOR_STATUS}/${operatorId}`);

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const status = snapshot.exists() ? snapshot.val() as OperatorStatus : null;
      callback(status);
    }, (error) => {
      console.error('Error in operator status subscription:', error);
      this.removeSubscription(subscriptionId);
    });

    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      type: 'realtime',
      unsubscribe,
      callback,
      active: true
    });

    return subscriptionId;
  }

  /**
   * Subscribe to work progress updates
   */
  static subscribeToWorkProgress(
    workId: string,
    callback: (progress: WorkProgress | null) => void
  ): string {
    const subscriptionId = `work_progress_${workId}_${Date.now()}`;
    const progressRef = ref(rtdb, `${RT_PATHS.WORK_PROGRESS}/${workId}`);

    const unsubscribe = onValue(progressRef, (snapshot) => {
      const progress = snapshot.exists() ? snapshot.val() as WorkProgress : null;
      callback(progress);
    }, (error) => {
      console.error('Error in work progress subscription:', error);
      this.removeSubscription(subscriptionId);
    });

    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      type: 'realtime',
      unsubscribe,
      callback,
      active: true
    });

    return subscriptionId;
  }

  /**
   * Subscribe to live metrics
   */
  static subscribeToLiveMetrics(
    callback: (metrics: LiveMetrics | null) => void
  ): string {
    const subscriptionId = `live_metrics_${Date.now()}`;
    const metricsRef = ref(rtdb, RT_PATHS.LIVE_METRICS);

    const unsubscribe = onValue(metricsRef, (snapshot) => {
      const metrics = snapshot.exists() ? snapshot.val() as LiveMetrics : null;
      callback(metrics);
    }, (error) => {
      console.error('Error in live metrics subscription:', error);
      this.removeSubscription(subscriptionId);
    });

    this.subscriptions.set(subscriptionId, {
      id: subscriptionId,
      type: 'realtime',
      unsubscribe,
      callback,
      active: true
    });

    return subscriptionId;
  }

  // Data update methods for Realtime Database

  /**
   * Update operator status
   */
  static async updateOperatorStatus(operatorId: string, status: Partial<OperatorStatus>) {
    try {
      const statusRef = ref(rtdb, `${RT_PATHS.OPERATOR_STATUS}/${operatorId}`);
      await update(statusRef, {
        ...status,
        lastActivity: Date.now()
      });
    } catch (error) {
      console.error('Error updating operator status:', error);
    }
  }

  /**
   * Update work progress
   */
  static async updateWorkProgress(workId: string, progress: Partial<WorkProgress>) {
    try {
      const progressRef = ref(rtdb, `${RT_PATHS.WORK_PROGRESS}/${workId}`);
      await update(progressRef, {
        ...progress,
        lastUpdate: Date.now()
      });
    } catch (error) {
      console.error('Error updating work progress:', error);
    }
  }

  /**
   * Update live metrics
   */
  static async updateLiveMetrics(metrics: Partial<LiveMetrics>) {
    try {
      const metricsRef = ref(rtdb, RT_PATHS.LIVE_METRICS);
      await update(metricsRef, metrics);
    } catch (error) {
      console.error('Error updating live metrics:', error);
    }
  }

  // Subscription management

  /**
   * Remove a specific subscription
   */
  static removeSubscription(subscriptionId: string): boolean {
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (subscription) {
      subscription.unsubscribe();
      subscription.active = false;
      this.subscriptions.delete(subscriptionId);
      console.log(`Removed subscription: ${subscriptionId}`);
      return true;
    }
    
    return false;
  }

  /**
   * Remove all subscriptions for a user
   */
  static removeUserSubscriptions(userId: string): number {
    let removed = 0;
    
    for (const [id, subscription] of this.subscriptions.entries()) {
      if (id.includes(userId)) {
        subscription.unsubscribe();
        subscription.active = false;
        this.subscriptions.delete(id);
        removed++;
      }
    }
    
    console.log(`Removed ${removed} subscriptions for user: ${userId}`);
    return removed;
  }

  /**
   * Remove all active subscriptions
   */
  static removeAllSubscriptions(): number {
    const count = this.subscriptions.size;
    
    for (const subscription of this.subscriptions.values()) {
      subscription.unsubscribe();
      subscription.active = false;
    }
    
    this.subscriptions.clear();
    console.log(`Removed all ${count} subscriptions`);
    return count;
  }

  /**
   * Get subscription statistics
   */
  static getSubscriptionStats() {
    const active = Array.from(this.subscriptions.values()).filter(sub => sub.active).length;
    const inactive = this.subscriptions.size - active;
    
    return {
      total: this.subscriptions.size,
      active,
      inactive,
      subscriptions: Array.from(this.subscriptions.entries()).map(([id, sub]) => ({
        id,
        type: sub.type,
        active: sub.active
      }))
    };
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();

// Export types
export type { OperatorStatus, WorkProgress, LiveMetrics };