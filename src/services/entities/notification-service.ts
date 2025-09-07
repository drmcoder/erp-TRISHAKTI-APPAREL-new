// src/services/entities/notification-service.ts
import { EnhancedBaseFirebaseService } from '../../infrastructure/firebase/base-service';
import { COLLECTIONS } from '../../config/firebase';
import { Notification } from '../../types/entities';
import { ServiceResponse, QueryOptions, ServiceConfig } from '../../types/service-types';

export class NotificationService extends EnhancedBaseFirebaseService<Notification> {
  constructor(config?: Partial<ServiceConfig>) {
    super(COLLECTIONS.NOTIFICATIONS, config);
  }

  // Custom validation for notifications
  protected validate(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.recipientId || typeof data.recipientId !== 'string') {
      errors.push('Recipient ID is required and must be a string');
    }

    if (!data.type || !['info', 'warning', 'error', 'success', 'work_assignment', 'quality_issue', 'payment', 'system'].includes(data.type)) {
      errors.push('Invalid notification type');
    }

    if (!data.title || typeof data.title !== 'string') {
      errors.push('Title is required and must be a string');
    }

    if (!data.message || typeof data.message !== 'string') {
      errors.push('Message is required and must be a string');
    }

    if (!data.priority || !['low', 'normal', 'high', 'urgent'].includes(data.priority)) {
      errors.push('Priority must be low, normal, high, or urgent');
    }

    if (!data.channels || !Array.isArray(data.channels) || data.channels.length === 0) {
      errors.push('Channels must be provided as a non-empty array');
    }

