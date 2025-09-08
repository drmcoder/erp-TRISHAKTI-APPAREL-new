// Notification Service
// Comprehensive notification system with push notifications, in-app notifications, and real-time alerts

import { UI_CONFIG } from '@/config/ui-config';
import { pwaService } from './pwa-service';
import { ENV_CONFIG } from '@/config/environment';
import { db } from '../config/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc, limit, Timestamp } from 'firebase/firestore';

export interface NotificationPayload {
  id: string;
  type: 'system' | 'assignment' | 'quality' | 'break' | 'achievement' | 'alert';
  title: string;
  message: string;
  data?: any;
  userId?: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  actionUrl?: string;
  actions?: Array<{
    id: string;
    title: string;
    action: string;
  }>;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  categories: {
    [key: string]: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

class NotificationService {
  private notifications: NotificationPayload[] = [];
  private toastQueue: ToastNotification[] = [];
  private settings: NotificationSettings;
  private subscribers: Map<string, (notification: NotificationPayload) => void> = new Map();
  private toastSubscribers: Set<(toast: ToastNotification) => void> = new Set();

  constructor() {
    this.settings = this.loadSettings();
    this.initializeFirebaseListener();
    this.registerServiceWorkerListeners();
  }

  // Initialize notification service
  async initialize(): Promise<void> {
    try {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        this.settings.pushEnabled = permission === 'granted';
        this.saveSettings();
      }

      // Load existing notifications
      await this.loadNotifications();

      // Subscribe to push notifications if supported
      if (this.settings.pushEnabled) {
        await this.subscribeToPush();
      }

      console.log('Notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      throw error;
    }
  }

  // Send notification
  async sendNotification(payload: Omit<NotificationPayload, 'id' | 'timestamp' | 'read'>): Promise<void> {
    const notification: NotificationPayload = {
      ...payload,
      id: this.generateNotificationId(),
      timestamp: new Date(),
      read: false
    };

    // Check if notifications are enabled for this category
    if (!this.isNotificationEnabled(notification)) {
      return;
    }

    // Check quiet hours
    if (this.isInQuietHours()) {
      console.log('Notification suppressed due to quiet hours');
      // Still save to Firebase but don't show push/sound
      await this.saveNotificationToFirebase(notification);
      return;
    }

    // Save notification to Firebase for realtime sync
    await this.saveNotificationToFirebase(notification);

    // Add to local in-app notifications
    this.addNotification(notification);

    // Send push notification
    if (this.settings.pushEnabled && 'serviceWorker' in navigator) {
      await this.sendPushNotification(notification);
    }

    // Show browser notification as fallback
    if (!('serviceWorker' in navigator) && 'Notification' in window && Notification.permission === 'granted') {
      await this.showBrowserNotification(notification);
    }

    // Play sound if enabled
    if (this.settings.soundEnabled) {
      this.playNotificationSound(notification.type);
    }

    // Vibrate if enabled and supported
    if (this.settings.vibrationEnabled && 'vibrate' in navigator) {
      this.vibrateDevice(notification.priority);
    }

    // Notify subscribers
    this.notifySubscribers(notification);
  }

  // Show toast notification
  showToast(toast: Omit<ToastNotification, 'id'>): void {
    const toastNotification: ToastNotification = {
      ...toast,
      id: this.generateNotificationId(),
      duration: toast.duration || UI_CONFIG.notifications.toast.duration
    };

    this.toastQueue.push(toastNotification);
    this.notifyToastSubscribers(toastNotification);

    // Auto-remove toast after duration
    setTimeout(() => {
      this.removeToast(toastNotification.id);
    }, toastNotification.duration);
  }

  // Get all notifications
  getNotifications(filter?: {
    type?: string;
    read?: boolean;
    priority?: string;
    limit?: number;
  }): NotificationPayload[] {
    let filtered = [...this.notifications];

    if (filter) {
      if (filter.type) {
        filtered = filtered.filter(n => n.type === filter.type);
      }
      if (filter.read !== undefined) {
        filtered = filtered.filter(n => n.read === filter.read);
      }
      if (filter.priority) {
        filtered = filtered.filter(n => n.priority === filter.priority);
      }
      if (filter.limit) {
        filtered = filtered.slice(0, filter.limit);
      }
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  // Mark all notifications as read
  markAllAsRead(type?: string): void {
    let updated = false;
    
    this.notifications.forEach(notification => {
      if (!notification.read && (!type || notification.type === type)) {
        notification.read = true;
        updated = true;
      }
    });

    if (updated) {
      this.saveNotifications();
    }
  }

  // Delete notification
  deleteNotification(notificationId: string): void {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.saveNotifications();
    }
  }

  // Clear all notifications
  clearNotifications(type?: string): void {
    if (type) {
      this.notifications = this.notifications.filter(n => n.type !== type);
    } else {
      this.notifications = [];
    }
    this.saveNotifications();
  }

  // Get unread count
  getUnreadCount(type?: string): number {
    return this.notifications.filter(n => 
      !n.read && (!type || n.type === type)
    ).length;
  }

  // Subscribe to notifications
  subscribe(id: string, callback: (notification: NotificationPayload) => void): () => void {
    this.subscribers.set(id, callback);
    
    return () => {
      this.subscribers.delete(id);
    };
  }

  // Subscribe to toast notifications
  subscribeToToasts(callback: (toast: ToastNotification) => void): () => void {
    this.toastSubscribers.add(callback);
    
    return () => {
      this.toastSubscribers.delete(callback);
    };
  }

  // Update notification settings
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();

    // Re-subscribe to push notifications if enabled
    if (newSettings.pushEnabled && !this.settings.pushEnabled) {
      this.subscribeToPush();
    }
  }

  // Get current settings
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Test notification
  async testNotification(): Promise<void> {
    await this.sendNotification({
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working correctly.',
      priority: 'medium'
    });
  }

  // Private methods
  private generateNotificationId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addNotification(notification: NotificationPayload): void {
    this.notifications.unshift(notification);
    
    // Keep only recent notifications (max 100)
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100);
    }
    
    this.saveNotifications();
  }

