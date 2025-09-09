// Trusted Device Service
// Handles automatic login for frequently used devices

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

interface DeviceFingerprint {
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  cookieEnabled: boolean;
  localStorage: boolean;
}

interface LoginAttempt {
  timestamp: Date;
  success: boolean;
  ipAddress?: string;
}

interface TrustedDevice {
  deviceId: string;
  operatorId: string;
  operatorName: string;
  fingerprint: DeviceFingerprint;
  loginCount: number;
  successfulLogins: number;
  lastLoginDate: Date;
  firstLoginDate: Date;
  loginHistory: LoginAttempt[];
  isTrusted: boolean;
  isActive: boolean;
}

class TrustedDeviceService {
  private collectionName = 'trusted_devices';
  private deviceKey = 'tsaerp_device_id';
  private minLoginCount = 5; // Minimum logins to become trusted
  private maxTrustedDevices = 3; // Max trusted devices per operator
  private trustExpireDays = 30; // Trust expires after 30 days of no login

  // Generate unique device fingerprint
  private generateDeviceFingerprint(): DeviceFingerprint {
    return {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      localStorage: typeof Storage !== 'undefined'
    };
  }

  // Generate device ID based on fingerprint
  private generateDeviceId(fingerprint: DeviceFingerprint): string {
    const combined = Object.values(fingerprint).join('|');
    // Simple hash function (in production, use crypto.subtle.digest)
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Get current device ID
  private getCurrentDeviceId(): string {
    let deviceId = localStorage.getItem(this.deviceKey);
    if (!deviceId) {
      const fingerprint = this.generateDeviceFingerprint();
      deviceId = this.generateDeviceId(fingerprint);
      localStorage.setItem(this.deviceKey, deviceId);
    }
    return deviceId;
  }

  // Get all trusted devices
  private getTrustedDevices(): TrustedDevice[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading trusted devices:', error);
      return [];
    }
  }