    return { valid: errors.length === 0, errors };
  }

  // Get notifications for a specific user
  async getNotificationsForUser(
    userId: string,
    options?: QueryOptions & { unreadOnly?: boolean }
  ): Promise<ServiceResponse<Notification[]>> {
    const whereConditions = [
      { field: 'recipientId', operator: '==', value: userId }
    ];

    if (options?.unreadOnly) {
      whereConditions.push({ field: 'read', operator: '==', value: false });
    }

    return this.query({
      ...options,
      where: whereConditions,
      orderByField: 'createdAt',
      orderDirection: 'desc',
    });
  }

  // Get notifications by type
  async getByType(type: Notification['type'], options?: QueryOptions): Promise<ServiceResponse<Notification[]>> {
    return this.getWhere('type', '==', type, options);
  }

  // Get notifications by priority
  async getByPriority(priority: Notification['priority'], options?: QueryOptions): Promise<ServiceResponse<Notification[]>> {
    return this.getWhere('priority', '==', priority, options);
  }

  // Get unread notifications count for user
  async getUnreadCount(userId: string): Promise<ServiceResponse<number>> {
    try {
      const result = await this.query({
        where: [
          { field: 'recipientId', operator: '==', value: userId },
          { field: 'read', operator: '==', value: false }
        ],
        limit: 1000, // Adjust based on your needs
      });

      return {
        success: true,
        data: result.data?.length || 0,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get unread count',
      };
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId?: string): Promise<ServiceResponse<Notification>> {
    return this.update(notificationId, {
      read: true,
      readAt: new Date(),
    }, userId);
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(notificationIds: string[], userId?: string): Promise<ServiceResponse<any>> {
    const operations = notificationIds.map(id => ({
      id,
      data: {
        read: true,
        readAt: new Date(),
      }
    }));

    return this.batchUpdate(operations, userId);
  }

  // Mark all notifications as read for a user
  async markAllAsReadForUser(userId: string): Promise<ServiceResponse<any>> {
    try {
      // First get all unread notifications for the user
      const unreadNotifications = await this.getNotificationsForUser(userId, { unreadOnly: true });
      
      if (!unreadNotifications.success || !unreadNotifications.data || unreadNotifications.data.length === 0) {
        return {
          success: true,
          data: { updated: 0 },
        };
      }

      const notificationIds = unreadNotifications.data.map(notification => notification.id);
      return this.markMultipleAsRead(notificationIds, userId);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark all as read',
      };
    }
  }

  // Create notification with multiple recipients
  async createBroadcastNotification(
    recipientIds: string[],
    notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'recipientId'>,
    userId?: string
  ): Promise<ServiceResponse<{ created: number; failed: number; notificationIds: string[] }>> {
    try {
      const notifications = recipientIds.map(recipientId => ({
        data: {
          ...notificationData,
          recipientId,
          read: false,
          actionRequired: notificationData.actionRequired || false,
        }
      }));

      const result = await this.batchCreate(notifications, userId);
      
      if (result.success) {
        const successfulIds = result.results.filter(r => r.success).map(r => r.id);
        return {
          success: true,
          data: {
            created: result.totalProcessed - result.totalFailed,
            failed: result.totalFailed,
            notificationIds: successfulIds,
          }
        };
      } else {
        return {
          success: false,
          error: 'Broadcast notification creation failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create broadcast notification',
      };
    }
  }

  // Create system notification for all users
  async createSystemNotification(
    notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt' | 'recipientId' | 'recipientType'>,
    userId?: string
  ): Promise<ServiceResponse<Notification>> {
    return this.create({
      ...notificationData,
      recipientId: 'all',
      recipientType: 'all',
      read: false,
      actionRequired: notificationData.actionRequired || false,
    }, userId);
  }

  // Get notifications requiring action
  async getActionRequiredNotifications(userId: string, options?: QueryOptions): Promise<ServiceResponse<Notification[]>> {
    return this.query({
      ...options,
      where: [
        { field: 'recipientId', operator: '==', value: userId },
        { field: 'actionRequired', operator: '==', value: true },
        { field: 'read', operator: '==', value: false }
      ],
      orderByField: 'createdAt',
      orderDirection: 'desc',
    });
  }

  // Get expired notifications for cleanup
  async getExpiredNotifications(options?: QueryOptions): Promise<ServiceResponse<Notification[]>> {
    const now = new Date();
    return this.query({
      ...options,
      where: [
        { field: 'expiresAt', operator: '<', value: now }
      ]
    });
  }

  // Delete expired notifications
  async cleanupExpiredNotifications(): Promise<ServiceResponse<{ deletedCount: number }>> {
    try {
      const expiredNotifications = await this.getExpiredNotifications({ limit: 1000 });
      
      if (!expiredNotifications.success || !expiredNotifications.data || expiredNotifications.data.length === 0) {
        return {
          success: true,
          data: { deletedCount: 0 },
        };
      }

      let deletedCount = 0;
      for (const notification of expiredNotifications.data) {
        const deleteResult = await this.delete(notification.id);
        if (deleteResult.success) {
          deletedCount++;
        }
      }

      return {
        success: true,
        data: { deletedCount },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cleanup expired notifications',
      };
    }
  }

  // Get notification statistics
  async getNotificationStatistics(
    userId?: string,
    timeframe?: { from: Date; to: Date }
  ): Promise<ServiceResponse<{
    total: number;
    read: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    actionRequired: number;
  }>> {
    try {
      const whereConditions: any[] = [];
      
      if (userId) {
        whereConditions.push({ field: 'recipientId', operator: '==', value: userId });
      }

      if (timeframe) {
        whereConditions.push({ field: 'createdAt', operator: '>=', value: timeframe.from });
        whereConditions.push({ field: 'createdAt', operator: '<=', value: timeframe.to });
      }

      const result = await this.query({
        where: whereConditions,
        limit: 10000,
      });

      if (!result.success || !result.data) {
        return {
          success: false,
          error: 'Failed to fetch notifications for statistics',
        };
      }

      const notifications = result.data;
      
      const statistics = {
        total: notifications.length,
        read: notifications.filter(n => n.read).length,
        unread: notifications.filter(n => !n.read).length,
        byType: notifications.reduce((acc, n) => {
          acc[n.type] = (acc[n.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byPriority: notifications.reduce((acc, n) => {
          acc[n.priority] = (acc[n.priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        actionRequired: notifications.filter(n => n.actionRequired && !n.read).length,
      };

      return {
        success: true,
        data: statistics,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate statistics',
      };
    }
  }

  // Subscribe to user notifications in real-time
  subscribeToUserNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    return this.subscribe(
      callback,
      {
        filter: [
          { field: 'recipientId', operator: '==', value: userId }
        ],
        orderBy: { field: 'createdAt', direction: 'desc' },
        limit: 50,
      }
    );
  }

  // Custom audit logging for notifications
  protected shouldAudit(): boolean {
    return false; // Don't audit notification changes to avoid noise
  }
}