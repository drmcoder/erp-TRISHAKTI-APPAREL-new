// Push Notification Service for Work Assignments
// Handles real-time push notifications for work assignments and sequential operations

import { NotificationService } from './entities/notification-service';
import { Notification } from '../types/entities';
import { toast } from 'sonner';

interface PushNotificationConfig {
  enableSound: boolean;
  enableVibration: boolean;
  language: 'en' | 'ne';
}

interface WorkAssignmentNotification {
  operatorId: string;
  workBundleId: string;
  workItemId?: string;
  assignmentType: 'new_assignment' | 'sequential_ready' | 'quality_issue' | 'break_reminder';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  fromOperatorId?: string; // For sequential operations
  machineType?: string;
  operation?: string;
  estimatedTime?: number;
}

class PushNotificationService {
  private notificationService: NotificationService;
  private config: PushNotificationConfig;
  private subscribers: Map<string, (notification: any) => void> = new Map();

  constructor() {
    this.notificationService = new NotificationService();
    this.config = {
      enableSound: true,
      enableVibration: true,
      language: 'en'
    };
    
    this.initializePushNotifications();
  }

  private async initializePushNotifications() {
    // Request notification permission
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }

    // Register service worker for background notifications
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Send work assignment notification
  async sendWorkAssignmentNotification(data: WorkAssignmentNotification): Promise<void> {
    const messages = this.getLocalizedMessages(data);
    
    // Create notification in database
    const notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'> = {
      recipientId: data.operatorId,
      recipientType: 'operator',
      type: 'work_assignment',
      title: messages.title,
      message: messages.message,
      priority: data.priority,
      channels: ['push', 'in_app'],
      actionRequired: true,
      read: false,
      metadata: {
        workBundleId: data.workBundleId,
        workItemId: data.workItemId,
        assignmentType: data.assignmentType,
        fromOperatorId: data.fromOperatorId,
        machineType: data.machineType,
        operation: data.operation,
        estimatedTime: data.estimatedTime
      },
      actionUrl: `/operator/work-dashboard/${data.workBundleId}`,
      actions: [
        {
          id: 'accept',
          title: messages.acceptButton,
          type: 'primary',
          url: `/operator/work-dashboard/${data.workBundleId}?action=accept`
        },
        {
          id: 'view_details',
          title: messages.viewButton,
          type: 'secondary',
          url: `/operator/work-dashboard/${data.workBundleId}`
        }
      ]
    };

    const result = await this.notificationService.create(notification);
    
