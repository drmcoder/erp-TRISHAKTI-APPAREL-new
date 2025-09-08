// Session Management Service
// Handles login persistence, auto-logout, and session validation

import { auth } from '../config/firebase';
import { ENV_CONFIG } from '../config/environment';
import { 
  onAuthStateChanged, 
  signOut, 
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import type { User } from 'firebase/auth';

export interface SessionConfig {
  maxInactivityTime: number; // milliseconds
  warningTime: number; // milliseconds before auto-logout warning
  enablePersistence: boolean;
  persistenceType: 'session' | 'local'; // session = browser tab only, local = across browser sessions
  enableActivityTracking: boolean;
  enableMultiTabSync: boolean;
}

export interface SessionState {
  isAuthenticated: boolean;
  user: User | null;
  sessionStart: number;
  lastActivity: number;
  timeUntilExpiry: number;
  isExpiringSoon: boolean;
}

export type SessionEventType = 
  | 'session_start'
  | 'session_end' 
  | 'session_warning'
  | 'session_expired'
  | 'activity_detected'
  | 'multi_tab_sync';

export interface SessionEvent {
  type: SessionEventType;
  timestamp: number;
  data?: any;
}

export class SessionManager {
  private config: SessionConfig;
  private activityTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private sessionState: SessionState;
  private eventListeners: Map<SessionEventType, ((event: SessionEvent) => void)[]> = new Map();
  private storageKey = 'tsa_erp_session';

  constructor(config?: Partial<SessionConfig>) {
    // Default configuration
    this.config = {
      maxInactivityTime: ENV_CONFIG.isProduction ? 30 * 60 * 1000 : 60 * 60 * 1000, // 30 min prod, 1 hour dev
      warningTime: 5 * 60 * 1000, // 5 minutes warning
      enablePersistence: true,
      persistenceType: 'local', // Remember across browser sessions
      enableActivityTracking: true,
      enableMultiTabSync: true,
      ...config
    };

    this.sessionState = {
      isAuthenticated: false,
      user: null,
      sessionStart: 0,
      lastActivity: Date.now(),
      timeUntilExpiry: 0,
      isExpiringSoon: false
    };

    this.initialize();
  }

  // Initialize session management
  private async initialize(): Promise<void> {
    try {
      // Set Firebase Auth persistence
      if (this.config.enablePersistence) {
        const persistence = this.config.persistenceType === 'local' 
          ? browserLocalPersistence 
          : browserSessionPersistence;
        
        await setPersistence(auth, persistence);
        console.log(`🔐 Firebase Auth persistence set to: ${this.config.persistenceType}`);
      }

      // Monitor auth state changes
      onAuthStateChanged(auth, (user) => {
        this.handleAuthStateChange(user);
      });

      // Set up activity tracking
      if (this.config.enableActivityTracking) {
        this.setupActivityTracking();
      }

      // Set up multi-tab sync
      if (this.config.enableMultiTabSync) {
        this.setupMultiTabSync();
      }

      // Restore session state from localStorage
      this.restoreSessionState();

      console.log('✅ Session Manager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Session Manager:', error);
    }
  }

  // Handle authentication state changes
  private handleAuthStateChange(user: User | null): void {
    const wasAuthenticated = this.sessionState.isAuthenticated;

    if (user) {
      // User logged in
      this.sessionState = {
        isAuthenticated: true,
        user,
        sessionStart: Date.now(),
        lastActivity: Date.now(),
        timeUntilExpiry: this.config.maxInactivityTime,
        isExpiringSoon: false
      };

      if (!wasAuthenticated) {
        this.emitEvent('session_start', { user: user.uid });
        console.log(`🔐 Session started for user: ${user.email || user.uid}`);
      }

      this.startActivityTimer();
      this.saveSessionState();
    } else {
      // User logged out
      if (wasAuthenticated) {
        this.emitEvent('session_end', { 
          sessionDuration: Date.now() - this.sessionState.sessionStart 
        });
        console.log('🔓 Session ended');
      }

      this.sessionState = {
        isAuthenticated: false,
        user: null,
        sessionStart: 0,
        lastActivity: 0,
        timeUntilExpiry: 0,
        isExpiringSoon: false
      };

      this.clearTimers();
      this.clearSessionState();
    }
  }

  // Set up activity tracking
  private setupActivityTracking(): void {
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (this.sessionState.isAuthenticated) {
        this.updateActivity();
      }
    };

    // Add activity listeners
    activityEvents.forEach(eventType => {
      document.addEventListener(eventType, handleActivity, true);
    });

    // Track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.sessionState.isAuthenticated) {
        this.updateActivity();
      }
    });

    // Track focus changes
    window.addEventListener('focus', () => {
      if (this.sessionState.isAuthenticated) {
        this.updateActivity();
      }
    });
  }

  // Update user activity
  private updateActivity(): void {
    const now = Date.now();
    const timeSinceLastActivity = now - this.sessionState.lastActivity;

    // Only update if enough time has passed (throttle)
    if (timeSinceLastActivity > 1000) { // 1 second throttle
      this.sessionState.lastActivity = now;
      this.sessionState.timeUntilExpiry = this.config.maxInactivityTime;
      this.sessionState.isExpiringSoon = false;

      this.emitEvent('activity_detected', { timestamp: now });
      this.saveSessionState();

      // Reset timers
      this.startActivityTimer();
    }
  }

  // Start activity timer for auto-logout
  private startActivityTimer(): void {
    this.clearTimers();

    // Set warning timer
    this.warningTimer = setTimeout(() => {
      this.sessionState.isExpiringSoon = true;
      this.emitEvent('session_warning', {
        timeRemaining: this.config.warningTime,
        warningMessage: `Your session will expire in ${this.config.warningTime / 60000} minutes due to inactivity.`
      });
      console.warn('⚠️ Session expiring soon due to inactivity');
    }, this.config.maxInactivityTime - this.config.warningTime);

    // Set auto-logout timer
    this.activityTimer = setTimeout(() => {
      this.autoLogout('inactivity');
    }, this.config.maxInactivityTime);
  }

  // Auto logout with reason
  private async autoLogout(reason: 'inactivity' | 'security' | 'manual'): Promise<void> {
    try {
      this.emitEvent('session_expired', { reason });
      console.log(`🔓 Auto-logout triggered: ${reason}`);
      
      await signOut(auth);
    } catch (error) {
      console.error('❌ Error during auto-logout:', error);
    }
  }

  // Clear all timers
  private clearTimers(): void {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
      this.activityTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  // Multi-tab synchronization
  private setupMultiTabSync(): void {
    // Listen for storage changes from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey) {
        const newSessionData = event.newValue ? JSON.parse(event.newValue) : null;
        
        if (!newSessionData && this.sessionState.isAuthenticated) {
          // Session ended in another tab, logout here too
          this.autoLogout('security');
        } else if (newSessionData && newSessionData.lastActivity > this.sessionState.lastActivity) {
          // Activity detected in another tab, sync the state
          this.sessionState.lastActivity = newSessionData.lastActivity;
          this.startActivityTimer();
          this.emitEvent('multi_tab_sync', { source: 'other_tab' });
        }
      }
    });

    // Send periodic heartbeat for tab coordination
    setInterval(() => {
      if (this.sessionState.isAuthenticated) {
        this.saveSessionState();
      }
    }, 30000); // 30 seconds
  }

  // Save session state to localStorage
  private saveSessionState(): void {
    if (this.config.enableMultiTabSync && this.sessionState.isAuthenticated) {
      const sessionData = {
        lastActivity: this.sessionState.lastActivity,
        sessionStart: this.sessionState.sessionStart,
        userId: this.sessionState.user?.uid,
        timestamp: Date.now()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(sessionData));
    }
  }

  // Restore session state from localStorage
  private restoreSessionState(): void {
    try {
      const sessionData = localStorage.getItem(this.storageKey);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        // Check if session data is still valid (not too old)
        const maxAge = this.config.maxInactivityTime * 2; // Allow double the inactivity time
        if (Date.now() - parsed.timestamp < maxAge) {
          console.log('🔄 Restored session state from localStorage');
        } else {
          this.clearSessionState();
          console.log('🧹 Cleared expired session state');
        }
      }
    } catch (error) {
      console.error('❌ Failed to restore session state:', error);
      this.clearSessionState();
    }
  }

  // Clear session state from localStorage
  private clearSessionState(): void {
    localStorage.removeItem(this.storageKey);
  }

  // Event emission system
  private emitEvent(type: SessionEventType, data?: any): void {
    const event: SessionEvent = {
      type,
      timestamp: Date.now(),
      data
    };

    const listeners = this.eventListeners.get(type) || [];
    listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`❌ Error in session event listener (${type}):`, error);
      }
    });
  }

  // Public API methods

  // Add event listener
  addEventListener(type: SessionEventType, callback: (event: SessionEvent) => void): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(callback);
  }

  // Remove event listener
  removeEventListener(type: SessionEventType, callback: (event: SessionEvent) => void): void {
    const listeners = this.eventListeners.get(type) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  // Get current session state
  getSessionState(): SessionState {
    return { ...this.sessionState };
  }

  // Check if session is about to expire
  isExpiringSoon(): boolean {
    if (!this.sessionState.isAuthenticated) return false;
    
    const timeUntilExpiry = this.config.maxInactivityTime - (Date.now() - this.sessionState.lastActivity);
    return timeUntilExpiry <= this.config.warningTime;
  }

  // Extend session (reset timer)
  extendSession(): void {
    if (this.sessionState.isAuthenticated) {
      this.updateActivity();
      console.log('🔄 Session extended by user action');
    }
  }

  // Manual logout
  async logout(): Promise<void> {
    await this.autoLogout('manual');
  }

  // Get time remaining until auto-logout
  getTimeUntilExpiry(): number {
    if (!this.sessionState.isAuthenticated) return 0;
    return Math.max(0, this.config.maxInactivityTime - (Date.now() - this.sessionState.lastActivity));
  }

  // Update session configuration
  updateConfig(newConfig: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart timers with new config
    if (this.sessionState.isAuthenticated) {
      this.startActivityTimer();
    }
    
    console.log('⚙️ Session configuration updated');
  }
}

// Export singleton instance
export const sessionManager = new SessionManager({
  // Custom config based on environment
  maxInactivityTime: ENV_CONFIG.isProduction ? 30 * 60 * 1000 : 2 * 60 * 60 * 1000, // 30 min prod, 2 hours dev
  warningTime: 5 * 60 * 1000, // 5 minutes warning
  enablePersistence: true,
  persistenceType: ENV_CONFIG.isProduction ? 'session' : 'local', // More secure in production
  enableActivityTracking: true,
  enableMultiTabSync: true
});

// Auto-configure logging
if (ENV_CONFIG.logging.debugMode) {
  sessionManager.addEventListener('session_start', (event) => {
    console.log('🔐 Session event:', event);
  });

  sessionManager.addEventListener('session_warning', (event) => {
    console.warn('⚠️ Session warning:', event);
  });

  sessionManager.addEventListener('session_expired', (event) => {
    console.error('🔓 Session expired:', event);
  });
}

export default sessionManager;