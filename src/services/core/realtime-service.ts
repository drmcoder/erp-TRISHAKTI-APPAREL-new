// Real-Time WebSocket Service
// Handles live updates, notifications, and collaboration features

// Browser-compatible EventEmitter replacement
class SimpleEventEmitter {
  private listeners: { [event: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(...args));
    }
  }

  off(event: string, callback?: Function) {
    if (!this.listeners[event]) return;
    if (callback) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    } else {
      this.listeners[event] = [];
    }
  }
}
import { io, Socket } from 'socket.io-client';

export interface RealtimeEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface OperatorStatus {
  id: string;
  name: string;
  status: 'online' | 'working' | 'break' | 'offline';
  currentWork?: {
    bundleId: string;
    operation: string;
    progress: number;
    startTime: Date;
  };
  location: string;
  lastSeen: Date;
}

export interface LiveMetrics {
  totalPieces: number;
  completedToday: number;
  inProgress: number;
  qualityIssues: number;
  averageEfficiency: number;
  onTimeDelivery: number;
  earnings: {
    total: number;
    operators: number;
    supervisors: number;
  };
  activeOperators: number;
}

export interface CollaborationSession {
  id: string;
  wipId: string;
  participants: {
    id: string;
    name: string;
    role: string;
    joinedAt: Date;
    cursor?: { x: number; y: number };
  }[];
  activeUsers: string[];
  sharedState: any;
}

class RealtimeService extends SimpleEventEmitter {
  private socket: Socket | null = null;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private userId: string | null = null;
  private userRole: string | null = null;
  private deviceType: 'desktop' | 'tablet' | 'mobile' = 'desktop';

  // Subscriptions and State
  private subscriptions: Map<string, { callback: Function; filters?: any }> = new Map();
  private operatorStatuses: Map<string, OperatorStatus> = new Map();
  private liveMetrics: LiveMetrics | null = null;
  private collaborationSessions: Map<string, CollaborationSession> = new Map();

  constructor() {
    super();
    this.detectDeviceType();
  }

  // Connection Management
  async connect(userId: string, userRole: string, deviceId?: string): Promise<void> {
    if (this.connectionStatus === 'connected') {
      return;
    }

    this.userId = userId;
    this.userRole = userRole;
    this.connectionStatus = 'connecting';

    try {
      const socketUrl = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3001';
      
      this.socket = io(socketUrl, {
        auth: {
          userId,
          userRole,
          deviceType: this.deviceType,
          deviceId: deviceId || this.generateDeviceId()
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 2000
      });

      this.setupEventListeners();
      
      // Wait for connection
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket!.on('connect', () => {
          clearTimeout(timeout);
          this.connectionStatus = 'connected';
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      console.log('✅ Real-time service connected');
      this.emit('connected', { userId, userRole, deviceType: this.deviceType });

    } catch (error) {
      this.connectionStatus = 'disconnected';
      console.error('❌ Real-time service connection failed:', error);
      this.emit('connectionError', error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.connectionStatus = 'disconnected';
    this.subscriptions.clear();
    this.emit('disconnected');
  }

  // Event Listeners Setup
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      this.connectionStatus = 'connected';
      this.emit('connected');
    });

    this.socket.on('disconnect', (reason) => {
      this.connectionStatus = 'disconnected';
      this.emit('disconnected', reason);
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        setTimeout(() => this.attemptReconnect(), 2000);
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.emit('reconnected', attemptNumber);
    });

    this.socket.on('reconnect_error', () => {
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.emit('maxReconnectAttemptsReached');
      }
    });

    // Operator Status Updates
    this.socket.on('operator_status_update', (data: OperatorStatus) => {
      this.operatorStatuses.set(data.id, data);
      this.emit('operatorStatusUpdate', data);
    });

    this.socket.on('operator_work_progress', (data: {
      operatorId: string;
      bundleId: string;
      progress: number;
      piecesCompleted: number;
    }) => {
      this.emit('operatorWorkProgress', data);
    });

    // Work Assignment Updates
    this.socket.on('work_assigned', (data: {
      bundleId: string;
      operatorId: string;
      operationId: string;
      assignedBy: string;
      timestamp: Date;
    }) => {
      this.emit('workAssigned', data);
    });

    this.socket.on('work_completed', (data: {
      bundleId: string;
      operatorId: string;
      completedAt: Date;
      qualityScore: number;
      piecesCompleted: number;
    }) => {
      this.emit('workCompleted', data);
    });

    // Production Metrics
    this.socket.on('metrics_update', (metrics: LiveMetrics) => {
      this.liveMetrics = metrics;
      this.emit('metricsUpdate', metrics);
    });

    // Quality Alerts
    this.socket.on('quality_alert', (data: {
      bundleId: string;
      operatorId: string;
      issueType: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      timestamp: Date;
    }) => {
      this.emit('qualityAlert', data);
    });

    // Bundle Status Updates
    this.socket.on('bundle_status_change', (data: {
      bundleId: string;
      oldStatus: string;
      newStatus: string;
      changedBy: string;
      timestamp: Date;
    }) => {
      this.emit('bundleStatusChange', data);
    });

    // Collaboration Events
    this.socket.on('collaboration_join', (data: {
      sessionId: string;
      user: {
        id: string;
        name: string;
        role: string;
      };
    }) => {
      this.handleCollaborationJoin(data);
    });

    this.socket.on('collaboration_leave', (data: {
      sessionId: string;
      userId: string;
    }) => {
      this.handleCollaborationLeave(data);
    });

    this.socket.on('collaboration_cursor', (data: {
      sessionId: string;
      userId: string;
      cursor: { x: number; y: number };
    }) => {
      this.emit('collaborationCursor', data);
    });

    this.socket.on('collaboration_note', (data: {
      sessionId: string;
      note: {
        id: string;
        userId: string;
        userName: string;
        message: string;
        type: string;
        timestamp: Date;
      };
    }) => {
      this.emit('collaborationNote', data);
    });

    // Emergency Events
    this.socket.on('emergency_alert', (data: {
      type: 'machine_breakdown' | 'quality_issue' | 'safety_concern' | 'urgent_help';
      location: string;
      reportedBy: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      timestamp: Date;
    }) => {
      this.emit('emergencyAlert', data);
    });

    // System Notifications
    this.socket.on('system_notification', (data: {
      type: 'info' | 'warning' | 'error' | 'success';
      title: string;
      message: string;
      targetUsers?: string[];
      targetRoles?: string[];
      timestamp: Date;
    }) => {
      this.emit('systemNotification', data);
    });
  }

  // Operator Status Management
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

  // Work Assignment
  assignWork(bundleId: string, operatorId: string, operationId: string): void {
    if (!this.socket || !this.userId) return;

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

  // Collaboration Features
  joinCollaboration(wipId: string): void {
    if (!this.socket || !this.userId) return;

    this.socket.emit('join_collaboration', {
      wipId,
      userId: this.userId,
      userName: 'Current User', // Would be fetched from user service
      userRole: this.userRole,
      deviceType: this.deviceType
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
        userName: 'Current User', // Would be fetched from user service
        message,
        type,
        timestamp: new Date()
      }
    });
  }

  // Emergency Features
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

  // Subscriptions
  subscribe(eventType: string, callback: Function, filters?: any): string {
    const subscriptionId = `${eventType}_${Date.now()}_${Math.random()}`;
    this.subscriptions.set(subscriptionId, { callback, filters });
    
    // Subscribe to server-side events
    if (this.socket) {
      this.socket.emit('subscribe', {
        eventType,
        filters,
        subscriptionId
      });
    }
    
    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
    
    if (this.socket) {
      this.socket.emit('unsubscribe', { subscriptionId });
    }
  }

  // Getters
  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  getOperatorStatuses(): OperatorStatus[] {
    return Array.from(this.operatorStatuses.values());
  }

  getLiveMetrics(): LiveMetrics | null {
    return this.liveMetrics;
  }

  getCollaborationSession(sessionId: string): CollaborationSession | null {
    return this.collaborationSessions.get(sessionId) || null;
  }

  // Private Methods
  private detectDeviceType(): void {
    if (typeof window === 'undefined') return;
    
    const userAgent = window.navigator.userAgent;
    const screenWidth = window.screen.width;
    
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      this.deviceType = screenWidth < 768 ? 'mobile' : 'tablet';
    } else {
      this.deviceType = 'desktop';
    }
  }