  private isNotificationEnabled(notification: NotificationPayload): boolean {
    if (!this.settings.inAppEnabled) return false;
    
    const categoryEnabled = this.settings.categories[notification.type];
    return categoryEnabled !== false; // Default to true if not explicitly disabled
  }

  private isInQuietHours(): boolean {
    if (!this.settings.quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const startParts = this.settings.quietHours.start.split(':');
    const endParts = this.settings.quietHours.end.split(':');
    
    const startTime = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
    const endTime = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Overnight quiet hours
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  private async sendPushNotification(notification: NotificationPayload): Promise<void> {
    try {
      await pwaService.showNotification({
        title: notification.title,
        body: notification.message,
        icon: this.getNotificationIcon(notification.type),
        badge: '/icons/badge-72x72.png',
        tag: notification.type,
        data: notification.data,
        actions: notification.actions?.map(action => ({
          action: action.id,
          title: action.title
        }))
      });
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  private async showBrowserNotification(notification: NotificationPayload): Promise<void> {
    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: this.getNotificationIcon(notification.type),
        badge: '/icons/badge-72x72.png',
        tag: notification.type,
        data: notification.data,
        requireInteraction: notification.priority === 'critical'
      });

      browserNotification.onclick = () => {
        if (notification.actionUrl) {
          window.open(notification.actionUrl, '_blank');
        }
        browserNotification.close();
      };

      // Auto-close after 5 seconds for non-critical notifications
      if (notification.priority !== 'critical') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    } catch (error) {
      console.error('Failed to show browser notification:', error);
    }
  }

  private getNotificationIcon(type: string): string {
    const typeConfig = UI_CONFIG.notifications.types[type as keyof typeof UI_CONFIG.notifications.types];
    return typeConfig ? `/icons/${typeConfig.icon}.png` : '/icons/notification-192x192.png';
  }

  private playNotificationSound(type: string): void {
    try {
      const typeConfig = UI_CONFIG.notifications.types[type as keyof typeof UI_CONFIG.notifications.types];
      const soundFile = typeConfig?.sound || 'notification.mp3';
      
      const audio = new Audio(`/sounds/${soundFile}`);
      audio.volume = 0.5;
      audio.play().catch(console.warn);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  private vibrateDevice(priority: string): void {
    const patterns = {
      low: [100],
      medium: [200, 100, 200],
      high: [300, 100, 300, 100, 300],
      critical: [500, 200, 500, 200, 500]
    };

    const pattern = patterns[priority as keyof typeof patterns] || patterns.medium;
    navigator.vibrate(pattern);
  }

  private notifySubscribers(notification: NotificationPayload): void {
    this.subscribers.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Notification subscriber error:', error);
      }
    });
  }

