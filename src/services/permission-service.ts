// Role-based Permission System for TSA ERP
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface UserPermissions {
  userId: string;
  role: Role;
  customPermissions?: Permission[];
}

// Define available permissions
export const PERMISSIONS = {
  // Operator permissions
  OPERATOR_VIEW_DASHBOARD: {
    id: 'operator.view.dashboard',
    name: 'View Operator Dashboard',
    description: 'Can view operator dashboard with personal metrics',
    resource: 'dashboard',
    action: 'view'
  },
  OPERATOR_VIEW_WORK_ASSIGNMENTS: {
    id: 'operator.view.work-assignments',
    name: 'View Work Assignments',
    description: 'Can view assigned work items',
    resource: 'work-assignments',
    action: 'view'
  },
  OPERATOR_SELF_ASSIGN_WORK: {
    id: 'operator.assign.work.self',
    name: 'Self-Assign Work',
    description: 'Can assign work to themselves',
    resource: 'work-assignments',
    action: 'self-assign'
  },
  OPERATOR_VIEW_PERFORMANCE: {
    id: 'operator.view.performance',
    name: 'View Personal Performance',
    description: 'Can view their own performance metrics',
    resource: 'performance',
    action: 'view'
  },
  OPERATOR_UPDATE_STATUS: {
    id: 'operator.update.status',
    name: 'Update Work Status',
    description: 'Can update work item status and progress',
    resource: 'work-items',
    action: 'update-status'
  },

  // Supervisor permissions
  SUPERVISOR_VIEW_DASHBOARD: {
    id: 'supervisor.view.dashboard',
    name: 'View Supervisor Dashboard',
    description: 'Can view supervisor dashboard with team metrics',
    resource: 'dashboard',
    action: 'view'
  },
  SUPERVISOR_VIEW_TEAM: {
    id: 'supervisor.view.team',
    name: 'View Team Members',
    description: 'Can view team member information and status',
    resource: 'team',
    action: 'view'
  },
  SUPERVISOR_ASSIGN_WORK: {
    id: 'supervisor.assign.work',
    name: 'Assign Work to Team',
    description: 'Can assign work items to team members',
    resource: 'work-assignments',
    action: 'assign'
  },
  SUPERVISOR_APPROVE_ASSIGNMENTS: {
    id: 'supervisor.approve.assignments',
    name: 'Approve Work Assignments',
    description: 'Can approve or reject work assignment requests',
    resource: 'work-assignments',
    action: 'approve'
  },
  SUPERVISOR_VIEW_TEAM_PERFORMANCE: {
    id: 'supervisor.view.team-performance',
    name: 'View Team Performance',
    description: 'Can view performance metrics for team members',
    resource: 'performance',
    action: 'view-team'
  },
  SUPERVISOR_MANAGE_TEAM_SCHEDULE: {
    id: 'supervisor.manage.schedule',
    name: 'Manage Team Schedule',
    description: 'Can manage team work schedules',
    resource: 'schedule',
    action: 'manage'
  },

  // Management/Admin permissions
  ADMIN_VIEW_DASHBOARD: {
    id: 'admin.view.dashboard',
    name: 'View Admin Dashboard',
    description: 'Can view administrative dashboard with company-wide metrics',
    resource: 'dashboard',
    action: 'view'
  },
  ADMIN_MANAGE_USERS: {
    id: 'admin.manage.users',
    name: 'Manage Users',
    description: 'Can create, update, and delete user accounts',
    resource: 'users',
    action: 'manage'
  },
  ADMIN_MANAGE_ROLES: {
    id: 'admin.manage.roles',
    name: 'Manage Roles',
    description: 'Can create and modify user roles and permissions',
    resource: 'roles',
    action: 'manage'
  },
  ADMIN_VIEW_ALL_PERFORMANCE: {
    id: 'admin.view.all-performance',
    name: 'View All Performance Data',
    description: 'Can view performance data for all users and departments',
    resource: 'performance',
    action: 'view-all'
  },
  ADMIN_MANAGE_PRODUCTION: {
    id: 'admin.manage.production',
    name: 'Manage Production',
    description: 'Can manage production lines, machines, and workflows',
    resource: 'production',
    action: 'manage'
  },
  ADMIN_GENERATE_REPORTS: {
    id: 'admin.generate.reports',
    name: 'Generate Reports',
    description: 'Can generate and export system reports',
    resource: 'reports',
    action: 'generate'
  },
  ADMIN_MANAGE_NOTIFICATIONS: {
    id: 'admin.manage.notifications',
    name: 'Manage Notifications',
    description: 'Can send system-wide notifications and manage notification settings',
    resource: 'notifications',
    action: 'manage'
  },
  ADMIN_VIEW_ANALYTICS: {
    id: 'admin.view.analytics',
    name: 'View System Analytics',
    description: 'Can view detailed system analytics and insights',
    resource: 'analytics',
    action: 'view'
  }
} as const;

