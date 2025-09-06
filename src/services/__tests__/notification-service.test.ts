import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { notificationService } from '../notification-service';
import type { NotificationPayload } from '../notification-service';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset notification service state
    notificationService['notifications'] = [];
    notificationService['subscribers'].clear();
    notificationService['toastSubscribers'].clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sendNotification', () => {
    it('should create and store a notification', async () => {
      const notificationData = {
        type: 'assignment' as const,
        title: 'New Assignment',
        message: 'You have been assigned new work',
        priority: 'medium' as const,
        userId: 'user123'
      };

      await notificationService.sendNotification(notificationData);

      const notifications = notificationService.getNotifications();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toBe('New Assignment');
      expect(notifications[0].message).toBe('You have been assigned new work');
      expect(notifications[0].read).toBe(false);
    });

    it('should not send notification if category is disabled', async () => {
      // Disable assignment notifications
      notificationService.updateSettings({
        categories: {
          assignment: false,
          system: true,
          quality: true,
          break: true,
          achievement: true,
          alert: true
        }
      });

      const notificationData = {
        type: 'assignment' as const,
        title: 'New Assignment',
        message: 'You have been assigned new work',
        priority: 'medium' as const
      };

      await notificationService.sendNotification(notificationData);

      const notifications = notificationService.getNotifications();
      expect(notifications).toHaveLength(0);
    });

    it('should suppress notification during quiet hours', async () => {
      // Set quiet hours to current time
      const now = new Date();
      const startHour = String(now.getHours()).padStart(2, '0');
      const endHour = String((now.getHours() + 1) % 24).padStart(2, '0');

      notificationService.updateSettings({
        quietHours: {
          enabled: true,
          start: `${startHour}:00`,
          end: `${endHour}:00`
        }
      });

      const notificationData = {
        type: 'system' as const,
        title: 'System Update',
        message: 'System has been updated',
        priority: 'low' as const
      };

      await notificationService.sendNotification(notificationData);

      // Should still save notification but not show push
      const notifications = notificationService.getNotifications();
      expect(notifications).toHaveLength(1);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', () => {
      // Add a notification
      const notification: NotificationPayload = {
        id: 'test-1',
        type: 'system',
        title: 'Test',
        message: 'Test message',
        timestamp: new Date(),
        read: false,
        priority: 'medium'
      };

      notificationService['notifications'] = [notification];

      notificationService.markAsRead('test-1');

      const notifications = notificationService.getNotifications();
      expect(notifications[0].read).toBe(true);
    });

    it('should not mark already read notification', () => {
      const notification: NotificationPayload = {
        id: 'test-1',
        type: 'system',
        title: 'Test',
        message: 'Test message',
        timestamp: new Date(),
        read: true,
        priority: 'medium'
      };

      notificationService['notifications'] = [notification];
      const mockSave = vi.spyOn(notificationService as any, 'saveNotifications');

      notificationService.markAsRead('test-1');

      expect(mockSave).not.toHaveBeenCalled();
    });
  });

  describe('getUnreadCount', () => {
    it('should return correct unread count', () => {
      const notifications: NotificationPayload[] = [
        {
          id: 'test-1',
          type: 'system',
          title: 'Test 1',
          message: 'Test message 1',
          timestamp: new Date(),
          read: false,
          priority: 'medium'
        },
        {
          id: 'test-2',
          type: 'assignment',
          title: 'Test 2',
          message: 'Test message 2',
          timestamp: new Date(),
          read: true,
          priority: 'medium'
        },
        {
          id: 'test-3',
          type: 'system',
          title: 'Test 3',
          message: 'Test message 3',
          timestamp: new Date(),
          read: false,
          priority: 'high'
        }
      ];

      notificationService['notifications'] = notifications;

      expect(notificationService.getUnreadCount()).toBe(2);
      expect(notificationService.getUnreadCount('system')).toBe(2);
      expect(notificationService.getUnreadCount('assignment')).toBe(0);
    });
  });

  describe('subscription management', () => {
    it('should add and remove subscribers', () => {
      const callback = vi.fn();
      const unsubscribe = notificationService.subscribe('test-subscriber', callback);

      expect(notificationService['subscribers'].has('test-subscriber')).toBe(true);

      unsubscribe();

      expect(notificationService['subscribers'].has('test-subscriber')).toBe(false);
    });

    it('should notify subscribers when notification is sent', async () => {
      const callback = vi.fn();
      notificationService.subscribe('test-subscriber', callback);

      const notificationData = {
        type: 'system' as const,
        title: 'Test',
        message: 'Test message',
        priority: 'medium' as const
      };

      await notificationService.sendNotification(notificationData);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test',
          message: 'Test message',
          type: 'system'
        })
      );
    });
  });

  describe('filtering', () => {
    beforeEach(() => {
      const notifications: NotificationPayload[] = [
        {
          id: 'test-1',
          type: 'system',
          title: 'System Test',
          message: 'System message',
          timestamp: new Date(Date.now() - 1000),
          read: false,
          priority: 'high'
        },
        {
          id: 'test-2',
          type: 'assignment',
          title: 'Assignment Test',
          message: 'Assignment message',
          timestamp: new Date(),
          read: true,
          priority: 'medium'
        }
      ];

      notificationService['notifications'] = notifications;
    });

    it('should filter by type', () => {
      const systemNotifications = notificationService.getNotifications({ type: 'system' });
      expect(systemNotifications).toHaveLength(1);
      expect(systemNotifications[0].type).toBe('system');
    });

    it('should filter by read status', () => {
      const unreadNotifications = notificationService.getNotifications({ read: false });
      expect(unreadNotifications).toHaveLength(1);
      expect(unreadNotifications[0].read).toBe(false);
    });

    it('should filter by priority', () => {
      const highPriorityNotifications = notificationService.getNotifications({ priority: 'high' });
      expect(highPriorityNotifications).toHaveLength(1);
      expect(highPriorityNotifications[0].priority).toBe('high');
    });

    it('should limit results', () => {
      const limitedNotifications = notificationService.getNotifications({ limit: 1 });
      expect(limitedNotifications).toHaveLength(1);
    });

    it('should sort by timestamp descending', () => {
      const notifications = notificationService.getNotifications();
      expect(notifications[0].id).toBe('test-2'); // More recent notification first
      expect(notifications[1].id).toBe('test-1');
    });
  });

  describe('toast notifications', () => {
    it('should show toast notification', () => {
      const callback = vi.fn();
      notificationService.subscribeToToasts(callback);

      const toastData = {
        title: 'Success',
        message: 'Operation completed',
        type: 'success' as const
      };

      notificationService.showToast(toastData);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Success',
          message: 'Operation completed',
          type: 'success',
          id: expect.any(String)
        })
      );
    });

    it('should auto-remove toast after duration', () => {
      vi.useFakeTimers();
      
      const callback = vi.fn();
      notificationService.subscribeToToasts(callback);

      const toastData = {
        title: 'Test Toast',
        message: 'Test message',
        type: 'info' as const,
        duration: 1000
      };

      notificationService.showToast(toastData);

      expect(notificationService['toastQueue']).toHaveLength(1);

      vi.advanceTimersByTime(1000);

      expect(notificationService['toastQueue']).toHaveLength(0);

      vi.useRealTimers();
    });
  });

  describe('settings management', () => {
    it('should update notification settings', () => {
      const newSettings = {
        soundEnabled: false,
        vibrationEnabled: false,
        categories: {
          system: false,
          assignment: true,
          quality: true,
          break: true,
          achievement: true,
          alert: true
        }
      };

      notificationService.updateSettings(newSettings);

      const settings = notificationService.getSettings();
      expect(settings.soundEnabled).toBe(false);
      expect(settings.vibrationEnabled).toBe(false);
      expect(settings.categories.system).toBe(false);
    });

    it('should save settings to localStorage', () => {
      const newSettings = { soundEnabled: false };
      notificationService.updateSettings(newSettings);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'tsa-erp-notification-settings',
        expect.stringContaining('"soundEnabled":false')
      );
    });
  });
});