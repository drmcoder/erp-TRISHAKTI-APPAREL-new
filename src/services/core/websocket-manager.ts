// WebSocket Connection Manager
// Handles WebSocket server setup and client connections for real-time features

import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { RealtimeEvent, OperatorStatus, LiveMetrics } from './realtime-service';

export interface WebSocketConfig {
  port: number;
  cors: {
    origin: string[];
    methods: string[];
  };
  connectionTimeout: number;
  maxConnections: number;
}

export interface ConnectedUser {
  id: string;
  socketId: string;
  userId: string;
  userRole: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  deviceId: string;
  connectedAt: Date;
  lastActivity: Date;
  location?: string;
}

export class WebSocketManager {
  private io: SocketIOServer | null = null;
  private server: any = null;
  private config: WebSocketConfig;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]
  private collaborationSessions: Map<string, Set<string>> = new Map();
  private operatorStatuses: Map<string, OperatorStatus> = new Map();
  private liveMetrics: LiveMetrics | null = null;

  constructor(config: WebSocketConfig) {
    this.config = config;
  }

  // Initialize WebSocket Server
  initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = createServer();
        
        this.io = new SocketIOServer(this.server, {
          cors: this.config.cors,
          connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
            skipMiddlewares: true,
          },
          transports: ['websocket', 'polling'],
          pingTimeout: 60000,
          pingInterval: 25000,
          maxHttpBufferSize: 1e6, // 1MB
          allowEIO3: true
        });

        this.setupEventHandlers();
        
        this.server.listen(this.config.port, () => {
          console.log(`🚀 WebSocket server running on port ${this.config.port}`);
          resolve();
        });

        this.server.on('error', (error: Error) => {
          console.error('❌ WebSocket server error:', error);
          reject(error);
        });

      } catch (error) {
        console.error('❌ Failed to initialize WebSocket server:', error);
        reject(error);
      }
    });
  }

  // Setup Socket.IO Event Handlers
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      console.log('🔌 New client connected:', socket.id);

      // Authentication and Registration
      socket.on('authenticate', async (data) => {
        await this.handleAuthentication(socket, data);
      });

      // Operator Status Events
      socket.on('update_operator_status', (data) => {
        this.handleOperatorStatusUpdate(socket, data);
      });

      socket.on('work_progress_update', (data) => {
        this.handleWorkProgressUpdate(socket, data);
      });

      socket.on('quality_issue_report', (data) => {
        this.handleQualityIssueReport(socket, data);
      });

      // Work Assignment Events
      socket.on('assign_work', (data) => {
        this.handleWorkAssignment(socket, data);
      });

      socket.on('complete_work', (data) => {
        this.handleWorkCompletion(socket, data);
      });

      // Collaboration Events
      socket.on('join_collaboration', (data) => {
        this.handleCollaborationJoin(socket, data);
      });

      socket.on('leave_collaboration', (data) => {
        this.handleCollaborationLeave(socket, data);
      });

      socket.on('collaboration_cursor_update', (data) => {
        this.handleCollaborationCursor(socket, data);
      });

      socket.on('collaboration_note_send', (data) => {
        this.handleCollaborationNote(socket, data);
      });

      // Emergency Events
      socket.on('emergency_alert_send', (data) => {
        this.handleEmergencyAlert(socket, data);
      });

      // Subscription Management
      socket.on('subscribe', (data) => {
        this.handleSubscription(socket, data);
      });

      socket.on('unsubscribe', (data) => {
        this.handleUnsubscription(socket, data);
      });

      // Heartbeat
      socket.on('heartbeat', (data) => {
        this.handleHeartbeat(socket, data);
      });

      // Disconnection
      socket.on('disconnect', (reason) => {
        this.handleDisconnection(socket, reason);
      });

      // Error handling
      socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
      });
    });

    // Periodic metrics broadcast
    setInterval(() => {
      this.broadcastLiveMetrics();
    }, 5000); // Every 5 seconds

    // Cleanup inactive connections
    setInterval(() => {
      this.cleanupInactiveConnections();
    }, 60000); // Every minute
  }

  // Authentication Handler
  private async handleAuthentication(socket: any, data: {
    userId: string;
    userRole: string;
    deviceType: string;
    deviceId: string;
  }): Promise<void> {
    try {
      // Validate authentication (in real app, verify JWT token)
      if (!data.userId || !data.userRole) {
        socket.emit('auth_error', { message: 'Missing credentials' });
        return;
      }

      const connectedUser: ConnectedUser = {
        id: socket.id,
        socketId: socket.id,
        userId: data.userId,
        userRole: data.userRole,
        deviceType: data.deviceType as any,
        deviceId: data.deviceId,
        connectedAt: new Date(),
        lastActivity: new Date()
      };

      // Store connection
      this.connectedUsers.set(socket.id, connectedUser);
      
      // Map user to sockets
      const userSockets = this.userSockets.get(data.userId) || [];
      userSockets.push(socket.id);
      this.userSockets.set(data.userId, userSockets);

      // Join user-specific room
      socket.join(`user_${data.userId}`);
      socket.join(`role_${data.userRole}`);
      socket.join(`device_${data.deviceType}`);

      // Send success response
      socket.emit('authenticated', {
        success: true,
        userId: data.userId,
        connectedUsers: this.getConnectedUsersCount(),
        timestamp: new Date()
      });

      // Broadcast user online status
      this.broadcastToRole('supervisor', 'user_online', {
        userId: data.userId,
        userRole: data.userRole,
        deviceType: data.deviceType,
        timestamp: new Date()
      });

      console.log(`✅ User authenticated: ${data.userId} (${data.userRole}) on ${data.deviceType}`);

    } catch (error) {
      console.error('❌ Authentication error:', error);
      socket.emit('auth_error', { message: 'Authentication failed' });
    }
  }

  // Operator Status Update Handler
  private handleOperatorStatusUpdate(socket: any, data: Partial<OperatorStatus>): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user) return;

    const operatorStatus: OperatorStatus = {
      id: user.userId,
      name: data.name || 'Unknown',
      status: data.status || 'offline',
      currentWork: data.currentWork,
      location: data.location || 'Unknown',
      lastSeen: new Date()
    };

    this.operatorStatuses.set(user.userId, operatorStatus);

    // Broadcast to supervisors
    this.broadcastToRole('supervisor', 'operator_status_update', operatorStatus);
    this.broadcastToRole('manager', 'operator_status_update', operatorStatus);

    this.updateUserActivity(socket.id);
  }

  // Work Progress Update Handler
  private handleWorkProgressUpdate(socket: any, data: {
    operatorId: string;
    bundleId: string;
    progress: number;
    piecesCompleted: number;
    timestamp: Date;
  }): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user || user.userId !== data.operatorId) return;

    // Broadcast work progress
    this.broadcastToRole('supervisor', 'operator_work_progress', data);
    this.broadcastToRole('manager', 'operator_work_progress', data);

    // Update live metrics
    this.updateLiveMetrics();
    this.updateUserActivity(socket.id);
  }

  // Quality Issue Report Handler
  private handleQualityIssueReport(socket: any, data: {
    bundleId: string;
    operatorId: string;
    issueType: string;
    severity: string;
    description: string;
    timestamp: Date;
  }): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user || user.userId !== data.operatorId) return;

    // Broadcast quality alert
    this.io?.emit('quality_alert', data);

    // Send priority alert to supervisors and quality team
    this.broadcastToRole('supervisor', 'quality_alert', data);
    this.broadcastToRole('quality', 'quality_alert', data);
    this.broadcastToRole('manager', 'quality_alert', data);

    this.updateUserActivity(socket.id);
  }

  // Work Assignment Handler
  private handleWorkAssignment(socket: any, data: {
    bundleId: string;
    operatorId: string;
    operationId: string;
    assignedBy: string;
    timestamp: Date;
  }): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user || user.userRole !== 'supervisor') return;

    // Send to specific operator
    this.sendToUser(data.operatorId, 'work_assigned', data);

    // Broadcast to other supervisors
    this.broadcastToRole('supervisor', 'work_assigned', data);
    this.broadcastToRole('manager', 'work_assigned', data);

    this.updateUserActivity(socket.id);
  }

  // Work Completion Handler
  private handleWorkCompletion(socket: any, data: {
    bundleId: string;
    operatorId: string;
    qualityScore: number;
    piecesCompleted: number;
    notes?: string;
    completedAt: Date;
  }): void {
    const user = this.connectedUsers.get(socket.id);
    if (!user || user.userId !== data.operatorId) return;

    // Broadcast work completion
    this.broadcastToRole('supervisor', 'work_completed', data);
    this.broadcastToRole('manager', 'work_completed', data);

    // Update live metrics
    this.updateLiveMetrics();
    this.updateUserActivity(socket.id);
  }

  // Collaboration Join Handler
  private handleCollaborationJoin(socket: any, data: {
    wipId: string;
    userId: string;
    userName: string;
    userRole: string;
    deviceType: string;
  }): void {
    const sessionId = `collab_${data.wipId}`;
    
    // Add to collaboration session
    if (!this.collaborationSessions.has(sessionId)) {
      this.collaborationSessions.set(sessionId, new Set());
    }
    this.collaborationSessions.get(sessionId)?.add(socket.id);

    // Join collaboration room
    socket.join(sessionId);

    // Notify other participants
    socket.to(sessionId).emit('collaboration_join', {
      sessionId,
      user: {
        id: data.userId,
        name: data.userName,
        role: data.userRole
      }
    });

    this.updateUserActivity(socket.id);
  }

  // Collaboration Leave Handler
  private handleCollaborationLeave(socket: any, data: {
    sessionId: string;
    userId: string;
  }): void {
    const session = this.collaborationSessions.get(data.sessionId);
    if (session) {
      session.delete(socket.id);
      
      if (session.size === 0) {
        this.collaborationSessions.delete(data.sessionId);
      }
    }

    socket.leave(data.sessionId);

    // Notify other participants
    socket.to(data.sessionId).emit('collaboration_leave', data);

    this.updateUserActivity(socket.id);
  }

  // Collaboration Cursor Handler
  private handleCollaborationCursor(socket: any, data: {
    sessionId: string;
    userId: string;
    cursor: { x: number; y: number };
  }): void {
    socket.to(data.sessionId).emit('collaboration_cursor', data);
    this.updateUserActivity(socket.id);
  }

  // Collaboration Note Handler
  private handleCollaborationNote(socket: any, data: {
    sessionId: string;
    note: any;
  }): void {
    this.io?.to(data.sessionId).emit('collaboration_note', data);
    this.updateUserActivity(socket.id);
  }

  // Emergency Alert Handler
  private handleEmergencyAlert(socket: any, data: {
    type: string;
    location: string;
    description: string;
    severity: string;
    reportedBy: string;
    timestamp: Date;
  }): void {
    // Broadcast emergency alert to all users
    this.io?.emit('emergency_alert', data);

    // Send priority notifications
    this.broadcastToRole('supervisor', 'emergency_alert', data);
    this.broadcastToRole('manager', 'emergency_alert', data);
    this.broadcastToRole('security', 'emergency_alert', data);

    console.log(`🚨 Emergency Alert: ${data.type} at ${data.location} by ${data.reportedBy}`);
    this.updateUserActivity(socket.id);
  }

  // Subscription Handler
  private handleSubscription(socket: any, data: {
    eventType: string;
    filters?: any;
    subscriptionId: string;
  }): void {
    // Join specific event room
    socket.join(`event_${data.eventType}`);
    
    if (data.filters) {
      // Apply filters for targeted subscriptions
      socket.join(`filtered_${data.eventType}_${JSON.stringify(data.filters)}`);
    }

    this.updateUserActivity(socket.id);
  }

  // Unsubscription Handler
  private handleUnsubscription(socket: any, data: {
    subscriptionId: string;
  }): void {
    // Leave subscription rooms (simplified implementation)
    // In real app, track subscriptions per socket
    this.updateUserActivity(socket.id);
  }

  // Heartbeat Handler
  private handleHeartbeat(socket: any, data: {
    userId: string;
    timestamp: Date;
    deviceType: string;
  }): void {
    this.updateUserActivity(socket.id);
  }

  // Disconnection Handler
  private handleDisconnection(socket: any, reason: string): void {
    const user = this.connectedUsers.get(socket.id);
    
    if (user) {
      // Remove from connected users
      this.connectedUsers.delete(socket.id);

      // Update user sockets mapping
      const userSockets = this.userSockets.get(user.userId) || [];
      const updatedSockets = userSockets.filter(id => id !== socket.id);
      
      if (updatedSockets.length === 0) {
        this.userSockets.delete(user.userId);
        
        // Broadcast user offline if no more connections
        this.broadcastToRole('supervisor', 'user_offline', {
          userId: user.userId,
          userRole: user.userRole,
          timestamp: new Date()
        });
      } else {
        this.userSockets.set(user.userId, updatedSockets);
      }

      // Clean up collaboration sessions
      this.collaborationSessions.forEach((session, sessionId) => {
        if (session.has(socket.id)) {
          session.delete(socket.id);
          socket.to(sessionId).emit('collaboration_leave', {
            sessionId,
            userId: user.userId
          });
        }
      });

      console.log(`🔌 User disconnected: ${user.userId} (${reason})`);
    }
  }

  // Utility Methods
  private sendToUser(userId: string, event: string, data: any): void {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach(socketId => {
        this.io?.to(socketId).emit(event, data);
      });
    }
  }

  private broadcastToRole(role: string, event: string, data: any): void {
    this.io?.to(`role_${role}`).emit(event, data);
  }

  private updateUserActivity(socketId: string): void {
    const user = this.connectedUsers.get(socketId);
    if (user) {
      user.lastActivity = new Date();
    }
  }

  private updateLiveMetrics(): void {
    const activeOperators = Array.from(this.operatorStatuses.values())
      .filter(op => op.status === 'working').length;

    const totalPieces = Array.from(this.operatorStatuses.values())
      .reduce((sum, op) => sum + (op.currentWork?.progress || 0), 0);

    this.liveMetrics = {
      totalPieces: Math.floor(totalPieces),
      completedToday: Math.floor(totalPieces * 0.8), // Mock calculation
      inProgress: activeOperators,
      qualityIssues: Math.floor(totalPieces * 0.02), // Mock 2% defect rate
      averageEfficiency: 87.5, // Mock efficiency
      onTimeDelivery: 94.2 // Mock delivery rate
    };
  }

  private broadcastLiveMetrics(): void {
    if (this.liveMetrics) {
      this.updateLiveMetrics();
      this.io?.emit('metrics_update', this.liveMetrics);
    }
  }

  private cleanupInactiveConnections(): void {
    const now = new Date();
    const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

    this.connectedUsers.forEach((user, socketId) => {
      if (now.getTime() - user.lastActivity.getTime() > inactiveThreshold) {
        const socket = this.io?.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
        }
      }
    });
  }

  private getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Public Methods
  getConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  getUsersByRole(role: string): ConnectedUser[] {
    return Array.from(this.connectedUsers.values())
      .filter(user => user.userRole === role);
  }

  getOperatorStatuses(): OperatorStatus[] {
    return Array.from(this.operatorStatuses.values());
  }

  getCurrentMetrics(): LiveMetrics | null {
    return this.liveMetrics;
  }

  // System Notifications
  broadcastSystemNotification(notification: {
    type: 'info' | 'warning' | 'error' | 'success';
    title: string;
    message: string;
    targetUsers?: string[];
    targetRoles?: string[];
  }): void {
    const data = {
      ...notification,
      timestamp: new Date()
    };

    if (notification.targetUsers) {
      notification.targetUsers.forEach(userId => {
        this.sendToUser(userId, 'system_notification', data);
      });
    } else if (notification.targetRoles) {
      notification.targetRoles.forEach(role => {
        this.broadcastToRole(role, 'system_notification', data);
      });
    } else {
      this.io?.emit('system_notification', data);
    }
  }

  // Shutdown
  async shutdown(): Promise<void> {
    if (this.io) {
      this.io.close();
    }
    if (this.server) {
      this.server.close();
    }
    console.log('🔌 WebSocket server shut down');
  }
}

// Export default configuration
export const defaultWebSocketConfig: WebSocketConfig = {
  port: 3001,
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST']
  },
  connectionTimeout: 10000,
  maxConnections: 1000
};

export default WebSocketManager;