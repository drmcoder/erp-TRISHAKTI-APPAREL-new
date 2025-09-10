import { ref, onDisconnect, serverTimestamp, set, onValue } from 'firebase/database';
import { rtdb, RT_PATHS } from '../config/firebase';

export interface ConnectionStatus {
  isOnline: boolean;
  lastSeen: number;
  reconnectAttempts: number;
  latency: number | null;
}

export interface ConnectionCallbacks {
  onConnectionChange?: (status: ConnectionStatus) => void;
  onReconnect?: () => void;
  onDisconnect?: () => void;
}

class ConnectionMonitorService {
  private userId: string | null = null;
  private connectionRef: any = null;
  private status: ConnectionStatus = {
    isOnline: false,
    lastSeen: 0,
    reconnectAttempts: 0,
    latency: null,
  };
  private callbacks: ConnectionCallbacks = {};
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private latencyCheckInterval: NodeJS.Timeout | null = null;
  private reconnectTimeouts: NodeJS.Timeout[] = [];

  /**
   * Initialize connection monitoring for a user
   */
  initialize(userId: string, callbacks: ConnectionCallbacks = {}): void {
    this.userId = userId;
    this.callbacks = callbacks;
    
    this.setupConnectionMonitoring();
    this.setupHeartbeat();
    this.setupLatencyMonitoring();
    
    console.log(`Connection monitor initialized for user: ${userId}`);
  }

  /**
   * Set up Firebase connection monitoring
   */
  private setupConnectionMonitoring(): void {
    if (!this.userId) return;

    // Monitor Firebase connection status
    const connectedRef = ref(rtdb, '.info/connected');
    onValue(connectedRef, (snapshot) => {
      const isConnected = snapshot.val() === true;
      
      if (isConnected) {
        this.handleConnection();
      } else {
        this.handleDisconnection();
      }
    });

    // Set up user presence
    this.connectionRef = ref(rtdb, `${RT_PATHS.ACTIVE_SESSIONS}/${this.userId}`);
    
    // Set user as online
    set(this.connectionRef, {
      status: 'online',
      lastSeen: serverTimestamp(),
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });

    // Set up disconnect handler
    onDisconnect(this.connectionRef).set({
      status: 'offline',
      lastSeen: serverTimestamp(),
      timestamp: Date.now(),
    });
  }

  /**
   * Handle connection established
   */
  private handleConnection(): void {
    this.status.isOnline = true;
    this.status.reconnectAttempts = 0;
    
    // Clear reconnect timeouts
    this.reconnectTimeouts.forEach(timeout => clearTimeout(timeout));
    this.reconnectTimeouts = [];
    
    // Update presence
    if (this.connectionRef && this.userId) {
      set(this.connectionRef, {
        status: 'online',
        lastSeen: serverTimestamp(),
        timestamp: Date.now(),
      });
    }
    
    this.callbacks.onConnectionChange?.(this.status);
    this.callbacks.onReconnect?.();
    
    console.log('Firebase connection established');
  }

