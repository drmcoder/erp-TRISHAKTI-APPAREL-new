// Login Monitoring Service
// Advanced monitoring and alerting for login activities

import { trustedDeviceService } from './trusted-device-service';
import { pushNotificationService } from './push-notification-service';

interface LoginAlert {
  id: string;
  type: 'suspicious_login' | 'failed_attempts' | 'unusual_frequency' | 'multiple_devices' | 'off_hours' | 'location_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  operatorId: string;
  operatorName: string;
  deviceId: string;
  timestamp: Date;
  details: string;
  resolved: boolean;
  adminNotified: boolean;
}

interface LoginPattern {
  operatorId: string;
  usualLoginHours: number[]; // Hours they typically login
  usualDays: string[]; // Days they typically login
  averageSessionDuration: number;
  typicalDeviceCount: number;
  baselineFrequency: number; // Normal logins per day
}

interface SecurityMetrics {
  totalAlerts: number;
  criticalAlerts: number;
  resolvedAlerts: number;
  suspiciousOperators: number;
  failedLoginRate: number;
  averageLoginFrequency: number;
  multipleDeviceOperators: number;
  offHoursLogins: number;
}

class LoginMonitoringService {
  private alerts: LoginAlert[] = [];
  private patterns: Map<string, LoginPattern> = new Map();
  private readonly alertStorageKey = 'tsaerp_login_alerts';
  private readonly patternStorageKey = 'tsaerp_login_patterns';

  // Monitoring thresholds
  private readonly thresholds = {
    maxFailedAttempts: 5, // Per hour
    maxDevicesPerOperator: 3,
    maxLoginsPerHour: 10,
    maxLoginsPerDay: 25,
    suspiciousFailureRate: 0.3, // 30% failure rate
    offHoursStart: 22, // 10 PM
    offHoursEnd: 6,    // 6 AM
    unusualFrequencyMultiplier: 3 // 3x normal frequency
  };

  constructor() {
    this.loadAlerts();
    this.loadPatterns();
    this.startMonitoring();
  }

  private loadAlerts(): void {
    try {
      const stored = localStorage.getItem(this.alertStorageKey);
      this.alerts = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading login alerts:', error);
      this.alerts = [];
    }
  }

  private saveAlerts(): void {
    try {
      localStorage.setItem(this.alertStorageKey, JSON.stringify(this.alerts));
    } catch (error) {
      console.error('Error saving login alerts:', error);
    }
  }

  private loadPatterns(): void {
    try {
      const stored = localStorage.getItem(this.patternStorageKey);
      if (stored) {
        const patterns = JSON.parse(stored);
        this.patterns = new Map(Object.entries(patterns));
      }
    } catch (error) {
      console.error('Error loading login patterns:', error);
    }
  }

  private savePatterns(): void {
    try {
      const patternsObj = Object.fromEntries(this.patterns);
      localStorage.setItem(this.patternStorageKey, JSON.stringify(patternsObj));
    } catch (error) {
      console.error('Error saving login patterns:', error);
    }
  }

  // Start monitoring service
  private startMonitoring(): void {
    // Monitor every 5 minutes
    setInterval(() => {
      this.performSecurityCheck();
    }, 5 * 60 * 1000);

    // Learn patterns every hour
    setInterval(() => {
      this.updateLoginPatterns();
    }, 60 * 60 * 1000);

    // Cleanup old alerts daily
    setInterval(() => {
      this.cleanupOldAlerts();
    }, 24 * 60 * 60 * 1000);
  }

  // Main security check routine
  private performSecurityCheck(): void {
    const devices = JSON.parse(localStorage.getItem('tsaerp_trusted_devices') || '[]');
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    devices.forEach(device => {
      // Check for failed login attempts
      this.checkFailedAttempts(device, hourAgo);
      
      // Check for unusual frequency
      this.checkUnusualFrequency(device);
      
      // Check for multiple devices
      this.checkMultipleDevices(device.operatorId, devices);
      
      // Check for off-hours login
      this.checkOffHoursLogin(device);
      
      // Check for suspicious patterns
      this.checkSuspiciousPatterns(device);
    });

    this.saveAlerts();
  }

  private checkFailedAttempts(device: any, hourAgo: Date): void {
    const recentFailures = device.loginHistory.filter(
      login => !login.success && new Date(login.timestamp) >= hourAgo
    );

    if (recentFailures.length >= this.thresholds.maxFailedAttempts) {
      this.createAlert({
        type: 'failed_attempts',
        severity: recentFailures.length >= 10 ? 'critical' : 'high',
        operatorId: device.operatorId,
        operatorName: device.operatorName,
        deviceId: device.deviceId,
        details: `${recentFailures.length} failed login attempts in the last hour`
      });
    }
  }

  private checkUnusualFrequency(device: any): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLogins = device.loginHistory.filter(
      login => new Date(login.timestamp) >= today
    ).length;

    const pattern = this.patterns.get(device.operatorId);
    const expectedFrequency = pattern?.baselineFrequency || 2;

