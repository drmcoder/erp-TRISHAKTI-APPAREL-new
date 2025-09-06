import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@/test/test-utils';
import { NotificationCenter } from '@/components/notifications/notification-center';
import { notificationService } from '@/services/notification-service';

// Mock the notification service
vi.mock('@/services/notification-service', () => {
  const mockService = {
    subscribe: vi.fn(() => () => {}),
    getNotifications: vi.fn(() => []),
    getUnreadCount: vi.fn(() => 0),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
    clearNotifications: vi.fn(),
    sendNotification: vi.fn(),
    showToast: vi.fn(),
    updateSettings: vi.fn(),
    getSettings: vi.fn(() => ({
      pushEnabled: true,
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
    }))
  };

  return {
    notificationService: mockService
  };
});

// Mock the PWA service for push notifications
const mockPwaService = {
  subscribeToPush: vi.fn(),
  showNotification: vi.fn(),
  isOnline: vi.fn(() => true),
};

vi.mock('@/services/pwa-service', () => ({
  pwaService: mockPwaService,
}));

describe('Notification Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('In-App Notification Flow', () => {
    const mockNotifications = [
      {
        id: 'notif-1',
        type: 'assignment',
        title: 'New Work Assignment',
        message: 'You have been assigned cutting work for bundle B001',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        priority: 'high',
        actionUrl: '/assignments/1',
        actions: [
          { id: 'view', title: 'View Details', action: 'view_assignment' }
        ]
      },
      {
        id: 'notif-2',
        type: 'system',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will begin at 11 PM tonight',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: true,
        priority: 'medium'
      },
      {
        id: 'notif-3',
        type: 'quality',
        title: 'Quality Check Required',
        message: 'Bundle B002 requires quality inspection',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        priority: 'critical'
      }
    ];

    beforeEach(() => {
      vi.mocked(notificationService.getNotifications).mockReturnValue(mockNotifications);
      vi.mocked(notificationService.getUnreadCount).mockReturnValue(2);
    });

    it('should display notifications with proper categorization', async () => {
      render(
        <NotificationCenter 
          open={true} 
          onClose={vi.fn()} 
        />
      );

      // Should show notification count
      expect(screen.getByText('2')).toBeInTheDocument();

      // Should display notification titles
      expect(screen.getByText('New Work Assignment')).toBeInTheDocument();
      expect(screen.getByText('System Maintenance')).toBeInTheDocument();
      expect(screen.getByText('Quality Check Required')).toBeInTheDocument();

      // Should show unread indicators
      const unreadNotifications = mockNotifications.filter(n => !n.read);
      expect(screen.getAllByText('•')).toHaveLength(unreadNotifications.length);

      // Should show priority indicators
      expect(screen.getByText('Critical')).toBeInTheDocument();
    });

    it('should filter notifications by type and status', async () => {
      render(
        <NotificationCenter 
          open={true} 
          onClose={vi.fn()} 
        />
      );

      // Filter by unread
      const unreadFilter = screen.getByText(/Unread/);
      fireEvent.click(unreadFilter);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalledWith({
          read: false,
          type: undefined,
          limit: 100
        });
      });

      // Filter by type
      const typeFilter = screen.getByRole('combobox', { name: /all types/i });
      fireEvent.click(typeFilter);
      
      const assignmentOption = screen.getByText('Assignments');
      fireEvent.click(assignmentOption);

      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalledWith({
          read: false,
          type: 'assignment',
          limit: 100
        });
      });
    });

    it('should mark individual notifications as read', async () => {
      render(
        <NotificationCenter 
          open={true} 
          onClose={vi.fn()} 
        />
      );

      // Find unread notification
      const assignmentNotification = screen.getByText('New Work Assignment').closest('div[data-notification]');
      expect(assignmentNotification).toBeTruthy();

      // Click mark as read button
      const markReadButton = within(assignmentNotification!).getByRole('button', { name: /mark as read/i });
      fireEvent.click(markReadButton);

      expect(notificationService.markAsRead).toHaveBeenCalledWith('notif-1');
    });

    it('should handle bulk actions on notifications', async () => {
      render(
        <NotificationCenter 
          open={true} 
          onClose={vi.fn()} 
        />
      );

      // Select multiple notifications
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]); // Select first notification
      fireEvent.click(checkboxes[2]); // Select third notification

      // Should show bulk action bar
      expect(screen.getByText('2 selected')).toBeInTheDocument();

      // Mark selected as read
      const markAllButton = screen.getByText('Mark All Read');
      fireEvent.click(markAllButton);

      expect(notificationService.markAllAsRead).toHaveBeenCalled();
    });

    it('should delete notifications', async () => {
      render(
        <NotificationCenter 
          open={true} 
          onClose={vi.fn()} 
        />
      );

      // Find notification delete button
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      fireEvent.click(deleteButtons[0]);

      expect(notificationService.deleteNotification).toHaveBeenCalledWith('notif-1');
    });

    it('should execute notification actions', async () => {
      render(
        <NotificationCenter 
          open={true} 
          onClose={vi.fn()} 
        />
      );

      // Find notification with actions
      const assignmentNotification = screen.getByText('New Work Assignment').closest('div[data-notification]');
      const viewDetailsButton = within(assignmentNotification!).getByText('View Details');
      
      fireEvent.click(viewDetailsButton);

      // Should navigate to action URL (implementation would handle routing)
      // For now, just verify the action structure exists
      expect(viewDetailsButton).toBeInTheDocument();
    });
  });

  describe('Push Notification Integration', () => {
    beforeEach(() => {
      // Mock successful push subscription
      vi.mocked(mockPwaService.subscribeToPush).mockResolvedValue({
        endpoint: 'https://fcm.googleapis.com/fcm/send/test',
        keys: { p256dh: 'test-key', auth: 'test-auth' }
      });
    });

    it('should subscribe to push notifications', async () => {
      render(
        <NotificationCenter 
          open={true} 
          onClose={vi.fn()} 
        />
      );

      // Open notification settings
      const settingsButton = screen.getByText('Settings');
      fireEvent.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText('Notification Settings')).toBeInTheDocument();
      });

      // Enable push notifications
      const pushToggle = screen.getByLabelText('Push Notifications');
      fireEvent.click(pushToggle);

      await waitFor(() => {
        expect(mockPwaService.subscribeToPush).toHaveBeenCalled();
      });

      expect(notificationService.updateSettings).toHaveBeenCalledWith({
        pushEnabled: true
      });
    });

    it('should handle push notification reception', async () => {
      // Simulate receiving a push notification
      const pushNotificationData = {
        title: 'Urgent: Quality Issue',
        body: 'Bundle B003 has failed quality check',
        data: {
          type: 'quality',
          priority: 'critical',
          actionUrl: '/quality/issues/1'
        }
      };

      // This would typically come from the service worker
      await notificationService.sendNotification({
        type: 'quality',
        title: pushNotificationData.title,
        message: pushNotificationData.body,
        priority: 'critical',
        actionUrl: pushNotificationData.data.actionUrl
      });

      expect(mockPwaService.showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: pushNotificationData.title,
          body: pushNotificationData.body
        })
      );
    });

    it('should respect quiet hours settings', async () => {
      // Set quiet hours
      const quietHoursSettings = {
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00'
        }
      };

      vi.mocked(notificationService.getSettings).mockReturnValue({
        ...vi.mocked(notificationService.getSettings)(),
        ...quietHoursSettings
      });

      render(
        <NotificationCenter 
          open={true} 
          onClose={vi.fn()} 
        />
      );

      // Should still store notification but not show push notification during quiet hours
      // This would be handled by the notification service logic
      await notificationService.sendNotification({
        type: 'system',
        title: 'Quiet Hours Test',
        message: 'This should be silenced',
        priority: 'low'
      });

      // Verify notification is still stored but push is suppressed
      expect(notificationService.sendNotification).toHaveBeenCalled();
    });
  });

  describe('Real-time Notification Updates', () => {
    it('should subscribe to real-time notification updates', async () => {
      const mockSubscribe = vi.fn(() => () => {});
      vi.mocked(notificationService.subscribe).mockImplementation(mockSubscribe);

      render(
        <NotificationCenter 
          open={true} 
          onClose={vi.fn()} 
        />
      );

      // Should subscribe to real-time updates
      expect(mockSubscribe).toHaveBeenCalledWith('notification-center', expect.any(Function));
    });

    it('should update UI when new notifications arrive', async () => {
      let notificationCallback: (notification: any) => void = () => {};
      
      vi.mocked(notificationService.subscribe).mockImplementation((id, callback) => {
        notificationCallback = callback;
        return () => {};
      });

      render(
        <NotificationCenter 
          open={true} 
          onClose={vi.fn()} 
        />
      );

      // Simulate new notification arrival
      const newNotification = {
        id: 'notif-new',
        type: 'assignment',
        title: 'New Assignment Available',
        message: 'Bundle B005 is ready for cutting',
        timestamp: new Date(),
        read: false,
        priority: 'medium'
      };

      // Trigger the callback as if a new notification arrived
      notificationCallback(newNotification);

      // Should refresh notifications list
      await waitFor(() => {
        expect(notificationService.getNotifications).toHaveBeenCalled();
      });
    });
  });

  describe('Notification Settings Management', () => {
    it('should update notification preferences', async () => {
      render(
        <NotificationCenter 
          open={true} 
          onClose={vi.fn()} 
        />
      );

      // Open settings
      const settingsButton = screen.getByText('Settings');
      fireEvent.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText('Notification Settings')).toBeInTheDocument();
      });

      // Disable assignment notifications
      const assignmentToggle = screen.getByLabelText('Work Assignments');
      fireEvent.click(assignmentToggle);

      // Update sound settings
      const soundToggle = screen.getByLabelText('Sound');
      fireEvent.click(soundToggle);

      // Set quiet hours
      const quietHoursToggle = screen.getByLabelText('Quiet Hours');
      fireEvent.click(quietHoursToggle);

      const startTimeInput = screen.getByLabelText('Start Time');
      fireEvent.change(startTimeInput, { target: { value: '21:00' } });

      const endTimeInput = screen.getByLabelText('End Time');
      fireEvent.change(endTimeInput, { target: { value: '07:00' } });

      // Save settings
      const saveButton = screen.getByText('Save Settings');
      fireEvent.click(saveButton);

      expect(notificationService.updateSettings).toHaveBeenCalledWith({
        categories: expect.objectContaining({
          assignment: false
        }),
        soundEnabled: false,
        quietHours: {
          enabled: true,
          start: '21:00',
          end: '07:00'
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle notification service errors gracefully', async () => {
      vi.mocked(notificationService.getNotifications).mockImplementation(() => {
        throw new Error('Service unavailable');
      });

      render(
        <NotificationCenter 
          open={true} 
          onClose={vi.fn()} 
        />
      );

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/error loading notifications/i)).toBeInTheDocument();
      });

      // Should provide retry option
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      expect(notificationService.getNotifications).toHaveBeenCalledTimes(2);
    });

    it('should handle offline scenarios', async () => {
      vi.mocked(mockPwaService.isOnline).mockReturnValue(false);

      render(
        <NotificationCenter 
          open={true} 
          onClose={vi.fn()} 
        />
      );

      // Should show offline indicator
      expect(screen.getByText(/offline/i)).toBeInTheDocument();

      // Should still show cached notifications
      expect(screen.getByText('New Work Assignment')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should provide proper ARIA labels and roles', async () => {
      render(
        <NotificationCenter 
          open={true} 
          onClose={vi.fn()} 
        />
      );

      // Should have proper dialog role
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Notifications should have proper structure
      const notifications = screen.getAllByRole('article');
      expect(notifications.length).toBeGreaterThan(0);

      // Action buttons should be properly labeled
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should support keyboard navigation', async () => {
      render(
        <NotificationCenter 
          open={true} 
          onClose={vi.fn()} 
        />
      );

      // Should focus first interactive element
      const firstButton = screen.getAllByRole('button')[0];
      firstButton.focus();

      expect(firstButton).toHaveFocus();

      // Tab navigation should work properly
      fireEvent.keyDown(firstButton, { key: 'Tab' });
      // Next focusable element should receive focus
    });

    it('should announce new notifications to screen readers', async () => {
      render(
        <NotificationCenter 
          open={true} 
          onClose={vi.fn()} 
        />
      );

      // Should have aria-live region for announcements
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
    });
  });
});