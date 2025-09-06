import { BaseService, ServiceResponse } from './base-service';
import { User } from '@/app/store/auth-store';
import { Timestamp } from 'firebase/firestore';

export interface UserProfile extends User {
  bio?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  settings?: {
    theme: 'light' | 'dark' | 'system';
    language: 'en' | 'ne';
    notifications: {
      email: boolean;
      push: boolean;
      workAssignment: boolean;
      qualityIssues: boolean;
    };
  };
  activity?: {
    lastSeen: Date;
    totalLogins: number;
    workHours: number;
    completedTasks: number;
  };
  socialLinks?: {
    linkedin?: string;
    github?: string;
  };
}

export interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserListFilters {
  role?: string;
  department?: string;
  active?: boolean;
  searchTerm?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: Record<string, number>;
  recentActivity: UserActivity[];
}

class UserServiceClass extends BaseService {
  constructor() {
    super('users');
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<ServiceResponse<UserProfile>> {
    return this.getById<UserProfile>(userId);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string, 
    updates: Partial<UserProfile>
  ): Promise<ServiceResponse<UserProfile>> {
    // Track activity
    await this.logUserActivity(userId, 'profile_update', 'User updated their profile', {
      updatedFields: Object.keys(updates),
    });

    return this.update(userId, updates);
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: string): Promise<ServiceResponse<UserProfile[]>> {
    return this.getWhere<UserProfile>(
      { field: 'role', operator: '==', value: role },
      { orderByField: 'name', orderDirection: 'asc' }
    );
  }

  /**
   * Get all users with filtering
   */
  async getAllUsers(filters?: UserListFilters): Promise<ServiceResponse<UserProfile[]>> {
    try {
      // Start with getting all users
      const result = await this.getAll<UserProfile>({
        orderByField: 'name',
        orderDirection: 'asc',
      });

      if (!result.success || !result.data) {
        return result;
      }

      let users = result.data;

      // Apply filters
      if (filters) {
        if (filters.role) {
          users = users.filter(user => user.role === filters.role);
        }

        if (filters.department) {
          users = users.filter(user => user.department === filters.department);
        }

        if (filters.active !== undefined) {
          users = users.filter(user => user.active === filters.active);
        }

        if (filters.searchTerm) {
          const searchTerm = filters.searchTerm.toLowerCase();
          users = users.filter(user => 
            user.name.toLowerCase().includes(searchTerm) ||
            user.username.toLowerCase().includes(searchTerm) ||
            user.email?.toLowerCase().includes(searchTerm) ||
            user.department?.toLowerCase().includes(searchTerm)
          );
        }
      }

      return { success: true, data: users };
    } catch (error) {
      console.error('Error filtering users:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: Omit<UserProfile, 'id' | 'createdAt' | 'lastLogin'>): Promise<ServiceResponse<UserProfile>> {
    const newUser: Partial<UserProfile> = {
      ...userData,
      active: true,
      settings: {
        theme: 'system',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          workAssignment: true,
          qualityIssues: true,
        },
        ...userData.settings,
      },
      activity: {
        lastSeen: new Date(),
        totalLogins: 0,
        workHours: 0,
        completedTasks: 0,
        ...userData.activity,
      },
    };

    // Log admin activity for user creation
    // TODO: Get current user from auth context
    await this.logSystemActivity('user_creation', `New user created: ${userData.name}`, {
      newUserId: userData.username,
      role: userData.role,
    });

    return this.create<UserProfile>(newUser as UserProfile);
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivateUser(userId: string, reason?: string): Promise<ServiceResponse> {
    const result = await this.update(userId, { active: false });
    
    if (result.success) {
      await this.logUserActivity(userId, 'account_deactivated', 'User account deactivated', {
        reason,
      });
    }

    return { success: result.success, error: result.error };
  }

  /**
   * Activate user
   */
  async activateUser(userId: string): Promise<ServiceResponse> {
    const result = await this.update(userId, { active: true });
    
    if (result.success) {
      await this.logUserActivity(userId, 'account_activated', 'User account activated');
    }

    return { success: result.success, error: result.error };
  }

  /**
   * Update user role
   */
  async updateUserRole(
    userId: string, 
    newRole: string, 
    permissions: string[]
  ): Promise<ServiceResponse> {
    const result = await this.update(userId, { 
      role: newRole,
      permissions,
    });
    
    if (result.success) {
      await this.logUserActivity(userId, 'role_changed', `User role changed to ${newRole}`, {
        newRole,
        permissions,
      });
    }

    return { success: result.success, error: result.error };
  }

  /**
   * Get user activity history
   */
  async getUserActivity(userId: string, limit = 50): Promise<ServiceResponse<UserActivity[]>> {
    const activityService = new BaseService('user_activities');
    return activityService.getWhere<UserActivity>(
      { field: 'userId', operator: '==', value: userId },
      { 
        orderByField: 'timestamp', 
        orderDirection: 'desc',
        limitCount: limit,
      }
    );
  }

  /**
   * Log user activity
   */
  async logUserActivity(
    userId: string,
    action: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const activityService = new BaseService('user_activities');
      
      // Get user info for activity log
      const userResult = await this.getById<UserProfile>(userId);
      const userName = userResult.success && userResult.data 
        ? userResult.data.name 
        : 'Unknown User';

      await activityService.create({
        userId,
        userName,
        action,
        description,
        metadata,
        timestamp: Timestamp.now(),
        // TODO: Get IP and User Agent from request context
        ipAddress: 'unknown',
        userAgent: 'unknown',
      });
    } catch (error) {
      console.error('Error logging user activity:', error);
      // Don't throw error for activity logging failures
    }
  }

  /**
   * Log system activity (admin actions)
   */
  async logSystemActivity(
    action: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const activityService = new BaseService('system_activities');
      
      await activityService.create({
        action,
        description,
        metadata,
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error logging system activity:', error);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<ServiceResponse<UserStats>> {
    try {
      const usersResult = await this.getAll<UserProfile>();
      
      if (!usersResult.success || !usersResult.data) {
        return { success: false, error: 'Failed to fetch users' };
      }

      const users = usersResult.data;
      
      // Get recent activity
      const activityService = new BaseService('user_activities');
      const activityResult = await activityService.getAll<UserActivity>({
        orderByField: 'timestamp',
        orderDirection: 'desc',
        limitCount: 20,
      });

      const stats: UserStats = {
        totalUsers: users.length,
        activeUsers: users.filter(user => user.active).length,
        usersByRole: users.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        recentActivity: activityResult.success ? activityResult.data || [] : [],
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Update user last seen timestamp
   */
  async updateLastSeen(userId: string): Promise<void> {
    try {
      await this.update(userId, {
        activity: {
          lastSeen: new Date(),
        } as any,
      });
    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  }

  /**
   * Search users
   */
  async searchUsers(searchTerm: string, limit = 20): Promise<ServiceResponse<UserProfile[]>> {
    const result = await this.getAllUsers({
      searchTerm,
    });

    if (result.success && result.data) {
      const limitedResults = result.data.slice(0, limit);
      return { success: true, data: limitedResults };
    }

    return result;
  }

  /**
   * Subscribe to user changes
   */
  subscribeToUser(userId: string, callback: (user: UserProfile | null) => void): () => void {
    return this.subscribeToDocument<UserProfile>(userId, callback);
  }

  /**
   * Subscribe to all users changes
   */
  subscribeToAllUsers(callback: (users: UserProfile[]) => void): () => void {
    return this.subscribeToCollection<UserProfile>(callback, undefined, {
      orderByField: 'name',
      orderDirection: 'asc',
    });
  }

  /**
   * Bulk user operations
   */
  async bulkUpdateUsers(
    userIds: string[],
    updates: Partial<UserProfile>
  ): Promise<ServiceResponse> {
    try {
      const updatePromises = userIds.map(id => this.update(id, updates));
      const results = await Promise.allSettled(updatePromises);
      
      const failed = results.filter(result => result.status === 'rejected').length;
      const succeeded = results.length - failed;

      if (failed > 0) {
        return {
          success: false,
          error: `${failed} out of ${results.length} updates failed`,
        };
      }

      // Log bulk update activity
      await this.logSystemActivity('bulk_user_update', `Bulk updated ${succeeded} users`, {
        userIds,
        updates: Object.keys(updates),
      });

      return { success: true };
    } catch (error) {
      console.error('Error in bulk user update:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

export const UserService = new UserServiceClass();