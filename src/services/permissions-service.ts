import { User } from '@/app/store/auth-store';

// Define permission constants
export const PERMISSIONS = {
  // Work Management
  WORK_VIEW_ALL: 'work:view:all',
  WORK_VIEW_OWN: 'work:view:own',
  WORK_ASSIGN: 'work:assign',
  WORK_UPDATE: 'work:update',
  WORK_DELETE: 'work:delete',
  WORK_COMPLETE: 'work:complete',

  // Production Management
  PRODUCTION_VIEW: 'production:view',
  PRODUCTION_MANAGE: 'production:manage',
  PRODUCTION_ASSIGN: 'production:assign',
  PRODUCTION_TRACK: 'production:track',

  // Quality Control
  QUALITY_VIEW: 'quality:view',
  QUALITY_INSPECT: 'quality:inspect',
  QUALITY_APPROVE: 'quality:approve',
  QUALITY_REJECT: 'quality:reject',

  // Order Management
  ORDER_VIEW: 'order:view',
  ORDER_CREATE: 'order:create',
  ORDER_UPDATE: 'order:update',
  ORDER_DELETE: 'order:delete',
  ORDER_MANAGE: 'order:manage',

  // Inventory Management
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_UPDATE: 'inventory:update',
  INVENTORY_MANAGE: 'inventory:manage',
  INVENTORY_REQUEST: 'inventory:request',

  // User Management
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_MANAGE_ROLES: 'user:manage:roles',

  // Reports & Analytics
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',
  REPORTS_MANAGE: 'reports:manage',
  ANALYTICS_VIEW: 'analytics:view',

  // Financial
  FINANCE_VIEW: 'finance:view',
  FINANCE_MANAGE: 'finance:manage',
  WAGE_VIEW: 'wage:view',
  WAGE_CALCULATE: 'wage:calculate',

  // System Administration
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_LOGS: 'system:logs',
  SYSTEM_BACKUP: 'system:backup',

  // Notifications
  NOTIFICATIONS_SEND: 'notifications:send',
  NOTIFICATIONS_MANAGE: 'notifications:manage',

  // Machine Configuration
  MACHINE_VIEW: 'machine:view',
  MACHINE_CONFIG: 'machine:config',
} as const;

// Role-based permission mappings
export const ROLE_PERMISSIONS = {
  operator: [
    PERMISSIONS.WORK_VIEW_OWN,
    PERMISSIONS.WORK_UPDATE,
    PERMISSIONS.WORK_COMPLETE,
    PERMISSIONS.QUALITY_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.WAGE_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ],
  
  supervisor: [
    // Operator permissions
    ...ROLE_PERMISSIONS.operator,
    
    // Additional supervisor permissions
    PERMISSIONS.WORK_VIEW_ALL,
    PERMISSIONS.WORK_ASSIGN,
    PERMISSIONS.PRODUCTION_VIEW,
    PERMISSIONS.PRODUCTION_TRACK,
    PERMISSIONS.QUALITY_INSPECT,
    PERMISSIONS.QUALITY_APPROVE,
    PERMISSIONS.QUALITY_REJECT,
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.ANALYTICS_VIEW,
  ],

  management: [
    // All supervisor permissions
    ...ROLE_PERMISSIONS.supervisor,
    
    // Additional management permissions
    PERMISSIONS.PRODUCTION_MANAGE,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.ORDER_MANAGE,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.REPORTS_MANAGE,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.WAGE_CALCULATE,
    PERMISSIONS.NOTIFICATIONS_SEND,
  ],

  admin: [
    // All management permissions
    ...ROLE_PERMISSIONS.management,
    
    // Additional admin permissions
    PERMISSIONS.WORK_DELETE,
    PERMISSIONS.ORDER_DELETE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.USER_MANAGE_ROLES,
    PERMISSIONS.FINANCE_MANAGE,
    PERMISSIONS.SYSTEM_SETTINGS,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.SYSTEM_LOGS,
    PERMISSIONS.SYSTEM_BACKUP,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
    PERMISSIONS.MACHINE_VIEW,
    PERMISSIONS.MACHINE_CONFIG,
  ],
} as any;

// Resource-based permissions for fine-grained control
export interface ResourcePermission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export class PermissionsService {
  /**
   * Check if user has a specific permission
   */
  static hasPermission(user: User | null, permission: string): boolean {
    if (!user) return false;

    // Admin has all permissions
    if (user.role === 'admin') return true;

    // Check explicit permissions
    if (user.permissions.includes(permission)) return true;

    // Check role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  static hasAnyPermission(user: User | null, permissions: string[]): boolean {
    if (!user) return false;

    return permissions.some(permission => this.hasPermission(user, permission));
  }

  /**
   * Check if user has all of the specified permissions
   */
  static hasAllPermissions(user: User | null, permissions: string[]): boolean {
    if (!user) return false;

    return permissions.every(permission => this.hasPermission(user, permission));
  }

  /**
   * Get all permissions for a user
   */
  static getUserPermissions(user: User | null): string[] {
    if (!user) return [];

    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    const explicitPermissions = user.permissions || [];

    // Combine and deduplicate permissions
    return [...new Set([...rolePermissions, ...explicitPermissions])];
  }