// Define roles with their permissions
export const ROLES: { [key: string]: Role } = {
  OPERATOR: {
    id: 'operator',
    name: 'Operator',
    description: 'Production line operator with basic permissions',
    permissions: [
      PERMISSIONS.OPERATOR_VIEW_DASHBOARD,
      PERMISSIONS.OPERATOR_VIEW_WORK_ASSIGNMENTS,
      PERMISSIONS.OPERATOR_SELF_ASSIGN_WORK,
      PERMISSIONS.OPERATOR_VIEW_PERFORMANCE,
      PERMISSIONS.OPERATOR_UPDATE_STATUS
    ]
  },
  
  SUPERVISOR: {
    id: 'supervisor',
    name: 'Supervisor',
    description: 'Team supervisor with team management permissions',
    permissions: [
      // Supervisor-specific permissions
      PERMISSIONS.SUPERVISOR_VIEW_DASHBOARD,
      PERMISSIONS.SUPERVISOR_VIEW_TEAM,
      PERMISSIONS.SUPERVISOR_ASSIGN_WORK,
      PERMISSIONS.SUPERVISOR_APPROVE_ASSIGNMENTS,
      PERMISSIONS.SUPERVISOR_VIEW_TEAM_PERFORMANCE,
      PERMISSIONS.SUPERVISOR_MANAGE_TEAM_SCHEDULE,
      // Also has operator permissions for their own work
      PERMISSIONS.OPERATOR_VIEW_WORK_ASSIGNMENTS,
      PERMISSIONS.OPERATOR_VIEW_PERFORMANCE,
      PERMISSIONS.OPERATOR_UPDATE_STATUS
    ]
  },
  
  ADMIN: {
    id: 'admin',
    name: 'Administrator',
    description: 'System administrator with full permissions',
    permissions: [
      // Admin-specific permissions
      PERMISSIONS.ADMIN_VIEW_DASHBOARD,
      PERMISSIONS.ADMIN_MANAGE_USERS,
      PERMISSIONS.ADMIN_MANAGE_ROLES,
      PERMISSIONS.ADMIN_VIEW_ALL_PERFORMANCE,
      PERMISSIONS.ADMIN_MANAGE_PRODUCTION,
      PERMISSIONS.ADMIN_GENERATE_REPORTS,
      PERMISSIONS.ADMIN_MANAGE_NOTIFICATIONS,
      PERMISSIONS.ADMIN_VIEW_ANALYTICS,
      // Also has supervisor permissions
      PERMISSIONS.SUPERVISOR_VIEW_DASHBOARD,
      PERMISSIONS.SUPERVISOR_VIEW_TEAM,
      PERMISSIONS.SUPERVISOR_ASSIGN_WORK,
      PERMISSIONS.SUPERVISOR_APPROVE_ASSIGNMENTS,
      PERMISSIONS.SUPERVISOR_VIEW_TEAM_PERFORMANCE,
      PERMISSIONS.SUPERVISOR_MANAGE_TEAM_SCHEDULE,
      // And operator permissions
      PERMISSIONS.OPERATOR_VIEW_DASHBOARD,
      PERMISSIONS.OPERATOR_VIEW_WORK_ASSIGNMENTS,
      PERMISSIONS.OPERATOR_SELF_ASSIGN_WORK,
      PERMISSIONS.OPERATOR_VIEW_PERFORMANCE,
      PERMISSIONS.OPERATOR_UPDATE_STATUS
    ]
  }
};

class PermissionService {
  private userPermissions: Map<string, UserPermissions> = new Map();
  
  // Check if user has a specific permission
  hasPermission(userId: string, permissionId: string): boolean {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return false;
    
    // Check role permissions
    const hasRolePermission = userPerms.role.permissions.some(
      perm => perm.id === permissionId
    );
    
    // Check custom permissions
    const hasCustomPermission = userPerms.customPermissions?.some(
      perm => perm.id === permissionId
    ) || false;
    
    return hasRolePermission || hasCustomPermission;
  }
  