    if (todayLogins >= expectedFrequency * this.thresholds.unusualFrequencyMultiplier) {
      this.createAlert({
        type: 'unusual_frequency',
        severity: todayLogins >= expectedFrequency * 5 ? 'critical' : 'medium',
        operatorId: device.operatorId,
        operatorName: device.operatorName,
        deviceId: device.deviceId,
        details: `${todayLogins} logins today (normal: ${expectedFrequency.toFixed(1)})`
      });
    }
  }

  private checkMultipleDevices(operatorId: string, allDevices: any[]): void {
    const operatorDevices = allDevices.filter(d => 
      d.operatorId === operatorId && d.isActive
    );

    if (operatorDevices.length > this.thresholds.maxDevicesPerOperator) {
      const device = operatorDevices[0];
      this.createAlert({
        type: 'multiple_devices',
        severity: operatorDevices.length > 5 ? 'high' : 'medium',
        operatorId: device.operatorId,
        operatorName: device.operatorName,
        deviceId: 'multiple',
        details: `Using ${operatorDevices.length} devices simultaneously`
      });
    }
  }

  private checkOffHoursLogin(device: any): void {
    const recentLogins = device.loginHistory.filter(login => {
      const loginDate = new Date(login.timestamp);
      const hoursSince = (Date.now() - loginDate.getTime()) / (1000 * 60 * 60);
      return hoursSince <= 1 && login.success; // Last hour successful logins
    });

    recentLogins.forEach(login => {
      const loginHour = new Date(login.timestamp).getHours();
      if (loginHour >= this.thresholds.offHoursStart || loginHour <= this.thresholds.offHoursEnd) {
        this.createAlert({
          type: 'off_hours',
          severity: 'low',
          operatorId: device.operatorId,
          operatorName: device.operatorName,
          deviceId: device.deviceId,
          details: `Login at ${loginHour}:00 (outside normal hours)`
        });
      }
    });
  }

  private checkSuspiciousPatterns(device: any): void {
    const recentLogins = device.loginHistory.slice(-20);
    const failureRate = recentLogins.filter(l => !l.success).length / recentLogins.length;

    if (failureRate >= this.thresholds.suspiciousFailureRate && recentLogins.length >= 10) {
      this.createAlert({
        type: 'suspicious_login',
        severity: failureRate >= 0.6 ? 'critical' : 'high',
        operatorId: device.operatorId,
        operatorName: device.operatorName,
        deviceId: device.deviceId,
        details: `High failure rate: ${(failureRate * 100).toFixed(1)}% in recent attempts`
      });
    }
  }

  private createAlert(alertData: Omit<LoginAlert, 'id' | 'timestamp' | 'resolved' | 'adminNotified'>): void {
    // Check if similar alert already exists (within last hour)
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existingAlert = this.alerts.find(alert => 
      alert.operatorId === alertData.operatorId &&
      alert.type === alertData.type &&
      alert.timestamp >= hourAgo &&
      !alert.resolved
    );

    if (existingAlert) {
      return; // Don't create duplicate alerts
    }

    const alert: LoginAlert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false,
      adminNotified: false
    };

    this.alerts.push(alert);

    // Send admin notification for critical/high severity alerts
    if (alert.severity === 'critical' || alert.severity === 'high') {
      this.notifyAdmin(alert);
    }
  }

  private async notifyAdmin(alert: LoginAlert): Promise<void> {
    try {
      // Send push notification to admin users
      await pushNotificationService.sendWorkAssignmentNotification({
        operatorId: 'admin',
        workBundleId: 'security_alert',
        assignmentType: 'quality_issue',
        priority: alert.severity === 'critical' ? 'urgent' : 'high',
        operation: `Security Alert: ${alert.type.replace('_', ' ')}`
      });

      alert.adminNotified = true;
    } catch (error) {
      console.error('Failed to notify admin:', error);
    }
  }

  // Update login patterns based on historical data
  private updateLoginPatterns(): void {
    const devices = JSON.parse(localStorage.getItem('tsaerp_trusted_devices') || '[]');
    const operatorGroups = new Map();

    // Group devices by operator
    devices.forEach(device => {
      if (!operatorGroups.has(device.operatorId)) {
        operatorGroups.set(device.operatorId, []);
      }
      operatorGroups.get(device.operatorId).push(device);
    });

    // Analyze patterns for each operator
    operatorGroups.forEach((operatorDevices, operatorId) => {
      const allLogins = operatorDevices.flatMap(d => d.loginHistory.filter(l => l.success));
      
      if (allLogins.length < 10) return; // Need minimum data

      const loginHours = allLogins.map(l => new Date(l.timestamp).getHours());
      const loginDays = allLogins.map(l => new Date(l.timestamp).toLocaleDateString('en', { weekday: 'short' }));
      
      const pattern: LoginPattern = {
        operatorId,
        usualLoginHours: this.findMostCommonHours(loginHours),
        usualDays: this.findMostCommonDays(loginDays),
        averageSessionDuration: 0, // Would need session tracking
        typicalDeviceCount: operatorDevices.length,
        baselineFrequency: this.calculateBaselineFrequency(allLogins)
      };

      this.patterns.set(operatorId, pattern);
    });

    this.savePatterns();
  }

  private findMostCommonHours(hours: number[]): number[] {
    const hourCounts = hours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const avgCount = hours.length / 24;
    return Object.entries(hourCounts)
      .filter(([, count]) => count > avgCount)
      .map(([hour]) => parseInt(hour));
  }

  private findMostCommonDays(days: string[]): string[] {
    const dayCounts = days.reduce((acc, day) => {
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgCount = days.length / 7;
    return Object.entries(dayCounts)
      .filter(([, count]) => count > avgCount)
      .map(([day]) => day);
  }

  private calculateBaselineFrequency(logins: any[]): number {
    const dailyLogins = new Map();
    
    logins.forEach(login => {
      const date = new Date(login.timestamp).toDateString();
      dailyLogins.set(date, (dailyLogins.get(date) || 0) + 1);
    });

    const frequencies = Array.from(dailyLogins.values());
    return frequencies.reduce((sum, freq) => sum + freq, 0) / Math.max(1, frequencies.length);
  }

  private cleanupOldAlerts(): void {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    this.alerts = this.alerts.filter(alert => 
      alert.timestamp >= thirtyDaysAgo || !alert.resolved
    );
    this.saveAlerts();
  }

  // Public API methods
  public getAlerts(filter?: { 
    resolved?: boolean; 
    severity?: string; 
    operatorId?: string;
    since?: Date;
  }): LoginAlert[] {
    let filtered = [...this.alerts];

    if (filter) {
      if (filter.resolved !== undefined) {
        filtered = filtered.filter(a => a.resolved === filter.resolved);
      }
      if (filter.severity) {
        filtered = filtered.filter(a => a.severity === filter.severity);
      }
      if (filter.operatorId) {
        filtered = filtered.filter(a => a.operatorId === filter.operatorId);
      }
      if (filter.since) {
        filtered = filtered.filter(a => a.timestamp >= filter.since!);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.saveAlerts();
    }
  }

  public getSecurityMetrics(): SecurityMetrics {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAlerts = this.alerts.filter(a => a.timestamp >= dayAgo);
    
    return {
      totalAlerts: recentAlerts.length,
      criticalAlerts: recentAlerts.filter(a => a.severity === 'critical').length,
      resolvedAlerts: recentAlerts.filter(a => a.resolved).length,
      suspiciousOperators: new Set(recentAlerts.map(a => a.operatorId)).size,
      failedLoginRate: this.calculateFailedLoginRate(),
      averageLoginFrequency: this.calculateAverageFrequency(),
      multipleDeviceOperators: this.countMultipleDeviceOperators(),
      offHoursLogins: recentAlerts.filter(a => a.type === 'off_hours').length
    };
  }

  private calculateFailedLoginRate(): number {
    const devices = JSON.parse(localStorage.getItem('tsaerp_trusted_devices') || '[]');
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    let totalLogins = 0;
    let failedLogins = 0;
    
    devices.forEach(device => {
      const recentLogins = device.loginHistory.filter(l => new Date(l.timestamp) >= dayAgo);
      totalLogins += recentLogins.length;
      failedLogins += recentLogins.filter(l => !l.success).length;
    });
    
    return totalLogins > 0 ? failedLogins / totalLogins : 0;
  }

  private calculateAverageFrequency(): number {
    const patterns = Array.from(this.patterns.values());
    return patterns.reduce((sum, p) => sum + p.baselineFrequency, 0) / Math.max(1, patterns.length);
  }

  private countMultipleDeviceOperators(): number {
    const devices = JSON.parse(localStorage.getItem('tsaerp_trusted_devices') || '[]');
    const operatorDeviceCounts = new Map();
    
    devices.filter(d => d.isActive).forEach(device => {
      operatorDeviceCounts.set(
        device.operatorId, 
        (operatorDeviceCounts.get(device.operatorId) || 0) + 1
      );
    });
    
    return Array.from(operatorDeviceCounts.values()).filter(count => count > 1).length;
  }

  public getOperatorRiskScore(operatorId: string): number {
    const operatorAlerts = this.alerts.filter(a => 
      a.operatorId === operatorId && 
      !a.resolved &&
      a.timestamp >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
    );

    let riskScore = 0;
    operatorAlerts.forEach(alert => {
      switch (alert.severity) {
        case 'critical': riskScore += 10; break;
        case 'high': riskScore += 7; break;
        case 'medium': riskScore += 4; break;
        case 'low': riskScore += 2; break;
      }
    });

    return Math.min(100, riskScore);
  }

  // Force security check (for admin use)
  public forceScan(): void {
    this.performSecurityCheck();
  }
}

export const loginMonitoringService = new LoginMonitoringService();
export { LoginMonitoringService, type LoginAlert, type SecurityMetrics };