  /**
   * Check if user can access a specific resource
   */
  static canAccessResource(
    user: User | null, 
    resource: string, 
    action: string, 
    context?: Record<string, any>
  ): boolean {
    if (!user) return false;

    const permission = `${resource}:${action}`;
    
    // Basic permission check
    if (!this.hasPermission(user, permission)) return false;

    // Additional context-based checks
    if (context) {
      // Owner check - user can only access their own resources
      if (action === 'view' || action === 'update') {
        if (context.ownerId && context.ownerId !== user.id) {
          // Check if user has permission to view/update others' resources
          const viewAllPermission = `${resource}:view:all`;
          return this.hasPermission(user, viewAllPermission);
        }
      }

      // Department-based access
      if (context.department && user.department) {
        if (context.department !== user.department) {
          const crossDepartmentPermission = `${resource}:${action}:cross_department`;
          return this.hasPermission(user, crossDepartmentPermission);
        }
      }
    }

    return true;
  }

  /**
   * Filter resources based on user permissions
   */
  static filterResources<T extends { id: string; ownerId?: string; department?: string }>(
    user: User | null,
    resources: T[],
    resource: string,
    action: string = 'view'
  ): T[] {
    if (!user) return [];

    return resources.filter(item => 
      this.canAccessResource(user, resource, action, {
        ownerId: item.ownerId,
        department: item.department
      })
    );
  }

  /**
   * Get navigation items based on user permissions
   */
  static getNavigationItems(user: User | null): string[] {
    if (!user) return [];

    const items: string[] = ['dashboard']; // Dashboard is available to all authenticated users

    // Work management
    if (this.hasAnyPermission(user, [PERMISSIONS.WORK_VIEW_OWN, PERMISSIONS.WORK_VIEW_ALL])) {
      items.push('work');
    }

    // Production management
    if (this.hasPermission(user, PERMISSIONS.PRODUCTION_VIEW)) {
      items.push('production');
    }

    // Orders
    if (this.hasPermission(user, PERMISSIONS.ORDER_VIEW)) {
      items.push('orders');
    }

    // Inventory
    if (this.hasPermission(user, PERMISSIONS.INVENTORY_VIEW)) {
      items.push('inventory');
    }

    // Reports
    if (this.hasPermission(user, PERMISSIONS.REPORTS_VIEW)) {
      items.push('reports');
    }

    // User management
    if (this.hasPermission(user, PERMISSIONS.USER_VIEW)) {
      items.push('users');
    }

    // System administration
    if (this.hasPermission(user, PERMISSIONS.SYSTEM_SETTINGS)) {
      items.push('admin');
    }

    return items;
  }

  /**
   * Get available actions for a resource
   */
  static getResourceActions(user: User | null, resource: string): string[] {
    if (!user) return [];

    const actions: string[] = [];

    // Check common actions
    const commonActions = ['view', 'create', 'update', 'delete'];
    
    for (const action of commonActions) {
      const permission = `${resource}:${action}`;
      if (this.hasPermission(user, permission)) {
        actions.push(action);
      }
    }

    // Check resource-specific actions
    if (resource === 'work') {
      if (this.hasPermission(user, PERMISSIONS.WORK_ASSIGN)) actions.push('assign');
      if (this.hasPermission(user, PERMISSIONS.WORK_COMPLETE)) actions.push('complete');
    }

    if (resource === 'quality') {
      if (this.hasPermission(user, PERMISSIONS.QUALITY_INSPECT)) actions.push('inspect');
      if (this.hasPermission(user, PERMISSIONS.QUALITY_APPROVE)) actions.push('approve');
      if (this.hasPermission(user, PERMISSIONS.QUALITY_REJECT)) actions.push('reject');
    }

    return actions;
  }

  /**
   * Check role hierarchy
   */
  static isHigherRole(userRole: string, targetRole: string): boolean {
    const roleHierarchy = {
      admin: 4,
      management: 3,
      supervisor: 2,
      operator: 1,
    };

    return (roleHierarchy[userRole] || 0) > (roleHierarchy[targetRole] || 0);
  }

  /**
   * Validate permission syntax
   */
  static isValidPermission(permission: string): boolean {
    const permissionPattern = /^[a-z_]+:[a-z_]+(:[a-z_]+)?$/;
    return permissionPattern.test(permission);
  }

  /**
   * Get permission description
   */
  static getPermissionDescription(permission: string): string {
    const descriptions: Record<string, string> = {
      [PERMISSIONS.WORK_VIEW_ALL]: 'View all work assignments',
      [PERMISSIONS.WORK_VIEW_OWN]: 'View own work assignments',
      [PERMISSIONS.WORK_ASSIGN]: 'Assign work to operators',
      [PERMISSIONS.WORK_UPDATE]: 'Update work items',
      [PERMISSIONS.WORK_DELETE]: 'Delete work items',
      [PERMISSIONS.WORK_COMPLETE]: 'Mark work as complete',
      [PERMISSIONS.PRODUCTION_VIEW]: 'View production data',
      [PERMISSIONS.PRODUCTION_MANAGE]: 'Manage production processes',
      [PERMISSIONS.QUALITY_INSPECT]: 'Perform quality inspections',
      [PERMISSIONS.QUALITY_APPROVE]: 'Approve quality checks',
      [PERMISSIONS.ORDER_MANAGE]: 'Manage customer orders',
      [PERMISSIONS.USER_MANAGE_ROLES]: 'Manage user roles and permissions',
      [PERMISSIONS.SYSTEM_SETTINGS]: 'Access system settings',
    };

    return descriptions[permission] || permission;
  }
}

// Export permission constants and types
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type Role = keyof typeof ROLE_PERMISSIONS;