  private generateDeviceId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${this.deviceType}_${timestamp}_${random}`;
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('heartbeat', {
          userId: this.userId,
          timestamp: new Date(),
          deviceType: this.deviceType
        });
      }
    }, 30000); // 30 seconds
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++;
      console.log(`Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      this.connect(this.userId, this.userRole || 'operator');
    }
  }

  private handleCollaborationJoin(data: { sessionId: string; user: any }): void {
    let session = this.collaborationSessions.get(data.sessionId);
    
    if (!session) {
      session = {
        id: data.sessionId,
        wipId: '', // Would be provided by server
        participants: [],
        activeUsers: [],
        sharedState: {}
      };
      this.collaborationSessions.set(data.sessionId, session);
    }

    // Add user to session
    const existingUser = session.participants.find(p => p.id === data.user.id);
    if (!existingUser) {
      session.participants.push({
        ...data.user,
        joinedAt: new Date()
      });
    }

    if (!session.activeUsers.includes(data.user.id)) {
      session.activeUsers.push(data.user.id);
    }

    this.emit('collaborationJoin', data);
  }

  private handleCollaborationLeave(data: { sessionId: string; userId: string }): void {
    const session = this.collaborationSessions.get(data.sessionId);
    
    if (session) {
      session.activeUsers = session.activeUsers.filter(id => id !== data.userId);
      
      // Remove session if no active users
      if (session.activeUsers.length === 0) {
        this.collaborationSessions.delete(data.sessionId);
      }
    }

    this.emit('collaborationLeave', data);
  }

  // Offline Support
  enableOfflineMode(): void {
    // Store events locally when offline
    this.on('disconnected', () => {
      console.log('📱 Entering offline mode');
      // Implement local storage queuing
    });

    this.on('connected', () => {
      console.log('🌐 Back online, syncing data');
      // Sync queued events
    });
  }

  // Debug and Monitoring
  getDebugInfo(): any {
    return {
      connectionStatus: this.connectionStatus,
      userId: this.userId,
      userRole: this.userRole,
      deviceType: this.deviceType,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: this.subscriptions.size,
      operatorStatuses: this.operatorStatuses.size,
      collaborationSessions: this.collaborationSessions.size,
      socketConnected: this.socket?.connected || false
    };
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
export default RealtimeService;

// Types are exported as interfaces above