  private notifyToastSubscribers(toast: ToastNotification): void {
    this.toastSubscribers.forEach(callback => {
      try {
        callback(toast);
      } catch (error) {
        console.error('Toast subscriber error:', error);
      }
    });
  }

  private removeToast(toastId: string): void {
    const index = this.toastQueue.findIndex(t => t.id === toastId);
    if (index > -1) {
      this.toastQueue.splice(index, 1);
    }
  }

  private async subscribeToPush(): Promise<void> {
    try {
      await pwaService.subscribeToPush();
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }

  private initializeFirebaseListener(): void {
    // Initialize Firebase listener for realtime notifications
    this.subscribeToFirebaseNotifications();
  }

  // Firebase Methods
  private async saveNotificationToFirebase(notification: NotificationPayload): Promise<void> {
    try {
      // For development, skip Firebase save and use local storage only
      console.log('Notification saved locally (Firebase disabled in development)');
      
      // TODO: Enable Firebase save in production with proper authentication
      // const notificationData = {
      //   ...notification,
      //   timestamp: Timestamp.fromDate(notification.timestamp),
      //   createdAt: Timestamp.now()
      // };
      // await addDoc(collection(db, 'notifications'), notificationData);
      
    } catch (error) {
      console.error('Failed to save notification to Firebase:', error);
    }
  }

  private subscribeToFirebaseNotifications(): void {
    try {
      // For development, we'll skip Firebase subscription and use local notifications only
      // In production, this would require proper authentication setup
      console.log('Firebase notification listener - using local mode for development');
      
      // TODO: Implement proper authentication before enabling Firebase subscriptions
      // For now, we'll rely on local notifications and service calls
      
    } catch (error) {
      console.error('Failed to initialize Firebase notification listener:', error);
    }
  }


  private registerServiceWorkerListeners(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
          const notificationData = event.data.notification;
          this.handleNotificationClick(notificationData);
        }
      });
    }
  }

  private handleNotificationClick(notificationData: any): void {
    if (notificationData.actionUrl) {
      window.open(notificationData.actionUrl, '_blank');
    }

    // Mark as read if it's in our list
    const notification = this.notifications.find(n => n.id === notificationData.id);
    if (notification) {
      this.markAsRead(notification.id);
    }
  }

  // Storage methods
  private saveNotifications(): void {
    try {
      localStorage.setItem('tsa-erp-notifications', JSON.stringify(
        this.notifications.map(n => ({
          ...n,
          timestamp: n.timestamp.toISOString()
        }))
      ));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  private async loadNotifications(): Promise<void> {
    try {
      const saved = localStorage.getItem('tsa-erp-notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.notifications = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.notifications = [];
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('tsa-erp-notification-settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  private loadSettings(): NotificationSettings {
    try {
      const saved = localStorage.getItem('tsa-erp-notification-settings');
      if (saved) {
        return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
    
    return this.getDefaultSettings();
  }

  private getDefaultSettings(): NotificationSettings {
    return {
      pushEnabled: false,
      emailEnabled: true,
      inAppEnabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
      categories: {
        system: true,
        assignment: true,
        quality: true,
        break: true,
        achievement: true,
        alert: true
      },
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };
  }

  // Cleanup
  destroy(): void {
    this.subscribers.clear();
    this.toastSubscribers.clear();
    this.saveNotifications();
    this.saveSettings();
    
    console.log('Notification service destroyed');
  }
}

// Create singleton instance
export const notificationService = new NotificationService();

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  notificationService.initialize().catch(console.error);
}

export default notificationService;