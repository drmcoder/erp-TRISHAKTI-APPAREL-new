import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Users, FileText, BarChart3, Settings,
  ChevronDown, ChevronRight, Wallet, AlertTriangle, CheckSquare,
  Clock, TrendingUp, UserCheck, Wrench, Archive, FileSpreadsheet,
  PlusCircle, List, Calendar, Map
} from 'lucide-react';
import { 
  Text, Button, Badge, Flex, Stack, Divider, Collapsible 
} from '@/shared/components/ui';
import { useUser } from '@/app/store/auth-store';
import { usePermissions } from '@/app/hooks/usePermissions';
import { cn } from '@/shared/utils';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: string | number;
  children?: NavigationItem[];
  roles?: string[]; // Which roles can see this item
  permissions?: string[]; // Which permissions are required
  requireAllPermissions?: boolean; // Default: false (any permission)
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    href: '/dashboard',
    roles: ['operator', 'supervisor', 'management', 'admin'],
  },
  
  // Operator Section
  {
    id: 'work',
    label: 'My Work',
    icon: <CheckSquare className="w-5 h-5" />,
    roles: ['operator'],
    permissions: ['work:view:own'],
    children: [
      {
        id: 'assigned-work',
        label: 'Assigned Work',
        icon: <List className="w-4 h-4" />,
        href: '/work/assigned',
        badge: '3',
        roles: ['operator'],
        permissions: ['work:view:own'],
      },
      {
        id: 'work-history',
        label: 'Work History',
        icon: <Clock className="w-4 h-4" />,
        href: '/work/history',
        roles: ['operator'],
        permissions: ['work:view:own'],
      },
    ],
  },
  {
    id: 'earnings',
    label: 'Earnings',
    icon: <Wallet className="w-5 h-5" />,
    href: '/earnings',
    roles: ['operator'],
    permissions: ['wage:view'],
  },

  // Work Assignment Section - Consolidated
  {
    id: 'work-assignments',
    label: 'Work Assignment',
    icon: <UserCheck className="w-5 h-5" />,
    roles: ['supervisor', 'management', 'admin'],
    permissions: ['work:assign'],
    children: [
      {
        id: 'drag-drop-assignment',
        label: 'Drag & Drop Assignment',
        icon: <Map className="w-4 h-4" />,
        href: '/work-assignment/drag-drop',
        roles: ['supervisor', 'management', 'admin'],
        permissions: ['work:assign'],
      },
      {
        id: 'bulk-assignment',
        label: 'Bulk Assignment',
        icon: <Package className="w-4 h-4" />,
        href: '/work-assignment/bulk',
        roles: ['supervisor', 'management', 'admin'],
        permissions: ['work:assign'],
      },
      {
        id: 'self-assignment',
        label: 'Self Assignment',
        icon: <CheckSquare className="w-4 h-4" />,
        href: '/work-assignment/self',
        roles: ['supervisor', 'management', 'admin'],
        permissions: ['work:assign'],
      },
      {
        id: 'assignment-history',
        label: 'Assignment History',
        icon: <Clock className="w-4 h-4" />,
        href: '/work-assignment/history',
        roles: ['supervisor', 'management', 'admin'],
        permissions: ['work:view'],
      },
      {
        id: 'assignment-analytics',
        label: 'Assignment Analytics',
        icon: <BarChart3 className="w-4 h-4" />,
        href: '/work-assignment/analytics',
        roles: ['supervisor', 'management', 'admin'],
        permissions: ['analytics:view'],
      },
    ],
  },

  // Production Section (remaining items)
  {
    id: 'production',
    label: 'Production',
    icon: <Package className="w-5 h-5" />,
    roles: ['supervisor', 'management', 'admin'],
    permissions: ['production:view'],
    children: [
      {
        id: 'progress-tracking',
        label: 'Progress Tracking',
        icon: <TrendingUp className="w-4 h-4" />,
        href: '/production/progress',
        roles: ['supervisor', 'management', 'admin'],
        permissions: ['production:track'],
      },
      {
        id: 'quality-control',
        label: 'Quality Control',
        icon: <AlertTriangle className="w-4 h-4" />,
        href: '/production/quality',
        badge: '2',
        roles: ['supervisor', 'management', 'admin'],
        permissions: ['quality:inspect'],
      },
    ],
  },

  // Management Section
  {
    id: 'orders',
    label: 'Orders',
    icon: <FileText className="w-5 h-5" />,
    roles: ['management', 'admin'],
    permissions: ['order:view'],
    children: [
      {
        id: 'create-order',
        label: 'Create Order',
        icon: <PlusCircle className="w-4 h-4" />,
        href: '/orders/create',
        roles: ['management', 'admin'],
        permissions: ['order:create'],
      },
      {
        id: 'order-list',
        label: 'Order List',
        icon: <List className="w-4 h-4" />,
        href: '/orders/list',
        roles: ['management', 'admin'],
        permissions: ['order:view'],
      },
      {
        id: 'order-tracking',
        label: 'Order Tracking',
        icon: <Map className="w-4 h-4" />,
        href: '/orders/tracking',
        roles: ['management', 'admin'],
        permissions: ['order:view'],
      },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: <Archive className="w-5 h-5" />,
    roles: ['management', 'admin'],
    permissions: ['inventory:view'],
    children: [
      {
        id: 'stock-levels',
        label: 'Stock Levels',
        icon: <Package className="w-4 h-4" />,
        href: '/inventory/stock',
        roles: ['management', 'admin'],
        permissions: ['inventory:view'],
      },
      {
        id: 'material-requests',
        label: 'Material Requests',
        icon: <PlusCircle className="w-4 h-4" />,
        href: '/inventory/requests',
        badge: '5',
        roles: ['management', 'admin'],
        permissions: ['inventory:request'],
      },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ['management', 'admin'],
    permissions: ['reports:view'],
    children: [
      {
        id: 'production-reports',
        label: 'Production Reports',
        icon: <FileSpreadsheet className="w-4 h-4" />,
        href: '/reports/production',
        roles: ['management', 'admin'],
        permissions: ['reports:view'],
      },
      {
        id: 'efficiency-reports',
        label: 'Efficiency Reports',
        icon: <TrendingUp className="w-4 h-4" />,
        href: '/reports/efficiency',
        roles: ['management', 'admin'],
        permissions: ['analytics:view'],
      },
      {
        id: 'financial-reports',
        label: 'Financial Reports',
        icon: <Wallet className="w-4 h-4" />,
        href: '/reports/financial',
        roles: ['management', 'admin'],
        permissions: ['finance:view'],
      },
    ],
  },

  // Common sections
  {
    id: 'calendar',
    label: 'Schedule',
    icon: <Calendar className="w-5 h-5" />,
    href: '/schedule',
    roles: ['operator', 'supervisor', 'management', 'admin'],
  },
  
  // Admin Section
  {
    id: 'admin',
    label: 'Administration',
    icon: <Settings className="w-5 h-5" />,
    roles: ['admin'],
    permissions: ['system:settings'],
    children: [
      {
        id: 'user-management',
        label: 'User Management',
        icon: <Users className="w-4 h-4" />,
        href: '/admin/users',
        roles: ['admin'],
        permissions: ['user:manage:roles'],
      },
      {
        id: 'system-settings',
        label: 'System Settings',
        icon: <Wrench className="w-4 h-4" />,
        href: '/admin/settings',
        roles: ['admin'],
        permissions: ['system:settings'],
      },
      {
        id: 'machine-config',
        label: 'Machine Config',
        icon: <Settings className="w-4 h-4" />,
        href: '/admin/machines',
        roles: ['admin'],
        permissions: ['machine:config'],
      },
    ],
  },
];

const NavigationItemComponent: React.FC<{
  item: NavigationItem;
  permissions: ReturnType<typeof usePermissions>;
  level?: number;
  onNavigate?: () => void;
}> = ({ item, permissions, level = 0, onNavigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = permissions;
  
  if (!user) return null;
  
  // Check role-based access
  const hasRoleAccess = !item.roles || item.roles.includes(user.role);
  if (!hasRoleAccess) return null;
  
  // Check permission-based access
  let hasPermissionAccess = true;
  if (item.permissions && item.permissions.length > 0) {
    hasPermissionAccess = item.requireAllPermissions 
      ? permissions.hasAllPermissions(item.permissions)
      : permissions.hasAnyPermission(item.permissions);
  }
  if (!hasPermissionAccess) return null;

  const hasChildren = item.children && item.children.length > 0;
  const visibleChildren = item.children?.filter(child => {
    const childHasRoleAccess = !child.roles || child.roles.includes(user.role);
    if (!childHasRoleAccess) return false;
    
    let childHasPermissionAccess = true;
    if (child.permissions && child.permissions.length > 0) {
      childHasPermissionAccess = child.requireAllPermissions 
        ? permissions.hasAllPermissions(child.permissions)
        : permissions.hasAnyPermission(child.permissions);
    }
    return childHasPermissionAccess;
  }) || [];
  const hasVisibleChildren = visibleChildren.length > 0;

  const linkClasses = cn(
    'flex items-center w-full px-3 py-2 text-left transition-colors duration-200',
    'hover:bg-secondary-100 dark:hover:bg-secondary-800',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset',
    'rounded-md',
    level > 0 && 'ml-4 text-sm'
  );

  if (item.href && !hasVisibleChildren) {
    // Direct link
    return (
      <NavLink
        to={item.href}
        onClick={onNavigate} // Auto-hide on navigation
        className={({ isActive }) => cn(
          linkClasses,
          isActive && 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300',
          // Enhanced touch targets for mobile
          'min-h-[44px] touch-manipulation'
        )}
      >
        <span className="mr-3 flex-shrink-0">
          {item.icon}
        </span>
        <span className="flex-1">
          {item.label}
        </span>
        {item.badge && (
          <Badge size="sm" variant="primary" className="ml-2">
            {item.badge}
          </Badge>
        )}
      </NavLink>
    );
  }

  if (hasVisibleChildren) {
    // Expandable section
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(linkClasses, 'min-h-[44px] touch-manipulation')}
        >
          <span className="mr-3 flex-shrink-0">
            {item.icon}
          </span>
          <span className="flex-1">
            {item.label}
          </span>
          {item.badge && (
            <Badge size="sm" variant="primary" className="mr-2">
              {item.badge}
            </Badge>
          )}
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        
        {isExpanded && (
          <div className="mt-1 space-y-1">
            {visibleChildren.map((child) => (
              <NavigationItemComponent
                key={child.id}
                item={child}
                permissions={permissions}
                level={level + 1}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = true,
  onClose,
  className
}) => {
  const user = useUser();
  const permissions = usePermissions();

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-30 h-full w-64 transform bg-white dark:bg-secondary-900',
        'border-r border-secondary-200 dark:border-secondary-700',
        'transition-transform duration-300 ease-in-out',
        'lg:static lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        className
      )}>
        <div className="flex h-full flex-col">
          {/* Header - only visible on mobile when sidebar is a modal */}
          <div className="lg:hidden p-4 border-b border-secondary-200 dark:border-secondary-700">
            <Flex align="center" justify="between">
              <Text weight="bold" size="lg">
                Navigation
              </Text>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ✕
              </Button>
            </Flex>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <Stack spacing={6}>
              {/* User info */}
              <div className="px-3 py-2 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                <Text size="sm" weight="medium" className="text-secondary-900 dark:text-secondary-100">
                  {user.name}
                </Text>
                <Text size="xs" color="muted">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Text>
              </div>

              <Divider />

              {/* Navigation items */}
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <NavigationItemComponent
                    key={item.id}
                    item={item}
                    permissions={permissions}
                    onNavigate={() => {
                      // Auto-hide sidebar on mobile after navigation
                      if (window.innerWidth < 1024) {
                        onClose?.();
                      }
                    }}
                  />
                ))}
              </div>
            </Stack>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
            <Text size="xs" color="muted" align="center">
              TSA ERP System v2.0
            </Text>
            <Text size="xs" color="muted" align="center" className="mt-1">
              © 2024 TSA Manufacturing
            </Text>
          </div>
        </div>
      </aside>
    </>
  );
};