// Realtime Production Service - Firebase Realtime Database integration
// Handles real-time updates for production tracking, operator status, and live metrics

import { rtdb } from '../config/firebase';
import {
  ref,
  push,
  set,
  get,
  onValue,
  off,
  serverTimestamp,
  child,
  query,
  orderByChild,
  equalTo,
  limitToLast,
  DataSnapshot
} from 'firebase/database';

// Realtime interfaces for production tracking
export interface RealtimeOperatorStatus {
  operatorId: string;
  operatorName: string;
  status: 'online' | 'working' | 'break' | 'offline';
  currentLot?: string;
  currentOperation?: string;
  machineType?: string;
  startTime?: number;
  lastActivity: number;
  todayPieces: number;
  todayEarnings: number;
  location: string;
}

export interface RealtimeWorkProgress {
  lotNumber: string;
  stepId: string;
  operatorId: string;
  operation: string;
  machineType: string;
  color: string;
  size: string;
  assignedPieces: number;
  completedPieces: number;
  progressPercentage: number;
  startTime: number;
  lastUpdate: number;
  estimatedCompletion: number;
  status: 'assigned' | 'in_progress' | 'completed' | 'paused';
}

export interface RealtimeStationStatus {
  stationId: string;
  machineType: string;
  operatorId?: string;
  operatorName?: string;
  status: 'idle' | 'running' | 'maintenance' | 'offline';
  currentWork?: {
    lotNumber: string;
    operation: string;
    pieces: number;
    startTime: number;
  };
  efficiency: number;
  lastMaintenance: number;
  nextMaintenance: number;
  todayProduction: number;
  alerts: string[];
}

export interface RealtimeLiveMetrics {
  totalOperatorsOnline: number;
  totalOperatorsWorking: number;
  activeLots: number;
  completedPiecesToday: number;
  todayRevenue: number;
  averageEfficiency: number;
  machineUtilization: {
    [machineType: string]: {
      total: number;
      active: number;
      utilization: number;
    };
  };
  hourlyProduction: {
    [hour: string]: number;
  };
  lastUpdate: number;
}

export interface RealtimeNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  targetUsers: string[];
  data?: any;
  timestamp: number;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

class RealtimeProductionService {
  private listeners: Map<string, any> = new Map();

  // Operator Status Management
  async updateOperatorStatus(operatorId: string, status: Partial<RealtimeOperatorStatus>): Promise<void> {
    try {
      const statusRef = ref(rtdb, `operator_status/${operatorId}`);
      await set(statusRef, {
        ...status,
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating operator status:', error);
      throw error;
    }
  }

  subscribeToOperatorStatus(operatorId: string, callback: (status: RealtimeOperatorStatus | null) => void): () => void {
    const statusRef = ref(rtdb, `operator_status/${operatorId}`);
    const listenerId = `operator_status_${operatorId}`;

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      callback(data ? { operatorId, ...data } : null);
    });

    this.listeners.set(listenerId, unsubscribe);

    return () => {
      if (this.listeners.has(listenerId)) {
        this.listeners.get(listenerId)();
        this.listeners.delete(listenerId);
      }
    };
  }

