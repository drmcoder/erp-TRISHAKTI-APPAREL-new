// WebSocket Client Service
// Frontend service to connect to WebSocket server and handle real-time events

import { io, Socket } from 'socket.io-client';
import { realtimeService, OperatorStatus, LiveMetrics } from './core/realtime-service';

export interface WebSocketClientConfig {
  serverUrl: string;
  autoReconnect: boolean;
  reconnectionAttempts: number;
  reconnectionDelay: number;
  timeout: number;
}

export interface ConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  lastConnected?: Date;
  reconnectAttempts: number;
  error?: string;
}

export class WebSocketClient {
  private socket: Socket | null = null;
  private config: WebSocketClientConfig;
  private connectionState: ConnectionState = {
    status: 'disconnected',
    reconnectAttempts: 0
  };
  private eventListeners: Map<string, Function[]> = new Map();
  private userId: string | null = null;
  private userRole: string | null = null;

  constructor(config: WebSocketClientConfig) {
    this.config = config;
  }

  // Connect to WebSocket server
  async connect(userId: string, userRole: string, deviceId?: string): Promise<void> {
    if (this.connectionState.status === 'connected') {
      return;
    }

    this.userId = userId;
    this.userRole = userRole;
    this.connectionState.status = 'connecting';

    try {
      this.socket = io(this.config.serverUrl, {
        auth: {
          userId,
          userRole,
          deviceType: this.getDeviceType(),
          deviceId: deviceId || this.generateDeviceId()
        },
        transports: ['websocket', 'polling'],
        timeout: this.config.timeout,
        reconnection: this.config.autoReconnect,
        reconnectionAttempts: this.config.reconnectionAttempts,
        reconnectionDelay: this.config.reconnectionDelay,
        forceNew: true
      });

      this.setupEventListeners();

      // Wait for authentication
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, this.config.timeout);

        this.socket!.on('authenticated', (data) => {
          clearTimeout(timeout);
          this.connectionState = {
            status: 'connected',
            lastConnected: new Date(),
            reconnectAttempts: 0
          };
          console.log('✅ WebSocket connected and authenticated:', data);
          resolve();
        });

        this.socket!.on('auth_error', (error) => {
          clearTimeout(timeout);
          this.connectionState = {
            status: 'error',
            reconnectAttempts: this.connectionState.reconnectAttempts + 1,
            error: error.message
          };
          reject(new Error(error.message));
        });

        this.socket!.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });

        // Send authentication
        this.socket!.emit('authenticate', {
          userId,
          userRole,
          deviceType: this.getDeviceType(),
          deviceId: deviceId || this.generateDeviceId()
        });
      });

      // Emit connection event
      this.emit('connected', { userId, userRole });

    } catch (error) {
      this.connectionState = {
        status: 'error',
        reconnectAttempts: this.connectionState.reconnectAttempts + 1,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
      console.error('❌ WebSocket connection failed:', error);
      throw error;
    }
  }

  // Setup Socket.IO event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.connectionState.status = 'connected';
      this.connectionState.lastConnected = new Date();
      this.emit('connect');
    });

    this.socket.on('disconnect', (reason) => {
      this.connectionState.status = 'disconnected';
      this.emit('disconnect', reason);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      this.connectionState.status = 'connected';
      this.connectionState.reconnectAttempts = 0;
      this.emit('reconnect', attemptNumber);
    });

    this.socket.on('reconnect_error', () => {
      this.connectionState.reconnectAttempts++;
      this.emit('reconnect_error');
    });

    // Operator status events
    this.socket.on('operator_status_update', (data: OperatorStatus) => {
      this.emit('operator_status_update', data);
    });

    this.socket.on('operator_work_progress', (data) => {
      this.emit('operator_work_progress', data);
    });

    // Work assignment events
    this.socket.on('work_assigned', (data) => {
      this.emit('work_assigned', data);
      this.showNotification('Work Assigned', `New work assigned: ${data.bundleId}`, 'info');
    });

    this.socket.on('work_completed', (data) => {
      this.emit('work_completed', data);
    });

    // Production metrics
    this.socket.on('metrics_update', (metrics: LiveMetrics) => {
      this.emit('metrics_update', metrics);
    });

    // Quality alerts
    this.socket.on('quality_alert', (data) => {
      this.emit('quality_alert', data);
      this.showNotification('Quality Alert', `Quality issue in ${data.bundleId}: ${data.description}`, 'warning');
    });

    // Bundle status changes
    this.socket.on('bundle_status_change', (data) => {
      this.emit('bundle_status_change', data);
    });

    // Collaboration events
    this.socket.on('collaboration_join', (data) => {
      this.emit('collaboration_join', data);
    });

    this.socket.on('collaboration_leave', (data) => {
      this.emit('collaboration_leave', data);
    });

    this.socket.on('collaboration_cursor', (data) => {
      this.emit('collaboration_cursor', data);
    });

    this.socket.on('collaboration_note', (data) => {
      this.emit('collaboration_note', data);
    });

    // Emergency events
    this.socket.on('emergency_alert', (data) => {
      this.emit('emergency_alert', data);
      this.showNotification('Emergency Alert', `${data.type} at ${data.location}: ${data.description}`, 'error');
    });

    // System notifications
    this.socket.on('system_notification', (data) => {
      this.emit('system_notification', data);
      this.showNotification(data.title, data.message, data.type);
    });

    // User online/offline events
    this.socket.on('user_online', (data) => {
      this.emit('user_online', data);
    });

    this.socket.on('user_offline', (data) => {
      this.emit('user_offline', data);
    });
  }

  // Event emission and listening
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      const callbacks = this.eventListeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.eventListeners.delete(event);
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.eventListeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  // Operator status methods
  updateOperatorStatus(status: Partial<OperatorStatus>): void {
    if (!this.socket || !this.userId) return;

    this.socket.emit('update_operator_status', {
      userId: this.userId,
      ...status,
      lastSeen: new Date()
    });
  }

  updateWorkProgress(bundleId: string, progress: number, piecesCompleted: number): void {
    if (!this.socket || !this.userId) return;

    this.socket.emit('work_progress_update', {
      operatorId: this.userId,
      bundleId,
      progress,
      piecesCompleted,
      timestamp: new Date()
    });
  }

  reportQualityIssue(bundleId: string, issueType: string, severity: string, description: string): void {
    if (!this.socket || !this.userId) return;

    this.socket.emit('quality_issue_report', {
      bundleId,
      operatorId: this.userId,
      issueType,
      severity,
      description,
      timestamp: new Date()
    });
  }

  // Work assignment methods
  assignWork(bundleId: string, operatorId: string, operationId: string): void {
    if (!this.socket || !this.userId || this.userRole !== 'supervisor') return;

    this.socket.emit('assign_work', {
      bundleId,
      operatorId,
      operationId,
      assignedBy: this.userId,
      timestamp: new Date()
    });
  }

  completeWork(bundleId: string, qualityScore: number, piecesCompleted: number, notes?: string): void {
    if (!this.socket || !this.userId) return;

    this.socket.emit('complete_work', {
      bundleId,
      operatorId: this.userId,
      qualityScore,
      piecesCompleted,
      notes,
      completedAt: new Date()
    });
  }

  // Collaboration methods
  joinCollaboration(wipId: string): void {
    if (!this.socket || !this.userId) return;

    this.socket.emit('join_collaboration', {
      wipId,
      userId: this.userId,
      userName: 'Current User', // Would be fetched from user service
      userRole: this.userRole,
      deviceType: this.getDeviceType()
    });
  }

  leaveCollaboration(sessionId: string): void {
    if (!this.socket || !this.userId) return;

    this.socket.emit('leave_collaboration', {
      sessionId,
      userId: this.userId
    });
  }

  updateCursor(sessionId: string, cursor: { x: number; y: number }): void {
    if (!this.socket || !this.userId) return;

    this.socket.emit('collaboration_cursor_update', {
      sessionId,
      userId: this.userId,
      cursor
    });
  }

  sendCollaborationNote(sessionId: string, message: string, type: string = 'comment'): void {
    if (!this.socket || !this.userId) return;

    this.socket.emit('collaboration_note_send', {
      sessionId,
      note: {
        id: `note_${Date.now()}`,
        userId: this.userId,
        userName: 'Current User',
        message,
        type,
        timestamp: new Date()
      }
    });
  }

  // Emergency methods
  sendEmergencyAlert(type: string, location: string, description: string, severity: string = 'high'): void {
    if (!this.socket || !this.userId) return;

    this.socket.emit('emergency_alert_send', {
      type,
      location,
      description,
      severity,
      reportedBy: this.userId,
      timestamp: new Date()
    });
  }

  // Subscription methods
  subscribe(eventType: string, filters?: any): string {
    if (!this.socket) return '';

    const subscriptionId = `${eventType}_${Date.now()}_${Math.random()}`;
    
    this.socket.emit('subscribe', {
      eventType,
      filters,
      subscriptionId
    });

    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): void {
    if (!this.socket) return;

    this.socket.emit('unsubscribe', { subscriptionId });
  }

  // Utility methods
  private getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    if (typeof window === 'undefined') return 'desktop';
    
    const userAgent = window.navigator.userAgent;
    const screenWidth = window.screen.width;
    
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return screenWidth < 768 ? 'mobile' : 'tablet';
    }
    
    return 'desktop';
  }

  private generateDeviceId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${this.getDeviceType()}_${timestamp}_${random}`;
  }

  private showNotification(title: string, message: string, type: string): void {
    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/logo.png',
        badge: '/logo.png'
      });
    }

    // Also emit custom notification event for UI components
    this.emit('notification', { title, message, type, timestamp: new Date() });
  }

  // Connection state getters
  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  isConnected(): boolean {
    return this.connectionState.status === 'connected' && this.socket?.connected === true;
  }

  // Disconnect
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionState.status = 'disconnected';
    this.eventListeners.clear();
  }

  // Heartbeat
  startHeartbeat(): void {
    if (!this.socket || !this.userId) return;

    setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('heartbeat', {
          userId: this.userId,
          timestamp: new Date(),
          deviceType: this.getDeviceType()
        });
      }
    }, 30000); // 30 seconds
  }

  // Debug information
  getDebugInfo(): any {
    return {
      connectionState: this.connectionState,
      userId: this.userId,
      userRole: this.userRole,
      socketConnected: this.socket?.connected || false,
      socketId: this.socket?.id || null,
      eventListeners: Array.from(this.eventListeners.keys()),
      config: this.config
    };
  }
}

// Default configuration
export const defaultWebSocketClientConfig: WebSocketClientConfig = {
  serverUrl: process.env.REACT_APP_WEBSOCKET_URL || 'http://localhost:3001',
  autoReconnect: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  timeout: 10000
};

// Singleton instance
export const webSocketClient = new WebSocketClient(defaultWebSocketClientConfig);

export default WebSocketClient;