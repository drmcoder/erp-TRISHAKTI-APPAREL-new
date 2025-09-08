import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { pwaService } from '../pwa-service';

// Mock service worker registration
const mockRegistration = {
  installing: null,
  waiting: null,
  active: { postMessage: vi.fn() },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  update: vi.fn(),
  unregister: vi.fn(),
  scope: '/',
  pushManager: {
    subscribe: vi.fn().mockResolvedValue({
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
      keys: {
        p256dh: 'test-p256dh-key',
        auth: 'test-auth-key'
      }
    }),
    getSubscription: vi.fn().mockResolvedValue(null)
  }
};

// Mock beforeinstallprompt event
const mockInstallPromptEvent = {
  preventDefault: vi.fn(),
  prompt: vi.fn().mockResolvedValue(undefined),
  userChoice: Promise.resolve({ outcome: 'accepted' })
};

describe('PWAService', () => {
  let pwaService: PWAService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock navigator.serviceWorker
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: vi.fn().mockResolvedValue(mockRegistration),
        ready: Promise.resolve(mockRegistration),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
      },
      writable: true
    });

    // Mock window events
    Object.defineProperty(window, 'addEventListener', {
      value: vi.fn(),
      writable: true
    });

    Object.defineProperty(window, 'removeEventListener', {
      value: vi.fn(),
      writable: true
    });

    // Use the singleton instance (already imported above)
    // pwaService is the singleton instance from the import
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should register service worker on initialization', async () => {
      await pwaService.initialize();

      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
    });

    it('should set up install prompt listener', async () => {
      await pwaService.initialize();

      expect(window.addEventListener).toHaveBeenCalledWith(
        'beforeinstallprompt',
        expect.any(Function)
      );
    });

    it('should set up online/offline listeners', async () => {
      await pwaService.initialize();

      expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });
  });

  describe('service worker registration', () => {
    it('should register service worker successfully', async () => {
      const registration = await pwaService.registerServiceWorker();

      expect(registration).toBe(mockRegistration);
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
    });

    it('should handle service worker registration failure', async () => {
      const error = new Error('Registration failed');
      vi.mocked(navigator.serviceWorker.register).mockRejectedValueOnce(error);

      await expect(pwaService.registerServiceWorker()).rejects.toThrow('Registration failed');
    });

    it('should return null if service worker is not supported', async () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        writable: true
      });

      // Use the same singleton instance for this test
      const registration = await pwaService.registerServiceWorker();

      expect(registration).toBeNull();
    });
  });

  describe('install prompt management', () => {
    it('should capture install prompt event', () => {
      const capturePrompt = vi.spyOn(pwaService as any, 'handleInstallPrompt');
      
      // Simulate beforeinstallprompt event
      pwaService['handleInstallPrompt'](mockInstallPromptEvent);

      expect(mockInstallPromptEvent.preventDefault).toHaveBeenCalled();
      expect(pwaService['installPrompt']).toBe(mockInstallPromptEvent);
    });

    it('should show install prompt if available', async () => {
      pwaService['installPrompt'] = mockInstallPromptEvent;

      const result = await pwaService.showInstallPrompt();

      expect(mockInstallPromptEvent.prompt).toHaveBeenCalled();
      expect(result).toEqual({ outcome: 'accepted' });
      expect(pwaService['installPrompt']).toBeNull();
    });

    it('should return null if no install prompt available', async () => {
      pwaService['installPrompt'] = null;

      const result = await pwaService.showInstallPrompt();

      expect(result).toBeNull();
    });

    it('should check if app is installable', () => {
      pwaService['installPrompt'] = mockInstallPromptEvent;
      expect(pwaService.canInstall()).toBe(true);

      pwaService['installPrompt'] = null;
      expect(pwaService.canInstall()).toBe(false);
    });
  });

  describe('push notification management', () => {
    it('should subscribe to push notifications', async () => {
      await pwaService.initialize();

      const subscription = await pwaService.subscribeToPush();

      expect(mockRegistration.pushManager.subscribe).toHaveBeenCalledWith({
        userVisibleOnly: true,
        applicationServerKey: expect.any(Uint8Array)
      });

      expect(subscription).toEqual({
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
        keys: {
          p256dh: 'test-p256dh-key',
          auth: 'test-auth-key'
        }
      });
    });

    it('should get existing push subscription', async () => {
      const existingSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/existing-endpoint',
        keys: { p256dh: 'existing-key', auth: 'existing-auth' }
      };

      mockRegistration.pushManager.getSubscription = vi.fn().mockResolvedValue(existingSubscription);
      await pwaService.initialize();

      const subscription = await pwaService.getPushSubscription();

      expect(subscription).toBe(existingSubscription);
    });

    it('should show notification via service worker', async () => {
      await pwaService.initialize();

      const notificationData = {
        title: 'Test Notification',
        body: 'Test message',
        icon: '/icons/icon-192.png',
        badge: '/icons/badge.png',
        tag: 'test',
        data: { id: 'test-123' }
      };

      await pwaService.showNotification(notificationData);

      expect(mockRegistration.active?.postMessage).toHaveBeenCalledWith({
        type: 'SHOW_NOTIFICATION',
        payload: notificationData
      });
    });
  });

  describe('offline queue management', () => {
    it('should add action to offline queue', async () => {
      const action = {
        type: 'CREATE_WORK_ITEM',
        data: { bundleNumber: 'B001', operation: 'cutting' },
        timestamp: new Date().toISOString()
      };

      await pwaService.addToOfflineQueue(action);

      expect(pwaService['offlineQueue']).toHaveLength(1);
      expect(pwaService['offlineQueue'][0]).toMatchObject(action);
    });

    it('should process offline queue when online', async () => {
      const mockCallback = vi.fn().mockResolvedValue({ success: true });
      
      const action = {
        id: 'test-action-1',
        type: 'CREATE_WORK_ITEM',
        data: { bundleNumber: 'B001' },
        timestamp: new Date().toISOString(),
        retries: 0
      };

      pwaService['offlineQueue'] = [action];
      pwaService['syncCallbacks'].set('CREATE_WORK_ITEM', mockCallback);

      const results = await pwaService.processOfflineQueue();

      expect(mockCallback).toHaveBeenCalledWith(action.data);
      expect(results.processed).toBe(1);
      expect(results.synced).toBe(1);
      expect(pwaService['offlineQueue']).toHaveLength(0);
    });

    it('should retry failed actions with exponential backoff', async () => {
      const mockCallback = vi.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true });

      const action = {
        id: 'test-action-1',
        type: 'CREATE_WORK_ITEM',
        data: { bundleNumber: 'B001' },
        timestamp: new Date().toISOString(),
        retries: 0
      };

      pwaService['offlineQueue'] = [action];
      pwaService['syncCallbacks'].set('CREATE_WORK_ITEM', mockCallback);

      // First attempt should fail and increment retries
      const firstResult = await pwaService.processOfflineQueue();
      expect(firstResult.failed).toBe(0); // Should be retried, not marked as failed
      expect(pwaService['offlineQueue'][0].retries).toBe(1);

      // Second attempt should succeed
      const secondResult = await pwaService.processOfflineQueue();
      expect(secondResult.synced).toBe(1);
      expect(pwaService['offlineQueue']).toHaveLength(0);
    });

    it('should remove action after max retries', async () => {
      const mockCallback = vi.fn().mockRejectedValue(new Error('Persistent error'));

      const action = {
        id: 'test-action-1',
        type: 'CREATE_WORK_ITEM',
        data: { bundleNumber: 'B001' },
        timestamp: new Date().toISOString(),
        retries: 3 // Already at max retries
      };

      pwaService['offlineQueue'] = [action];
      pwaService['syncCallbacks'].set('CREATE_WORK_ITEM', mockCallback);

      const results = await pwaService.processOfflineQueue();

      expect(results.failed).toBe(1);
      expect(pwaService['offlineQueue']).toHaveLength(0);
    });
  });

  describe('connection status management', () => {
    it('should detect online status', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true
      });

      expect(pwaService.isOnline()).toBe(true);
    });

    it('should detect offline status', () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      });

      expect(pwaService.isOnline()).toBe(false);
    });

    it('should handle online event', async () => {
      const processQueue = vi.spyOn(pwaService, 'processOfflineQueue');
      
      await pwaService.initialize();
      
      // Simulate online event
      const onlineHandler = vi.mocked(window.addEventListener).mock.calls
        .find(call => call[0] === 'online')?.[1] as EventListener;
      
      onlineHandler(new Event('online'));

      expect(processQueue).toHaveBeenCalled();
    });
  });

  describe('app state management', () => {
    it('should check if running in standalone mode', () => {
      // Mock standalone mode
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockReturnValue({
          matches: true
        }),
        writable: true
      });

      expect(pwaService.isRunningStandalone()).toBe(true);
    });

    it('should check if running in browser', () => {
      Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockReturnValue({
          matches: false
        }),
        writable: true
      });

      expect(pwaService.isRunningStandalone()).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should clean up resources on destroy', () => {
      pwaService.destroy();

      expect(window.removeEventListener).toHaveBeenCalledWith(
        'beforeinstallprompt',
        expect.any(Function)
      );
      expect(window.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(window.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });
  });
});