  /**
   * Handle connection lost
   */
  private handleDisconnection(): void {
    this.status.isOnline = false;
    this.status.lastSeen = Date.now();
    
    this.callbacks.onConnectionChange?.(this.status);
    this.callbacks.onDisconnect?.();
    
    this.attemptReconnection();
    
    console.log('Firebase connection lost');
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnection(): void {
    const maxAttempts = 10;
    const baseDelay = 1000;
    
    if (this.status.reconnectAttempts >= maxAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }
    
    const delay = baseDelay * Math.pow(2, this.status.reconnectAttempts);
    this.status.reconnectAttempts++;
    
    const timeout = setTimeout(() => {
      if (!this.status.isOnline) {
        console.log(`Reconnection attempt ${this.status.reconnectAttempts}`);
        this.callbacks.onConnectionChange?.(this.status);
        this.attemptReconnection();
      }
    }, delay);
    
    this.reconnectTimeouts.push(timeout);
  }

  /**
   * Set up heartbeat to monitor connection health
   */
  private setupHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.status.isOnline && this.connectionRef) {
        set(this.connectionRef, {
          status: 'online',
          lastSeen: serverTimestamp(),
          timestamp: Date.now(),
        }).catch((error) => {
          console.warn('Heartbeat failed:', error);
        });
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Monitor connection latency
   */
  private setupLatencyMonitoring(): void {
    this.latencyCheckInterval = setInterval(() => {
      this.measureLatency();
    }, 60000); // Every minute
  }

  /**
   * Measure connection latency
   */
  private async measureLatency(): Promise<number> {
    if (!this.status.isOnline) {
      this.status.latency = null;
      return -1;
    }

    try {
      const startTime = Date.now();
      const testRef = ref(rtdb, `${RT_PATHS.SYSTEM_HEALTH}/latency_test`);
      
      await set(testRef, startTime);
      
      return new Promise<number>((resolve) => {
        const unsubscribe = onValue(testRef, (snapshot) => {
          const value = snapshot.val();
          if (value === startTime) {
            const latency = Date.now() - startTime;
            this.status.latency = latency;
            this.callbacks.onConnectionChange?.(this.status);
            unsubscribe();
            resolve(latency);
          }
        });
        
        // Timeout after 10 seconds
        setTimeout(() => {
          this.status.latency = null;
          unsubscribe();
          resolve(-1);
        }, 10000);
      });
    } catch (error) {
      console.warn('Latency measurement failed:', error);
      this.status.latency = null;
      return -1;
    }
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return { ...this.status };
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.status.isOnline;
  }

  /**
   * Force a connection check
   */
  async checkConnection(): Promise<boolean> {
    try {
      await this.measureLatency();
      return this.status.isOnline && this.status.latency !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update user activity timestamp
   */
  updateActivity(): void {
    if (this.status.isOnline && this.connectionRef) {
      set(this.connectionRef, {
        status: 'online',
        lastSeen: serverTimestamp(),
        lastActivity: Date.now(),
        timestamp: Date.now(),
      }).catch((error) => {
        console.warn('Failed to update activity:', error);
      });
    }
  }

  /**
   * Set user status (online, away, busy, etc.)
   */
  setUserStatus(status: 'online' | 'away' | 'busy' | 'offline'): void {
    if (this.connectionRef) {
      set(this.connectionRef, {
        status,
        lastSeen: serverTimestamp(),
        timestamp: Date.now(),
      }).catch((error) => {
        console.warn('Failed to set user status:', error);
      });
    }
  }

  /**
   * Clean up and disconnect
   */
  cleanup(): void {
    // Clear intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.latencyCheckInterval) {
      clearInterval(this.latencyCheckInterval);
      this.latencyCheckInterval = null;
    }
    
    // Clear reconnect timeouts
    this.reconnectTimeouts.forEach(timeout => clearTimeout(timeout));
    this.reconnectTimeouts = [];
    
    // Set user as offline
    if (this.connectionRef) {
      set(this.connectionRef, {
        status: 'offline',
        lastSeen: serverTimestamp(),
        timestamp: Date.now(),
      }).catch(() => {
        // Ignore errors during cleanup
      });
    }
    
    console.log('Connection monitor cleaned up');
  }

  /**
   * Subscribe to other users' connection status
   */
  subscribeToUserStatus(
    userId: string, 
    callback: (status: any) => void
  ): () => void {
    const userRef = ref(rtdb, `${RT_PATHS.ACTIVE_SESSIONS}/${userId}`);
    
    const unsubscribe = onValue(userRef, (snapshot) => {
      const status = snapshot.exists() ? snapshot.val() : null;
      callback(status);
    });
    
    return unsubscribe;
  }

  /**
   * Get all online users
   */
  subscribeToOnlineUsers(callback: (users: any[]) => void): () => void {
    const sessionsRef = ref(rtdb, RT_PATHS.ACTIVE_SESSIONS);
    
    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      const sessions = snapshot.val() || {};
      const onlineUsers = Object.entries(sessions)
        .filter(([_, status]: [string, any]) => status?.status === 'online')
        .map(([userId, status]) => ({ userId, ...(status as object) }));
      
      callback(onlineUsers);
    });
    
    return unsubscribe;
  }
}

export const ConnectionMonitor = new ConnectionMonitorService();