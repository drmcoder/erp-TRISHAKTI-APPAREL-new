// Firebase Connection Service - Handles connection state and initialization
// Provides connection health monitoring and automatic reconnection

import { useState, useEffect } from 'react';
import { connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';
import { connectDatabaseEmulator, goOffline, goOnline, ref, onValue } from 'firebase/database';
import { db, auth, rtdb, REALTIME_CONFIG } from '../config/firebase';

export interface ConnectionState {
  firestore: 'connected' | 'disconnected' | 'error';
  realtimedb: 'connected' | 'disconnected' | 'error';
  auth: 'connected' | 'disconnected' | 'error';
  lastCheck: Date;
  isOnline: boolean;
}

export class FirebaseConnectionService {
  private static instance: FirebaseConnectionService;
  private connectionState: ConnectionState = {
    firestore: 'disconnected',
    realtimedb: 'disconnected', 
    auth: 'disconnected',
    lastCheck: new Date(),
    isOnline: navigator.onLine
  };
  
  private listeners: ((state: ConnectionState) => void)[] = [];
  private healthCheckInterval?: NodeJS.Timeout;
  private reconnectTimeout?: NodeJS.Timeout;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isEnablingNetwork = false; // Track enableNetwork calls
  private isNetworkEnabled = true; // Track current network state

  private constructor() {
    this.initializeConnectionMonitoring();
  }

  static getInstance(): FirebaseConnectionService {
    if (!FirebaseConnectionService.instance) {
      FirebaseConnectionService.instance = new FirebaseConnectionService();
    }
    return FirebaseConnectionService.instance;
  }

  private initializeConnectionMonitoring(): void {
    // Monitor online/offline status
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Start health check interval
    this.startHealthCheck();

    // Initial connection attempt
    this.checkConnections();
  }

  private handleOnline(): void {
    console.log('🌐 Network connection restored');
    this.connectionState.isOnline = true;
    this.attemptReconnection();
  }

  private handleOffline(): void {
    console.log('📴 Network connection lost');
    this.connectionState.isOnline = false;
    this.updateConnectionState('firestore', 'disconnected');
    this.updateConnectionState('realtimedb', 'disconnected');
    this.updateConnectionState('auth', 'disconnected');
  }

  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(() => {
      this.checkConnections();
    }, REALTIME_CONFIG.heartbeatInterval);
  }

  private async checkConnections(): Promise<void> {
    this.connectionState.lastCheck = new Date();

    // Check Firestore connection - avoid redundant enableNetwork calls
    try {
      // Only call enableNetwork if we're not already enabling and network is disabled
      if (!this.isEnablingNetwork && !this.isNetworkEnabled) {
        this.isEnablingNetwork = true;
        await enableNetwork(db);
        this.isNetworkEnabled = true;
        this.isEnablingNetwork = false;
      }
      
      this.updateConnectionState('firestore', 'connected');
      this.reconnectAttempts = 0; // Reset on successful connection
    } catch (error) {
      this.isEnablingNetwork = false;
      console.error('Firestore connection check failed:', error);
      this.updateConnectionState('firestore', 'error');
      this.handleConnectionError('firestore');
    }

    // Check Realtime Database connection
    try {
      // Realtime Database doesn't have a direct ping method,
      // but we can check if we can set a test value
      const testRef = ref(rtdb, '.info/connected');
      onValue(testRef, (snapshot) => {
        if (snapshot.val() === true) {
          this.updateConnectionState('realtimedb', 'connected');
          this.reconnectAttempts = 0;
        } else {
          this.updateConnectionState('realtimedb', 'disconnected');
        }
      });
    } catch (error) {
      console.error('Realtime Database connection check failed:', error);
      this.updateConnectionState('realtimedb', 'error');
      this.handleConnectionError('realtimedb');
    }

    // Check Auth connection
    try {
      // Auth connection is generally stable if Firebase is initialized
      if (auth.currentUser !== undefined) {
        this.updateConnectionState('auth', 'connected');
      } else {
        this.updateConnectionState('auth', 'disconnected');
      }
    } catch (error) {
      console.error('Auth connection check failed:', error);
      this.updateConnectionState('auth', 'error');
    }
  }

  private updateConnectionState(
    service: keyof Omit<ConnectionState, 'lastCheck' | 'isOnline'>,
    status: 'connected' | 'disconnected' | 'error'
  ): void {
    this.connectionState[service] = status;
    this.notifyListeners();
  }

  private handleConnectionError(service: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnection();
    } else {
      console.error(`⚠️ Max reconnection attempts reached for ${service}`);
    }
  }

  private scheduleReconnection(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = Math.min(
      REALTIME_CONFIG.retryDelay * Math.pow(2, this.reconnectAttempts),
      30000 // Max 30 seconds
    );

    console.log(`🔄 Scheduling reconnection in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimeout = setTimeout(() => {
      this.attemptReconnection();
    }, delay);
  }

  private async attemptReconnection(): Promise<void> {
    if (!this.connectionState.isOnline) {
      console.log('📴 Cannot reconnect: offline');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    try {
      // Re-enable network connections only if needed
      if (!this.isEnablingNetwork && !this.isNetworkEnabled) {
        this.isEnablingNetwork = true;
        await enableNetwork(db);
        this.isNetworkEnabled = true;
        this.isEnablingNetwork = false;
      }
      goOnline(rtdb);
      
      // Check connections
      await this.checkConnections();
      
      console.log('✅ Reconnection successful');
      
    } catch (error) {
      this.isEnablingNetwork = false;
      console.error('❌ Reconnection failed:', error);
      this.handleConnectionError('reconnection');
    }
  }

  // Public methods
  public getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  public isConnected(): boolean {
    return this.connectionState.firestore === 'connected' && 
           this.connectionState.realtimedb === 'connected';
  }

  public onConnectionChange(callback: (state: ConnectionState) => void): () => void {
    this.listeners.push(callback);
    
    // Immediately call with current state
    callback(this.getConnectionState());

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => {
      try {
        callback(this.getConnectionState());
      } catch (error) {
        console.error('Error in connection state listener:', error);
      }
    });
  }

  public async forceReconnect(): Promise<void> {
    console.log('🔄 Force reconnect requested');
    this.reconnectAttempts = 0;
    await this.attemptReconnection();
  }

  public async goOffline(): Promise<void> {
    console.log('📴 Going offline manually');
    try {
      if (this.isNetworkEnabled) {
        await disableNetwork(db);
        this.isNetworkEnabled = false;
      }
      goOffline(rtdb);
      this.updateConnectionState('firestore', 'disconnected');
      this.updateConnectionState('realtimedb', 'disconnected');
    } catch (error) {
      console.error('Error going offline:', error);
    }
  }

  public async goOnline(): Promise<void> {
    console.log('🌐 Going online manually');
    try {
      if (!this.isEnablingNetwork && !this.isNetworkEnabled) {
        this.isEnablingNetwork = true;
        await enableNetwork(db);
        this.isNetworkEnabled = true;
        this.isEnablingNetwork = false;
      }
      goOnline(rtdb);
      await this.checkConnections();
    } catch (error) {
      this.isEnablingNetwork = false;
      console.error('Error going online:', error);
    }
  }

  public cleanup(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    
    this.listeners = [];
  }

  // Development helpers
  public async connectToEmulators(): Promise<void> {
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_EMULATORS === 'true') {
      try {
        console.log('🧪 Connecting to Firebase emulators...');
        
        // Only connect if not already connected
        const isEmulatorConnected = (db as any)._delegate?._databaseId?.projectId?.includes('demo-');
        
        if (!isEmulatorConnected) {
          connectFirestoreEmulator(db, 'localhost', 8080);
          connectAuthEmulator(auth, 'http://localhost:9099');
          connectDatabaseEmulator(rtdb, 'localhost', 9000);
          
          console.log('✅ Connected to Firebase emulators');
          
          // Update connection states
          this.updateConnectionState('firestore', 'connected');
          this.updateConnectionState('realtimedb', 'connected');
          this.updateConnectionState('auth', 'connected');
        }
        
      } catch (error) {
        console.error('❌ Error connecting to emulators:', error);
      }
    }
  }

  // Health metrics for monitoring
  public getHealthMetrics(): {
    uptime: number;
    reconnectAttempts: number;
    lastSuccessfulConnection: Date;
    isHealthy: boolean;
  } {
    return {
      uptime: Date.now() - this.connectionState.lastCheck.getTime(),
      reconnectAttempts: this.reconnectAttempts,
      lastSuccessfulConnection: this.connectionState.lastCheck,
      isHealthy: this.isConnected() && this.connectionState.isOnline
    };
  }
}

// Export singleton instance
export const firebaseConnection = FirebaseConnectionService.getInstance();

// React Hook for connection state

export function useFirebaseConnection() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    firebaseConnection.getConnectionState()
  );

  useEffect(() => {
    const unsubscribe = firebaseConnection.onConnectionChange(setConnectionState);
    return unsubscribe;
  }, []);

  return {
    connectionState,
    isConnected: firebaseConnection.isConnected(),
    forceReconnect: () => firebaseConnection.forceReconnect(),
    goOffline: () => firebaseConnection.goOffline(),
    goOnline: () => firebaseConnection.goOnline(),
    healthMetrics: firebaseConnection.getHealthMetrics()
  };
}

// For non-React usage
export default firebaseConnection;