  // Check if user has any of the specified permissions
  hasAnyPermission(userId: string, permissionIds: string[]): boolean {
    return permissionIds.some(permId => this.hasPermission(userId, permId));
  }
  
  // Check if user has all specified permissions
  hasAllPermissions(userId: string, permissionIds: string[]): boolean {
    return permissionIds.every(permId => this.hasPermission(userId, permId));
  }
  
  // Get user's role
  getUserRole(userId: string): Role | null {
    const userPerms = this.userPermissions.get(userId);
    return userPerms?.role || null;
  }
  
  // Set user permissions
  setUserPermissions(userId: string, role: Role, customPermissions?: Permission[]): void {
    this.userPermissions.set(userId, {
      userId,
      role,
      customPermissions
    });
  }
  
  // Set user role (convenience method)
  setUserRole(userId: string, roleId: string): void {
    const role = ROLES[roleId];
    if (role) {
      this.setUserPermissions(userId, role);
    }
  }
  
  // Get all permissions for a user
  getUserPermissions(userId: string): Permission[] {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return [];
    
    const rolePermissions = userPerms.role.permissions;
    const customPermissions = userPerms.customPermissions || [];
    
    // Combine and deduplicate
    const allPermissions = [...rolePermissions, ...customPermissions];
    const uniquePermissions = allPermissions.filter(
      (perm, index, arr) => arr.findIndex(p => p.id === perm.id) === index
    );
    
    return uniquePermissions;
  }
  
  // Check if user can access a dashboard
  canAccessDashboard(userId: string, dashboardType: 'operator' | 'supervisor' | 'admin'): boolean {
    switch (dashboardType) {
      case 'operator':
        return this.hasPermission(userId, PERMISSIONS.OPERATOR_VIEW_DASHBOARD.id);
      case 'supervisor':
        return this.hasPermission(userId, PERMISSIONS.SUPERVISOR_VIEW_DASHBOARD.id);
      case 'admin':
        return this.hasPermission(userId, PERMISSIONS.ADMIN_VIEW_DASHBOARD.id);
      default:
        return false;
    }
  }
  
  // Get appropriate dashboard type for user
  getPreferredDashboard(userId: string): 'operator' | 'supervisor' | 'admin' | null {
    if (this.canAccessDashboard(userId, 'admin')) {
      return 'admin';
    } else if (this.canAccessDashboard(userId, 'supervisor')) {
      return 'supervisor';
    } else if (this.canAccessDashboard(userId, 'operator')) {
      return 'operator';
    }
    return null;
  }
  
  // Load permissions from storage or API
  async loadUserPermissions(userId: string): Promise<void> {
    try {
      // This would typically load from your backend API or Firebase
      // For now, we'll use localStorage as a simple storage mechanism
      const stored = localStorage.getItem(`user-permissions-${userId}`);
      if (stored) {
        const data = JSON.parse(stored);
        const role = ROLES[data.roleId];
        if (role) {
          this.setUserPermissions(userId, role, data.customPermissions);
        }
      }
    } catch (error) {
      console.error('Failed to load user permissions:', error);
    }
  }
  
  // Save permissions to storage
  async saveUserPermissions(userId: string): Promise<void> {
    try {
      const userPerms = this.userPermissions.get(userId);
      if (userPerms) {
        const data = {
          roleId: userPerms.role.id,
          customPermissions: userPerms.customPermissions
        };
        localStorage.setItem(`user-permissions-${userId}`, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to save user permissions:', error);
    }
  }
  
  // Initialize with default permissions for development/testing
  initializeDemoPermissions(): void {
    // Demo operators
    this.setUserRole('operator-001', 'OPERATOR');
    this.setUserRole('operator', 'OPERATOR');
    this.setUserRole('op-maya-001', 'OPERATOR');
    
    // Demo supervisors
    this.setUserRole('supervisor-001', 'SUPERVISOR');
    this.setUserRole('supervisor', 'SUPERVISOR');
    this.setUserRole('sup', 'SUPERVISOR');
    this.setUserRole('sup-john-001', 'SUPERVISOR');
    
    // Demo admins
    this.setUserRole('admin-001', 'ADMIN');
    this.setUserRole('admin', 'ADMIN');
    this.setUserRole('administrator', 'ADMIN');
    this.setUserRole('mgr-admin-001', 'ADMIN');
  }
}

// Create singleton instance
export const permissionService = new PermissionService();

// Initialize demo permissions for development
if (typeof window !== 'undefined') {
  permissionService.initializeDemoPermissions();
}

export default permissionService;