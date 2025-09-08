// useWebSocket Hook
// React hook for WebSocket integration with automatic connection management

import { useState, useEffect, useCallback, useRef } from 'react';
import { webSocketClient } from '../services/websocket-client';
import type { ConnectionState } from '../services/websocket-client';
import { OperatorStatus, LiveMetrics } from '../services/core/realtime-service';

export interface WebSocketHookState {
  connectionState: ConnectionState;
  isConnected: boolean;
  operatorStatuses: OperatorStatus[];
  liveMetrics: LiveMetrics | null;
  notifications: Notification[];
  collaborationSessions: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
}

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  userId?: string;
  userRole?: string;
  deviceId?: string;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    userId,
    userRole,
    deviceId,
    onConnect,
    onDisconnect,
    onError
  } = options;

  // State
  const [state, setState] = useState<WebSocketHookState>({
    connectionState: webSocketClient.getConnectionState(),
    isConnected: false,
    operatorStatuses: [],
    liveMetrics: null,
    notifications: [],
    collaborationSessions: []
  });

  // Refs to avoid stale closures
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);

  // Update refs
  useEffect(() => {
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onErrorRef.current = onError;
  });

  // Connection management
  const connect = useCallback(async (connectUserId?: string, connectUserRole?: string, connectDeviceId?: string) => {
    try {
      const finalUserId = connectUserId || userId;
      const finalUserRole = connectUserRole || userRole;
      const finalDeviceId = connectDeviceId || deviceId;

      if (!finalUserId || !finalUserRole) {
        throw new Error('User ID and role are required for WebSocket connection');
      }

      await webSocketClient.connect(finalUserId, finalUserRole, finalDeviceId);
      
      setState(prev => ({
        ...prev,
        connectionState: webSocketClient.getConnectionState(),
        isConnected: true
      }));

      onConnectRef.current?.();

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setState(prev => ({
        ...prev,
        connectionState: webSocketClient.getConnectionState(),
        isConnected: false
      }));
      onErrorRef.current?.(error as Error);
    }
  }, [userId, userRole, deviceId]);

  const disconnect = useCallback(() => {
    webSocketClient.disconnect();
    setState(prev => ({
      ...prev,
      connectionState: webSocketClient.getConnectionState(),
      isConnected: false
    }));
  }, []);

  const reconnect = useCallback(async () => {
    disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await connect();
  }, [connect]);

  // Event handlers
  useEffect(() => {
    // Connection events
    const handleConnect = () => {
      setState(prev => ({
        ...prev,
        connectionState: webSocketClient.getConnectionState(),
        isConnected: true
      }));
      onConnectRef.current?.();
    };

    const handleDisconnect = (reason: string) => {
      setState(prev => ({
        ...prev,
        connectionState: webSocketClient.getConnectionState(),
        isConnected: false
      }));
      onDisconnectRef.current?.(reason);
    };

    const handleReconnect = () => {
      setState(prev => ({
        ...prev,
        connectionState: webSocketClient.getConnectionState(),
        isConnected: true
      }));
    };

    // Operator status events
    const handleOperatorStatusUpdate = (operatorStatus: OperatorStatus) => {
      setState(prev => {
        const updatedStatuses = prev.operatorStatuses.filter(op => op.id !== operatorStatus.id);
        return {
          ...prev,
          operatorStatuses: [...updatedStatuses, operatorStatus]
        };
      });
    };

    // Metrics events
    const handleMetricsUpdate = (metrics: LiveMetrics) => {
      setState(prev => ({
        ...prev,
        liveMetrics: metrics
      }));
    };

    // Notification events
    const handleNotification = (data: {
      title: string;
      message: string;
      type: 'info' | 'warning' | 'error' | 'success';
      timestamp: Date;
    }) => {
      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random()}`,
        title: data.title,
        message: data.message,
        type: data.type,
        timestamp: data.timestamp,
        read: false
      };

      setState(prev => ({
        ...prev,
        notifications: [notification, ...prev.notifications].slice(0, 50) // Keep latest 50
      }));
    };

    // Collaboration events
    const handleCollaborationJoin = (data: { sessionId: string }) => {
      setState(prev => ({
        ...prev,
        collaborationSessions: [...prev.collaborationSessions, data.sessionId]
      }));
    };

    const handleCollaborationLeave = (data: { sessionId: string }) => {
      setState(prev => ({
        ...prev,
        collaborationSessions: prev.collaborationSessions.filter(id => id !== data.sessionId)
      }));
    };

    // Register event listeners
    webSocketClient.on('connect', handleConnect);
    webSocketClient.on('disconnect', handleDisconnect);
    webSocketClient.on('reconnect', handleReconnect);
    webSocketClient.on('operator_status_update', handleOperatorStatusUpdate);
    webSocketClient.on('metrics_update', handleMetricsUpdate);
    webSocketClient.on('notification', handleNotification);
    webSocketClient.on('system_notification', handleNotification);
    webSocketClient.on('collaboration_join', handleCollaborationJoin);
    webSocketClient.on('collaboration_leave', handleCollaborationLeave);

    // Cleanup function
    return () => {
      webSocketClient.off('connect', handleConnect);
      webSocketClient.off('disconnect', handleDisconnect);
      webSocketClient.off('reconnect', handleReconnect);
      webSocketClient.off('operator_status_update', handleOperatorStatusUpdate);
      webSocketClient.off('metrics_update', handleMetricsUpdate);
      webSocketClient.off('notification', handleNotification);
      webSocketClient.off('system_notification', handleNotification);
      webSocketClient.off('collaboration_join', handleCollaborationJoin);
      webSocketClient.off('collaboration_leave', handleCollaborationLeave);
    };
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && userId && userRole && !webSocketClient.isConnected()) {
      connect();
    }

    // Auto-disconnect on unmount
    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, userId, userRole, connect, disconnect]);

  // Operator methods
  const updateOperatorStatus = useCallback((status: Partial<OperatorStatus>) => {
    webSocketClient.updateOperatorStatus(status);
  }, []);

  const updateWorkProgress = useCallback((bundleId: string, progress: number, piecesCompleted: number) => {
    webSocketClient.updateWorkProgress(bundleId, progress, piecesCompleted);
  }, []);

  const reportQualityIssue = useCallback((bundleId: string, issueType: string, severity: string, description: string) => {
    webSocketClient.reportQualityIssue(bundleId, issueType, severity, description);
  }, []);

  // Work assignment methods
  const assignWork = useCallback((bundleId: string, operatorId: string, operationId: string) => {
    webSocketClient.assignWork(bundleId, operatorId, operationId);
  }, []);

  const completeWork = useCallback((bundleId: string, qualityScore: number, piecesCompleted: number, notes?: string) => {
    webSocketClient.completeWork(bundleId, qualityScore, piecesCompleted, notes);
  }, []);

  // Collaboration methods
  const joinCollaboration = useCallback((wipId: string) => {
    webSocketClient.joinCollaboration(wipId);
  }, []);

  const leaveCollaboration = useCallback((sessionId: string) => {
    webSocketClient.leaveCollaboration(sessionId);
  }, []);

  const updateCursor = useCallback((sessionId: string, cursor: { x: number; y: number }) => {
    webSocketClient.updateCursor(sessionId, cursor);
  }, []);

  const sendCollaborationNote = useCallback((sessionId: string, message: string, type?: string) => {
    webSocketClient.sendCollaborationNote(sessionId, message, type);
  }, []);

  // Emergency methods
  const sendEmergencyAlert = useCallback((type: string, location: string, description: string, severity?: string) => {
    webSocketClient.sendEmergencyAlert(type, location, description, severity);
  }, []);

  // Subscription methods
  const subscribe = useCallback((eventType: string, callback: Function, filters?: any): string => {
    webSocketClient.on(eventType, callback);
    return webSocketClient.subscribe(eventType, filters);
  }, []);

  const unsubscribe = useCallback((eventType: string, callback?: Function, subscriptionId?: string) => {
    if (callback) {
      webSocketClient.off(eventType, callback);
    }
    if (subscriptionId) {
      webSocketClient.unsubscribe(subscriptionId);
    }
  }, []);

  // Notification management
  const markNotificationRead = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    }));
  }, []);

  const clearNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: []
    }));
  }, []);

  const clearReadNotifications = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(notif => !notif.read)
    }));
  }, []);

  // Derived state
  const unreadNotifications = state.notifications.filter(notif => !notif.read);
  const connectedOperators = state.operatorStatuses.filter(op => op.status !== 'offline');
  const workingOperators = state.operatorStatuses.filter(op => op.status === 'working');

  return {
    // State
    ...state,
    unreadNotifications,
    connectedOperators,
    workingOperators,

    // Connection methods
    connect,
    disconnect,
    reconnect,

    // Operator methods
    updateOperatorStatus,
    updateWorkProgress,
    reportQualityIssue,

    // Work assignment methods
    assignWork,
    completeWork,

    // Collaboration methods
    joinCollaboration,
    leaveCollaboration,
    updateCursor,
    sendCollaborationNote,

    // Emergency methods
    sendEmergencyAlert,

    // Subscription methods
    subscribe,
    unsubscribe,

    // Notification methods
    markNotificationRead,
    clearNotifications,
    clearReadNotifications,

    // Utility methods
    getDebugInfo: () => webSocketClient.getDebugInfo()
  };
}

// Specialized hooks for specific use cases

export function useOperatorWebSocket(operatorId: string, deviceId?: string) {
  return useWebSocket({
    autoConnect: true,
    userId: operatorId,
    userRole: 'operator',
    deviceId,
    onConnect: () => {
      console.log(`👷 Operator ${operatorId} connected to WebSocket`);
    },
    onDisconnect: (reason) => {
      console.log(`👷 Operator ${operatorId} disconnected: ${reason}`);
    }
  });
}

export function useSupervisorWebSocket(supervisorId: string, deviceId?: string) {
  return useWebSocket({
    autoConnect: true,
    userId: supervisorId,
    userRole: 'supervisor',
    deviceId,
    onConnect: () => {
      console.log(`👨‍💼 Supervisor ${supervisorId} connected to WebSocket`);
    },
    onDisconnect: (reason) => {
      console.log(`👨‍💼 Supervisor ${supervisorId} disconnected: ${reason}`);
    }
  });
}

export function useManagerWebSocket(managerId: string, deviceId?: string) {
  return useWebSocket({
    autoConnect: true,
    userId: managerId,
    userRole: 'manager',
    deviceId,
    onConnect: () => {
      console.log(`📊 Manager ${managerId} connected to WebSocket`);
    },
    onDisconnect: (reason) => {
      console.log(`📊 Manager ${managerId} disconnected: ${reason}`);
    }
  });
}

export default useWebSocket;