  // Save trusted devices
  private saveTrustedDevices(devices: TrustedDevice[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(devices));
    } catch (error) {
      console.error('Error saving trusted devices:', error);
    }
  }

  // Check if current device is trusted for operator
  isDeviceTrusted(operatorId: string): boolean {
    const deviceId = this.getCurrentDeviceId();
    const trustedDevices = this.getTrustedDevices();
    
    const device = trustedDevices.find(d => 
      d.deviceId === deviceId && 
      d.operatorId === operatorId &&
      d.isTrusted &&
      d.isActive
    );

    if (!device) return false;

    // Check if trust has expired
    const daysSinceLastLogin = (Date.now() - new Date(device.lastLoginDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastLogin > this.trustExpireDays) {
      this.revokeTrust(operatorId, deviceId);
      return false;
    }

    return true;
  }

  // Get trusted device info
  getTrustedDevice(operatorId: string): TrustedDevice | null {
    const deviceId = this.getCurrentDeviceId();
    const trustedDevices = this.getTrustedDevices();
    
    return trustedDevices.find(d => 
      d.deviceId === deviceId && 
      d.operatorId === operatorId
    ) || null;
  }

  // Record login attempt
  recordLoginAttempt(operatorId: string, operatorName: string, success: boolean): void {
    const deviceId = this.getCurrentDeviceId();
    const fingerprint = this.generateDeviceFingerprint();
    const trustedDevices = this.getTrustedDevices();
    
    let device = trustedDevices.find(d => d.deviceId === deviceId && d.operatorId === operatorId);
    
    const loginAttempt: LoginAttempt = {
      timestamp: new Date(),
      success,
      ipAddress: this.getApproximateIP()
    };

    if (device) {
      // Update existing device
      device.loginCount++;
      if (success) {
        device.successfulLogins++;
        device.lastLoginDate = new Date();
      }
      device.loginHistory.push(loginAttempt);
      
      // Keep only last 50 login attempts
      if (device.loginHistory.length > 50) {
        device.loginHistory = device.loginHistory.slice(-50);
      }

      // Check if device should become trusted
      if (!device.isTrusted && device.successfulLogins >= this.minLoginCount) {
        device.isTrusted = true;
        console.log(`🔒 Device ${deviceId} is now trusted for ${operatorName}`);
        
        // Show notification to operator
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('Device Trusted! 🔒', {
              body: `This device is now trusted. Next time you can login automatically.`,
              icon: '/icons/trust.png'
            });
          }
        }
      }
    } else {
      // Create new device record
      device = {
        deviceId,
        operatorId,
        operatorName,
        fingerprint,
        loginCount: 1,
        successfulLogins: success ? 1 : 0,
        lastLoginDate: new Date(),
        firstLoginDate: new Date(),
        loginHistory: [loginAttempt],
        isTrusted: false,
        isActive: true
      };
      trustedDevices.push(device);
    }

    // Clean up old/inactive devices for this operator
    this.cleanupDevicesForOperator(operatorId, trustedDevices);
    
    this.saveTrustedDevices(trustedDevices);
  }

  // Clean up old devices for operator (keep only recent ones)
  private cleanupDevicesForOperator(operatorId: string, devices: TrustedDevice[]): void {
    const operatorDevices = devices.filter(d => d.operatorId === operatorId);
    
    if (operatorDevices.length > this.maxTrustedDevices) {
      // Sort by last login date, keep most recent
      operatorDevices.sort((a, b) => new Date(b.lastLoginDate).getTime() - new Date(a.lastLoginDate).getTime());
      
      // Mark old devices as inactive
      operatorDevices.slice(this.maxTrustedDevices).forEach(device => {
        device.isActive = false;
        device.isTrusted = false;
      });
    }

    // Remove devices not used for more than 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    
    operatorDevices.forEach(device => {
      if (new Date(device.lastLoginDate) < cutoffDate) {
        device.isActive = false;
        device.isTrusted = false;
      }
    });
  }

  // Revoke trust for a device
  revokeTrust(operatorId: string, deviceId?: string): void {
    const targetDeviceId = deviceId || this.getCurrentDeviceId();
    const trustedDevices = this.getTrustedDevices();
    
    const device = trustedDevices.find(d => d.deviceId === targetDeviceId && d.operatorId === operatorId);
    if (device) {
      device.isTrusted = false;
      device.isActive = false;
      this.saveTrustedDevices(trustedDevices);
    }
  }

  // Get device login statistics
  getDeviceStats(operatorId: string): {
    loginCount: number;
    successfulLogins: number;
    isTrusted: boolean;
    daysSinceFirst: number;
    recentLogins: LoginAttempt[];
  } | null {
    const device = this.getTrustedDevice(operatorId);
    if (!device) return null;

    const daysSinceFirst = Math.floor(
      (Date.now() - new Date(device.firstLoginDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      loginCount: device.loginCount,
      successfulLogins: device.successfulLogins,
      isTrusted: device.isTrusted,
      daysSinceFirst,
      recentLogins: device.loginHistory.slice(-10) // Last 10 attempts
    };
  }

  // Get all trusted devices for operator (for security management)
  getTrustedDevicesForOperator(operatorId: string): TrustedDevice[] {
    return this.getTrustedDevices().filter(d => 
      d.operatorId === operatorId && d.isTrusted && d.isActive
    );
  }

  // Simple IP approximation (for logging purposes only)
  private getApproximateIP(): string {
    // In a real app, you might get this from a geolocation service
    // This is just for basic logging
    return 'local';
  }

  // Clear all trusted devices (security reset)
  clearAllTrustedDevices(): void {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.deviceKey);
  }

  // Get security summary
  getSecuritySummary(): {
    totalDevices: number;
    trustedDevices: number;
    operators: string[];
    oldestTrust: Date | null;
  } {
    const devices = this.getTrustedDevices();
    const trustedDevices = devices.filter(d => d.isTrusted && d.isActive);
    const operators = [...new Set(devices.map(d => d.operatorName))];
    
    let oldestTrust: Date | null = null;
    if (trustedDevices.length > 0) {
      oldestTrust = trustedDevices.reduce((oldest, device) => {
        const deviceDate = new Date(device.firstLoginDate);
        return !oldest || deviceDate < oldest ? deviceDate : oldest;
      }, null as Date | null);
    }

    return {
      totalDevices: devices.length,
      trustedDevices: trustedDevices.length,
      operators,
      oldestTrust
    };
  }
}

export const trustedDeviceService = new TrustedDeviceService();
export { TrustedDeviceService, type TrustedDevice, type LoginAttempt };