    if (result.success) {
      // Send browser push notification
      await this.showBrowserNotification(messages.title, messages.message, data);
      
      // Show in-app toast
      this.showInAppNotification(messages.title, messages.message, data.priority);
      
      // Notify subscribers
      this.notifySubscribers(data.operatorId, {
        type: 'work_assignment',
        data: notification,
        priority: data.priority
      });
    }
  }

  // Send sequential operation notification
  async sendSequentialOperationNotification(data: {
    operatorIds: string[]; // List of operators with matching machine type
    workBundleId: string;
    workItemId: string;
    previousOperatorId: string;
    previousOperatorName: string;
    machineType: string;
    operation: string;
    completedOperation: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
  }): Promise<void> {
    const messages = this.getSequentialMessages(data);

    // Send notification to all qualified operators
    for (const operatorId of data.operatorIds) {
      const notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'> = {
        recipientId: operatorId,
        recipientType: 'operator',
        type: 'work_assignment',
        title: messages.title,
        message: messages.message,
        priority: data.priority,
        channels: ['push', 'in_app'],
        actionRequired: true,
        read: false,
        metadata: {
          workBundleId: data.workBundleId,
          workItemId: data.workItemId,
          assignmentType: 'sequential_ready',
          fromOperatorId: data.previousOperatorId,
          fromOperatorName: data.previousOperatorName,
          machineType: data.machineType,
          operation: data.operation,
          completedOperation: data.completedOperation,
          isSequential: true
        },
        actionUrl: `/operator/work-dashboard/${data.workBundleId}`,
        actions: [
          {
            id: 'take_work',
            title: messages.takeButton,
            type: 'primary',
            url: `/operator/work-dashboard/${data.workBundleId}?action=take`
          },
          {
            id: 'view_details',
            title: messages.viewButton,
            type: 'secondary',
            url: `/operator/work-dashboard/${data.workBundleId}`
          }
        ]
      };

      await this.notificationService.create(notification);
      
      // Send browser push notification
      await this.showBrowserNotification(messages.title, messages.message, {
        operatorId,
        workBundleId: data.workBundleId,
        assignmentType: 'sequential_ready' as const,
        priority: data.priority
      });
      
      // Show in-app notification
      this.showInAppNotification(messages.title, messages.message, data.priority);
    }
  }

  private getLocalizedMessages(data: WorkAssignmentNotification) {
    const isNepali = this.config.language === 'ne';
    
    switch (data.assignmentType) {
      case 'new_assignment':
        return {
          title: isNepali ? 'नयाँ काम तोकिएको छ' : 'New Work Assigned',
          message: isNepali 
            ? `${data.operation || 'काम'} को लागि नयाँ काम तोकिएको छ। मेसिन: ${data.machineType || 'N/A'}`
            : `New work assigned for ${data.operation || 'operation'}. Machine: ${data.machineType || 'N/A'}`,
          acceptButton: isNepali ? 'स्वीकार गर्नुहोस्' : 'Accept',
          viewButton: isNepali ? 'विवरण हेर्नुहोस्' : 'View Details'
        };
      
      case 'sequential_ready':
        return {
          title: isNepali ? 'अर्को काम तयार छ' : 'Next Operation Ready',
          message: isNepali 
            ? `अघिल्लो अपरेटरले काम सकाएको छ। तपाईंको पालो आयो।`
            : `Previous operator completed their work. Your turn is ready.`,
          acceptButton: isNepali ? 'काम लिनुहोस्' : 'Take Work',
          viewButton: isNepali ? 'विवरण हेर्नुहोस्' : 'View Details'
        };
      
      case 'quality_issue':
        return {
          title: isNepali ? 'गुणस्तर समस्या' : 'Quality Issue',
          message: isNepali 
            ? 'तपाईंको कामको गुणस्तरमा समस्या देखिएको छ।'
            : 'A quality issue has been identified with your work.',
          acceptButton: isNepali ? 'सुधार गर्नुहोस्' : 'Fix Issue',
          viewButton: isNepali ? 'विवरण हेर्नुहोस्' : 'View Details'
        };
      
      default:
        return {
          title: isNepali ? 'सूचना' : 'Notification',
          message: isNepali ? 'नयाँ सूचना आएको छ।' : 'You have a new notification.',
          acceptButton: isNepali ? 'हेर्नुहोस्' : 'View',
          viewButton: isNepali ? 'विवरण' : 'Details'
        };
    }
  }

  private getSequentialMessages(data: any) {
    const isNepali = this.config.language === 'ne';
    
    return {
      title: isNepali ? 'अर्को काम तयार छ' : 'Work Available - Next Operation',
      message: isNepali 
        ? `${data.previousOperatorName} ले ${data.completedOperation} सकाएको छ। अब ${data.operation} को लागि काम तयार छ।`
        : `${data.previousOperatorName} completed ${data.completedOperation}. Work is now ready for ${data.operation}.`,
      takeButton: isNepali ? 'काम लिनुहोस्' : 'Take Work',
      viewButton: isNepali ? 'विवरण हेर्नुहोस्' : 'View Details'
    };
  }

  private async showBrowserNotification(title: string, message: string, data: any): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: message,
        icon: '/icons/work-assignment.png',
        badge: '/icons/badge.png',
        tag: `work-${data.workBundleId}`,
        requireInteraction: data.priority === 'urgent',
        silent: !this.config.enableSound,
        data: {
          workBundleId: data.workBundleId,
          operatorId: data.operatorId,
          url: `/operator/work-dashboard/${data.workBundleId}`
        }
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = notification.data.url;
        notification.close();
      };

      // Auto close after 10 seconds unless urgent
      if (data.priority !== 'urgent') {
        setTimeout(() => notification.close(), 10000);
      }

      // Vibrate if enabled and supported
      if (this.config.enableVibration && 'vibrate' in navigator) {
        const pattern = data.priority === 'urgent' ? [200, 100, 200] : [100, 50, 100];
        navigator.vibrate(pattern);
      }
    }
  }

  private showInAppNotification(title: string, message: string, priority: string): void {
    const duration = priority === 'urgent' ? 10000 : 5000;
    
    if (priority === 'urgent') {
      toast.error(title, {
        description: message,
        duration,
        action: {
          label: 'View',
          onClick: () => {
            // Navigate to work dashboard
            window.location.href = '/operator/work-dashboard';
          }
        }
      });
    } else {
      toast.success(title, {
        description: message,
        duration
      });
    }
  }

  // Subscribe to notifications for a specific operator
  subscribe(operatorId: string, callback: (notification: any) => void): () => void {
    this.subscribers.set(operatorId, callback);
    
    return () => {
      this.subscribers.delete(operatorId);
    };
  }

  private notifySubscribers(operatorId: string, notification: any): void {
    const callback = this.subscribers.get(operatorId);
    if (callback) {
      callback(notification);
    }
  }

  // Update configuration
  updateConfig(config: Partial<PushNotificationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Get unread count for operator
  async getUnreadCount(operatorId: string): Promise<number> {
    const result = await this.notificationService.getUnreadCount(operatorId);
    return result.success ? result.data! : 0;
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId?: string): Promise<void> {
    await this.notificationService.markAsRead(notificationId, userId);
  }

  // Get notifications for operator
  async getNotificationsForOperator(operatorId: string, unreadOnly = false) {
    return this.notificationService.getNotificationsForUser(operatorId, { unreadOnly });
  }
}

export const pushNotificationService = new PushNotificationService();
export { PushNotificationService, type WorkAssignmentNotification };