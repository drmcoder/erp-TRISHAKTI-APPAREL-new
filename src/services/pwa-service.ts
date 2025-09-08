// PWA Service
// Comprehensive Progressive Web App functionality with offline support and notifications

import { UI_CONFIG } from '@/config/ui-config';

export interface PWAInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

export interface OfflineQueueItem {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retries: number;
}

class PWAService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private installPrompt: PWAInstallPromptEvent | null = null;
  private isOnline = navigator.onLine;
  private offlineQueue: OfflineQueueItem[] = [];
  private syncInProgress = false;

  constructor() {
    this.initializeEventListeners();
    this.loadOfflineQueue();
  }

  // Initialize service worker and event listeners
  async initialize(): Promise<void> {
    try {
      // Register service worker - Skip in development to avoid cache issues
      if ('serviceWorker' in navigator) {
        const isDev = window.location.hostname === 'localhost' || window.location.port === '3000';
        
        if (isDev) {
          console.log('Development mode: Skipping Service Worker registration to avoid cache issues');
          // Unregister any existing service workers in development
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            console.log('Unregistering existing service worker:', registration.scope);
            await registration.unregister();
          }
          
          // Clear all caches
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            for (const cacheName of cacheNames) {
              console.log('Clearing cache:', cacheName);
              await caches.delete(cacheName);
            }
          }
          return;
        }
        
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('Service Worker registered:', this.swRegistration);

        // Listen for updates
        this.swRegistration.addEventListener('updatefound', () => {
          const newWorker = this.swRegistration?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                this.notifyAppUpdate();
              }
            });
          }
        });
      }

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      console.log('PWA Service initialized successfully');
    } catch (error) {
      console.error('PWA Service initialization failed:', error);
      throw error;
    }
  }

  // Initialize event listeners
  private initializeEventListeners(): void {
    // Install prompt handling
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.installPrompt = e as PWAInstallPromptEvent;
      console.log('Install prompt available');
    });

    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('App is online');
      this.syncOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('App is offline');
      this.showOfflineNotification();
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      console.log('App installed successfully');
      this.installPrompt = null;
    });

    // Visibility change for background sync
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline && this.offlineQueue.length > 0) {
        this.syncOfflineQueue();
      }
    });
  }

  // Check if app can be installed
  canInstall(): boolean {
    return this.installPrompt !== null;
  }

  // Show install prompt
  async showInstallPrompt(): Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  } | null> {
    if (!this.installPrompt) {
      console.warn('Install prompt not available');
      return null;
    }

    try {
      await this.installPrompt.prompt();
      const choiceResult = await this.installPrompt.userChoice;
      
      console.log('Install prompt result:', choiceResult);
      
      if (choiceResult.outcome === 'accepted') {
        this.installPrompt = null;
      }
      
      return choiceResult;
    } catch (error) {
      console.error('Install prompt failed:', error);
      return null;
    }
  }

  // Get installation status
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true ||
           document.referrer.includes('android-app://');
  }

  // Show notification
  async showNotification(options: NotificationOptions): Promise<void> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }
    }

    const notificationOptions: NotificationOptions = {
      icon: UI_CONFIG.pwa.icons.find(icon => icon.sizes === '192x192')?.src || '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options
    };

    await this.swRegistration.showNotification(options.title, notificationOptions);
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }

    const vapidKey = UI_CONFIG.notifications.push.vapidKey;
    if (!vapidKey) {
      console.warn('VAPID key not configured');
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
      });

      console.log('Push subscription created:', subscription);
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<void> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }

    const subscription = await this.swRegistration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('Unsubscribed from push notifications');
    }
  }

  // Add request to offline queue
  addToOfflineQueue(
    url: string, 
    method: string = 'GET', 
    body?: string,
    headers: Record<string, string> = {}
  ): void {
    const queueItem: OfflineQueueItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      url,
      method,
      headers,
      body,
      timestamp: Date.now(),
      retries: 0
    };

    this.offlineQueue.push(queueItem);
    this.saveOfflineQueue();

    console.log('Added to offline queue:', queueItem);

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncOfflineQueue();
    }
  }

  // Sync offline queue
  private async syncOfflineQueue(): Promise<void> {
    if (this.syncInProgress || this.offlineQueue.length === 0 || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    console.log('Syncing offline queue:', this.offlineQueue.length, 'items');

    const maxRetries = 3;
    const itemsToRemove: string[] = [];

    for (const item of this.offlineQueue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            'Content-Type': 'application/json',
            ...item.headers
          },
          body: item.body
        });

        if (response.ok) {
          itemsToRemove.push(item.id);
          console.log('Synced offline item:', item.id);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('Failed to sync offline item:', item.id, error);
        
        item.retries++;
        if (item.retries >= maxRetries) {
          itemsToRemove.push(item.id);
          console.warn('Max retries reached, removing item:', item.id);
        }
      }
    }

    // Remove processed items
    this.offlineQueue = this.offlineQueue.filter(item => !itemsToRemove.includes(item.id));
    this.saveOfflineQueue();

    this.syncInProgress = false;

    if (itemsToRemove.length > 0) {
      this.showNotification({
        title: 'Data Synchronized',
        body: `${itemsToRemove.length} offline actions have been synchronized.`,
        tag: 'sync-complete'
      });
    }
  }

  // Background sync
  async requestBackgroundSync(tag: string): Promise<void> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }

    if ('sync' in this.swRegistration) {
      try {
        await (this.swRegistration as any).sync.register(tag);
        console.log('Background sync registered:', tag);
      } catch (error) {
        console.error('Background sync registration failed:', error);
        throw error;
      }
    } else {
      console.warn('Background sync not supported');
    }
  }

  // Get offline queue status
  getOfflineQueueStatus(): {
    pending: number;
    failed: number;
    lastSync: Date | null;
  } {
    const failed = this.offlineQueue.filter(item => item.retries >= 3).length;
    const lastSyncTime = localStorage.getItem('pwa-last-sync');
    
    return {
      pending: this.offlineQueue.length - failed,
      failed,
      lastSync: lastSyncTime ? new Date(parseInt(lastSyncTime)) : null
    };
  }

  // Check connection status
  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Get app info
  getAppInfo(): {
    isInstalled: boolean;
    canInstall: boolean;
    version: string;
    isOnline: boolean;
    swStatus: string;
  } {
    return {
      isInstalled: this.isInstalled(),
      canInstall: this.canInstall(),
      version: '1.0.0', // Would come from package.json
      isOnline: this.isOnline,
      swStatus: this.swRegistration?.active ? 'active' : 'inactive'
    };
  }

  // Private helper methods
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }

      console.log('Subscription sent to server successfully');
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
      // Don't throw error, just log it
    }
  }

  private saveOfflineQueue(): void {
    try {
      localStorage.setItem('pwa-offline-queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  private loadOfflineQueue(): void {
    try {
      const saved = localStorage.getItem('pwa-offline-queue');
      if (saved) {
        this.offlineQueue = JSON.parse(saved);
        console.log('Loaded offline queue:', this.offlineQueue.length, 'items');
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }

  private notifyAppUpdate(): void {
    this.showNotification({
      title: 'App Update Available',
      body: 'A new version of TSA ERP is available. Restart the app to update.',
      tag: 'app-update',
      actions: [
        { action: 'update', title: 'Update Now' },
        { action: 'later', title: 'Later' }
      ],
      requireInteraction: true
    });
  }

  private showOfflineNotification(): void {
    this.showNotification({
      title: 'You\'re Offline',
      body: 'TSA ERP is now working in offline mode. Your data will sync when you\'re back online.',
      tag: 'offline-mode'
    });
  }

  // Update service worker
  async updateServiceWorker(): Promise<void> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }

    try {
      await this.swRegistration.update();
      console.log('Service Worker updated');
      
      // Skip waiting to activate new version
      if (this.swRegistration.waiting) {
        this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    } catch (error) {
      console.error('Service Worker update failed:', error);
      throw error;
    }
  }

  // Clean up
  destroy(): void {
    // Cancel any ongoing syncs
    this.syncInProgress = false;
    
    // Save offline queue
    this.saveOfflineQueue();
    
    console.log('PWA Service destroyed');
  }
}

// Create singleton instance
export const pwaService = new PWAService();

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  pwaService.initialize().catch(console.error);
}