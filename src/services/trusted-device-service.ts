// Trusted Device Service - Firebase Edition
// Handles automatic login for frequently used devices with Firebase backend

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
import { appCache } from './cache-service';

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
  operatorId: string;
}

interface TrustedDevice {
  id?: string;
  deviceId: string;
  operatorId: string;
  operatorName: string;
  deviceFingerprint: DeviceFingerprint;
  deviceInfo: {
    browser: string;
    os: string;
    device: string;
  };
  firstSeenDate: Date;
  lastLoginDate: Date;
  loginCount: number;
  loginHistory: LoginAttempt[];
  isTrusted: boolean;
  isActive: boolean;
}

class TrustedDeviceService {
  private collectionName = 'trusted_devices';
  private deviceKey = 'tsaerp_device_id';
  private minLoginCount = 3; // Minimum logins to become trusted (reduced for development)
  private maxTrustedDevices = 5; // Max trusted devices per operator
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
      localStorage: typeof(Storage) !== "undefined"
    };
  }

  // Generate or get device ID
  private getCurrentDeviceId(): string {
    let deviceId = localStorage.getItem(this.deviceKey);
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(this.deviceKey, deviceId);
    }
    return deviceId;
  }

  // Get all trusted devices from Firebase with intelligent caching
  async getTrustedDevices(): Promise<TrustedDevice[]> {
    // Try to get from cache first
    const cached = appCache.get<TrustedDevice[]>('trusted_devices_all');
    if (cached) {
      console.log('📦 Retrieved trusted devices from cache');
      return cached;
    }

    try {
      const devicesRef = collection(db, this.collectionName);
      const snapshot = await getDocs(query(devicesRef, orderBy('lastLoginDate', 'desc')));
      
      const devices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore Timestamps to Dates
        firstSeenDate: doc.data().firstSeenDate?.toDate() || new Date(),
        lastLoginDate: doc.data().lastLoginDate?.toDate() || new Date(),
        loginHistory: doc.data().loginHistory?.map((login: any) => ({
          ...login,
          timestamp: login.timestamp?.toDate() || new Date()
        })) || []
      })) as TrustedDevice[];

      // Cache the result for 5 minutes with high priority
      appCache.set('trusted_devices_all', devices, 5 * 60 * 1000, 'high');
      console.log('🔥 Loaded trusted devices from Firebase and cached');
      
      return devices;
    } catch (error) {
      console.error('Error loading trusted devices from Firebase:', error);
      return [];
    }
  }

  // Get trusted devices for specific operator with caching
  async getTrustedDevicesForOperator(operatorId: string): Promise<TrustedDevice[]> {
    // Check cache first
    const cached = appCache.get<TrustedDevice[]>('trusted_devices_operator', { operatorId });
    if (cached) {
      console.log(`📦 Retrieved trusted devices for ${operatorId} from cache`);
      return cached;
    }

    try {
      const devicesRef = collection(db, this.collectionName);
      const q = query(
        devicesRef, 
        where('operatorId', '==', operatorId),
        where('isActive', '==', true),
        orderBy('lastLoginDate', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const devices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        firstSeenDate: doc.data().firstSeenDate?.toDate() || new Date(),
        lastLoginDate: doc.data().lastLoginDate?.toDate() || new Date(),
        loginHistory: doc.data().loginHistory?.map((login: any) => ({
          ...login,
          timestamp: login.timestamp?.toDate() || new Date()
        })) || []
      })) as TrustedDevice[];

      // Cache for 3 minutes with medium priority
      appCache.set('trusted_devices_operator', devices, 3 * 60 * 1000, 'medium', { operatorId });
      console.log(`🔥 Loaded trusted devices for ${operatorId} from Firebase and cached`);
      
      return devices;
    } catch (error) {
      console.error('Error loading trusted devices for operator:', error);
      return [];
    }
  }

  // Check if current device is trusted for operator
  async isDeviceTrusted(operatorId: string): Promise<boolean> {
    try {
      const deviceId = this.getCurrentDeviceId();
      const devicesRef = collection(db, this.collectionName);
      const q = query(
        devicesRef,
        where('deviceId', '==', deviceId),
        where('operatorId', '==', operatorId),
        where('isTrusted', '==', true),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return false;

      const device = snapshot.docs[0].data() as TrustedDevice;
      
      // Check if trust has expired
      const daysSinceLastLogin = (Date.now() - (device.lastLoginDate?.toDate?.() || device.lastLoginDate).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastLogin > this.trustExpireDays) {
        await this.revokeTrust(operatorId, deviceId);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking device trust:', error);
      return false;
    }
  }

  // Get trusted device info
  async getTrustedDevice(operatorId: string): Promise<TrustedDevice | null> {
    try {
      const deviceId = this.getCurrentDeviceId();
      const devicesRef = collection(db, this.collectionName);
      const q = query(
        devicesRef,
        where('deviceId', '==', deviceId),
        where('operatorId', '==', operatorId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        firstSeenDate: doc.data().firstSeenDate?.toDate() || new Date(),
        lastLoginDate: doc.data().lastLoginDate?.toDate() || new Date(),
        loginHistory: doc.data().loginHistory?.map((login: any) => ({
          ...login,
          timestamp: login.timestamp?.toDate() || new Date()
        })) || []
      } as TrustedDevice;
    } catch (error) {
      console.error('Error getting trusted device:', error);
      return null;
    }
  }

  // Record login attempt
  async recordLogin(operatorId: string, operatorName: string, success: boolean, ipAddress?: string): Promise<void> {
    try {
      const deviceId = this.getCurrentDeviceId();
      const loginAttempt: LoginAttempt = {
        timestamp: new Date(),
        success,
        ipAddress,
        operatorId
      };

      // Check if device exists
      const existingDevice = await this.getTrustedDevice(operatorId);

      if (existingDevice && existingDevice.id) {
        // Update existing device
        const updatedHistory = [...(existingDevice.loginHistory || []), loginAttempt];
        const loginCount = existingDevice.loginCount + (success ? 1 : 0);
        
        // Determine if device should be trusted
        const shouldBeTrusted = success && loginCount >= this.minLoginCount;
        
        await updateDoc(doc(db, this.collectionName, existingDevice.id), {
          lastLoginDate: serverTimestamp(),
          loginCount,
          loginHistory: updatedHistory.map(login => ({
            ...login,
            timestamp: Timestamp.fromDate(login.timestamp)
          })),
          isTrusted: shouldBeTrusted || existingDevice.isTrusted,
          isActive: true
        });

        // Invalidate cache after update
        appCache.invalidatePattern('trusted_devices_*');
        console.log(`✅ Updated existing device for ${operatorName}. Trusted: ${shouldBeTrusted || existingDevice.isTrusted}`);
      } else {
        // Create new device entry
        const deviceFingerprint = this.generateDeviceFingerprint();
        const deviceInfo = this.parseUserAgent(navigator.userAgent);

        const newDevice: Omit<TrustedDevice, 'id'> = {
          deviceId,
          operatorId,
          operatorName,
          deviceFingerprint,
          deviceInfo,
          firstSeenDate: new Date(),
          lastLoginDate: new Date(),
          loginCount: success ? 1 : 0,
          loginHistory: [loginAttempt],
          isTrusted: false, // New devices start untrusted
          isActive: true
        };

        await addDoc(collection(db, this.collectionName), {
          ...newDevice,
          firstSeenDate: serverTimestamp(),
          lastLoginDate: serverTimestamp(),
          loginHistory: newDevice.loginHistory.map(login => ({
            ...login,
            timestamp: Timestamp.fromDate(login.timestamp)
          }))
        });

        // Invalidate cache after new device creation
        appCache.invalidatePattern('trusted_devices_*');
        console.log(`✅ Created new device entry for ${operatorName}`);
      }
    } catch (error) {
      console.error('Error recording login:', error);
    }
  }

  // Grant trust to current device
  async grantTrust(operatorId: string): Promise<boolean> {
    try {
      const device = await this.getTrustedDevice(operatorId);
      if (!device || !device.id) return false;

      await updateDoc(doc(db, this.collectionName, device.id), {
        isTrusted: true,
        isActive: true
      });

      // Invalidate cache after trust change
      appCache.invalidatePattern('trusted_devices_*');
      console.log(`✅ Granted trust to device for operator ${operatorId}`);
      return true;
    } catch (error) {
      console.error('Error granting trust:', error);
      return false;
    }
  }

  // Revoke trust from device (overloaded method for compatibility)
  async revokeTrust(operatorIdOrDeviceId: string, deviceId?: string): Promise<boolean> {
    try {
      let targetOperatorId: string;
      let targetDeviceId: string;
      
      if (deviceId) {
        // Called with (operatorId, deviceId)
        targetOperatorId = operatorIdOrDeviceId;
        targetDeviceId = deviceId;
      } else {
        // Called with just operatorId - use current device
        targetOperatorId = operatorIdOrDeviceId;
        targetDeviceId = this.getCurrentDeviceId();
      }
      
      const devicesRef = collection(db, this.collectionName);
      const q = query(
        devicesRef,
        where('deviceId', '==', targetDeviceId),
        where('operatorId', '==', targetOperatorId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return false;

      const deviceDoc = snapshot.docs[0];
      await updateDoc(deviceDoc.ref, {
        isTrusted: false
      });

      // Invalidate cache after trust revocation
      appCache.invalidatePattern('trusted_devices_*');
      console.log(`✅ Revoked trust from device for operator ${targetOperatorId}`);
      return true;
    } catch (error) {
      console.error('Error revoking trust:', error);
      return false;
    }
  }

  // Remove device completely
  async removeDevice(deviceId: string, operatorId: string): Promise<boolean> {
    try {
      const devicesRef = collection(db, this.collectionName);
      const q = query(
        devicesRef,
        where('deviceId', '==', deviceId),
        where('operatorId', '==', operatorId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return false;

      await deleteDoc(snapshot.docs[0].ref);
      
      // Invalidate cache after device removal
      appCache.invalidatePattern('trusted_devices_*');
      console.log(`✅ Removed device ${deviceId} for operator ${operatorId}`);
      return true;
    } catch (error) {
      console.error('Error removing device:', error);
      return false;
    }
  }

  // Parse user agent for device info
  private parseUserAgent(userAgent: string) {
    const browser = this.detectBrowser(userAgent);
    const os = this.detectOS(userAgent);
    const device = this.detectDevice(userAgent);

    return { browser, os, device };
  }

  private detectBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  private detectOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private detectDevice(userAgent: string): string {
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }

  // Get device statistics
  async getDeviceStatistics(): Promise<{
    totalDevices: number;
    trustedDevices: number;
    activeDevices: number;
    recentLogins: number;
  }> {
    try {
      const devices = await this.getTrustedDevices();
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      return {
        totalDevices: devices.length,
        trustedDevices: devices.filter(d => d.isTrusted).length,
        activeDevices: devices.filter(d => d.isActive).length,
        recentLogins: devices.filter(d => d.lastLoginDate > oneDayAgo).length
      };
    } catch (error) {
      console.error('Error getting device statistics:', error);
      return {
        totalDevices: 0,
        trustedDevices: 0,
        activeDevices: 0,
        recentLogins: 0
      };
    }
  }

  // Get device stats for current device and specific operator
  async getDeviceStats(operatorId: string): Promise<{
    isTrusted: boolean;
    successfulLogins: number;
    loginCount: number;
    lastLoginDate: Date | null;
    deviceExists: boolean;
  } | null> {
    try {
      const device = await this.getTrustedDevice(operatorId);
      
      if (!device) {
        return {
          isTrusted: false,
          successfulLogins: 0,
          loginCount: 0,
          lastLoginDate: null,
          deviceExists: false
        };
      }

      const successfulLogins = device.loginHistory.filter(login => login.success).length;
      
      return {
        isTrusted: device.isTrusted,
        successfulLogins,
        loginCount: device.loginCount,
        lastLoginDate: device.lastLoginDate,
        deviceExists: true
      };
    } catch (error) {
      console.error('Error getting device stats:', error);
      return null;
    }
  }

  // Record login attempt (updated method name for compatibility)
  async recordLoginAttempt(operatorId: string, operatorName: string, success: boolean, ipAddress?: string): Promise<void> {
    return this.recordLogin(operatorId, operatorName, success, ipAddress);
  }

  // Auto-login for trusted devices
  async performTrustedLogin(operatorId: string): Promise<boolean> {
    try {
      const isTrusted = await this.isDeviceTrusted(operatorId);
      
      if (!isTrusted) {
        console.log(`🚫 Device not trusted for operator ${operatorId}`);
        return false;
      }

      // Record successful trusted login
      const device = await this.getTrustedDevice(operatorId);
      if (device) {
        await this.recordLogin(operatorId, device.operatorName, true);
        console.log(`✅ Auto-login successful for trusted device - ${device.operatorName}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error performing trusted login:', error);
      return false;
    }
  }
}

// Create singleton instance
export const trustedDeviceService = new TrustedDeviceService();

// Export types
export type { TrustedDevice, LoginAttempt, DeviceFingerprint };

export default trustedDeviceService;