  subscribeToAllOperatorStatuses(callback: (statuses: RealtimeOperatorStatus[]) => void): () => void {
    const statusRef = ref(rtdb, 'operator_status');
    const listenerId = 'all_operator_statuses';

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      const statuses: RealtimeOperatorStatus[] = [];
      
      if (data) {
        Object.entries(data).forEach(([operatorId, statusData]: [string, any]) => {
          statuses.push({
            operatorId,
            ...statusData
          });
        });
      }
      
      callback(statuses);
    });

    this.listeners.set(listenerId, unsubscribe);

    return () => {
      if (this.listeners.has(listenerId)) {
        this.listeners.get(listenerId)();
        this.listeners.delete(listenerId);
      }
    };
  }

  // Work Progress Tracking
  async updateWorkProgress(progressId: string, progress: Partial<RealtimeWorkProgress>): Promise<void> {
    try {
      const progressRef = ref(rtdb, `work_progress/${progressId}`);
      await set(progressRef, {
        ...progress,
        lastUpdate: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating work progress:', error);
      throw error;
    }
  }

  async startWorkProgress(operatorId: string, lotNumber: string, stepId: string, workData: Omit<RealtimeWorkProgress, 'startTime' | 'lastUpdate' | 'progressPercentage' | 'estimatedCompletion' | 'status'>): Promise<string> {
    try {
      const progressRef = ref(rtdb, 'work_progress');
      const newProgressRef = push(progressRef);
      const progressId = newProgressRef.key!;

      const estimatedMinutes = 10; // This should come from process template
      const estimatedCompletion = Date.now() + (estimatedMinutes * 60 * 1000);

      const fullWorkData: RealtimeWorkProgress = {
        ...workData,
        startTime: Date.now(),
        lastUpdate: Date.now(),
        progressPercentage: 0,
        estimatedCompletion,
        status: 'in_progress'
      };

      await set(newProgressRef, fullWorkData);

      // Update operator status
      await this.updateOperatorStatus(operatorId, {
        status: 'working',
        currentLot: lotNumber,
        currentOperation: workData.operation,
        machineType: workData.machineType,
        startTime: Date.now()
      });

      return progressId;
    } catch (error) {
      console.error('Error starting work progress:', error);
      throw error;
    }
  }

  subscribeToWorkProgress(lotNumber: string, callback: (progress: RealtimeWorkProgress[]) => void): () => void {
    const progressRef = query(
      ref(rtdb, 'work_progress'),
      orderByChild('lotNumber'),
      equalTo(lotNumber)
    );
    const listenerId = `work_progress_${lotNumber}`;

    const unsubscribe = onValue(progressRef, (snapshot) => {
      const data = snapshot.val();
      const progress: RealtimeWorkProgress[] = [];
      
      if (data) {
        Object.values(data).forEach((progressData: any) => {
          progress.push(progressData);
        });
      }
      
      callback(progress.sort((a, b) => a.startTime - b.startTime));
    });

    this.listeners.set(listenerId, unsubscribe);

    return () => {
      if (this.listeners.has(listenerId)) {
        this.listeners.get(listenerId)();
        this.listeners.delete(listenerId);
      }
    };
  }

  // Station Status Management
  async updateStationStatus(stationId: string, status: Partial<RealtimeStationStatus>): Promise<void> {
    try {
      const stationRef = ref(rtdb, `station_status/${stationId}`);
      const currentData = await get(stationRef);
      const existingData = currentData.val() || {};

      await set(stationRef, {
        ...existingData,
        ...status,
        lastUpdate: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating station status:', error);
      throw error;
    }
  }

  subscribeToStationStatuses(callback: (stations: RealtimeStationStatus[]) => void): () => void {
    const stationsRef = ref(rtdb, 'station_status');
    const listenerId = 'all_station_statuses';

    const unsubscribe = onValue(stationsRef, (snapshot) => {
      const data = snapshot.val();
      const stations: RealtimeStationStatus[] = [];
      
      if (data) {
        Object.entries(data).forEach(([stationId, stationData]: [string, any]) => {
          stations.push({
            stationId,
            ...stationData
          });
        });
      }
      
      callback(stations);
    });

    this.listeners.set(listenerId, unsubscribe);

    return () => {
      if (this.listeners.has(listenerId)) {
        this.listeners.get(listenerId)();
        this.listeners.delete(listenerId);
      }
    };
  }

  // Live Metrics
  async updateLiveMetrics(metrics: Partial<RealtimeLiveMetrics>): Promise<void> {
    try {
      const metricsRef = ref(rtdb, 'live_metrics');
      const currentData = await get(metricsRef);
      const existingData = currentData.val() || {};

      await set(metricsRef, {
        ...existingData,
        ...metrics,
        lastUpdate: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating live metrics:', error);
      throw error;
    }
  }

  subscribeToLiveMetrics(callback: (metrics: RealtimeLiveMetrics | null) => void): () => void {
    const metricsRef = ref(rtdb, 'live_metrics');
    const listenerId = 'live_metrics';

    const unsubscribe = onValue(metricsRef, (snapshot) => {
      const data = snapshot.val();
      callback(data);
    });

    this.listeners.set(listenerId, unsubscribe);

    return () => {
      if (this.listeners.has(listenerId)) {
        this.listeners.get(listenerId)();
        this.listeners.delete(listenerId);
      }
    };
  }

  // Notifications
  async sendNotification(notification: Omit<RealtimeNotification, 'id' | 'timestamp' | 'read'>): Promise<string> {
    try {
      const notificationsRef = ref(rtdb, 'notifications');
      const newNotificationRef = push(notificationsRef);
      const notificationId = newNotificationRef.key!;

      const fullNotification: RealtimeNotification = {
        ...notification,
        id: notificationId,
        timestamp: Date.now(),
        read: false
      };

      await set(newNotificationRef, fullNotification);
      return notificationId;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  subscribeToNotifications(userId: string, callback: (notifications: RealtimeNotification[]) => void): () => void {
    const notificationsRef = ref(rtdb, 'notifications');
    const listenerId = `notifications_${userId}`;

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      const notifications: RealtimeNotification[] = [];
      
      if (data) {
        Object.values(data).forEach((notificationData: any) => {
          const notification = notificationData as RealtimeNotification;
          // Filter notifications for this user
          if (notification.targetUsers.includes(userId) || notification.targetUsers.includes('all')) {
            notifications.push(notification);
          }
        });
      }
      
      // Sort by timestamp (newest first)
      notifications.sort((a, b) => b.timestamp - a.timestamp);
      callback(notifications);
    });

    this.listeners.set(listenerId, unsubscribe);

    return () => {
      if (this.listeners.has(listenerId)) {
        this.listeners.get(listenerId)();
        this.listeners.delete(listenerId);
      }
    };
  }

  // Utility Methods
  async markOperatorOffline(operatorId: string): Promise<void> {
    try {
      await this.updateOperatorStatus(operatorId, {
        status: 'offline',
        currentLot: undefined,
        currentOperation: undefined,
        machineType: undefined,
        startTime: undefined
      });
    } catch (error) {
      console.error('Error marking operator offline:', error);
      throw error;
    }
  }

  async completeWork(progressId: string, completedPieces: number, operatorId: string): Promise<void> {
    try {
      // Update work progress
      const progressRef = ref(rtdb, `work_progress/${progressId}`);
      await set(progressRef, null); // Remove completed work from active progress

      // Update operator status to idle
      await this.updateOperatorStatus(operatorId, {
        status: 'online',
        currentLot: undefined,
        currentOperation: undefined,
        machineType: undefined,
        startTime: undefined
      });

      // Send completion notification
      await this.sendNotification({
        type: 'success',
        title: 'Work Completed',
        message: `${completedPieces} pieces completed successfully`,
        targetUsers: ['supervisors', 'management'],
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error completing work:', error);
      throw error;
    }
  }

  // Calculate realtime statistics
  async calculateLiveMetrics(): Promise<void> {
    try {
      const [operatorsSnapshot, progressSnapshot, stationsSnapshot] = await Promise.all([
        get(ref(rtdb, 'operator_status')),
        get(ref(rtdb, 'work_progress')),
        get(ref(rtdb, 'station_status'))
      ]);

      const operators = operatorsSnapshot.val() || {};
      const progress = progressSnapshot.val() || {};
      const stations = stationsSnapshot.val() || {};

      // Calculate operator metrics
      const operatorStatuses = Object.values(operators) as RealtimeOperatorStatus[];
      const totalOperatorsOnline = operatorStatuses.filter(op => op.status !== 'offline').length;
      const totalOperatorsWorking = operatorStatuses.filter(op => op.status === 'working').length;

      // Calculate production metrics
      const workItems = Object.values(progress) as RealtimeWorkProgress[];
      const activeLots = new Set(workItems.map(w => w.lotNumber)).size;
      const completedPiecesToday = operatorStatuses.reduce((sum, op) => sum + op.todayPieces, 0);
      const todayRevenue = operatorStatuses.reduce((sum, op) => sum + op.todayEarnings, 0);

      // Calculate machine utilization
      const stationList = Object.values(stations) as RealtimeStationStatus[];
      const machineUtilization: { [key: string]: any } = {};
      
      stationList.forEach(station => {
        if (!machineUtilization[station.machineType]) {
          machineUtilization[station.machineType] = { total: 0, active: 0, utilization: 0 };
        }
        machineUtilization[station.machineType].total++;
        if (station.status === 'running') {
          machineUtilization[station.machineType].active++;
        }
      });

      // Calculate utilization percentages
      Object.keys(machineUtilization).forEach(machineType => {
        const machine = machineUtilization[machineType];
        machine.utilization = machine.total > 0 ? (machine.active / machine.total) * 100 : 0;
      });

      // Calculate average efficiency
      const averageEfficiency = stationList.length > 0 
        ? stationList.reduce((sum, station) => sum + station.efficiency, 0) / stationList.length 
        : 0;

      // Generate hourly production data (simplified)
      const hourlyProduction: { [key: string]: number } = {};
      const currentHour = new Date().getHours();
      for (let i = 0; i < 24; i++) {
        hourlyProduction[i.toString()] = i <= currentHour ? Math.floor(Math.random() * 100) : 0;
      }

      const liveMetrics: RealtimeLiveMetrics = {
        totalOperatorsOnline,
        totalOperatorsWorking,
        activeLots,
        completedPiecesToday,
        todayRevenue,
        averageEfficiency,
        machineUtilization,
        hourlyProduction,
        lastUpdate: Date.now()
      };

      await this.updateLiveMetrics(liveMetrics);
    } catch (error) {
      console.error('Error calculating live metrics:', error);
      throw error;
    }
  }

  // Cleanup method
  cleanup(): void {
    this.listeners.forEach((unsubscribe) => {
      unsubscribe();
    });
    this.listeners.clear();
  }

  // Start periodic metrics calculation
  startMetricsCalculation(intervalMs: number = 60000): () => void {
    const interval = setInterval(() => {
      this.calculateLiveMetrics();
    }, intervalMs);

    return () => clearInterval(interval);
  }
}

export const realtimeProductionService = new RealtimeProductionService();
export default realtimeProductionService;