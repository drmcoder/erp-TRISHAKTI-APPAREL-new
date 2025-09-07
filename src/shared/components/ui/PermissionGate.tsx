import React from 'react';
import { usePermissions } from '@/app/hooks/usePermissions';

interface PermissionGateProps {
  children: React.ReactNode;
  roles?: string[];
  permissions?: string[];
  requireAllPermissions?: boolean;
  resource?: string;
  action?: string;
  context?: Record<string, any>;
  fallback?: React.ReactNode;
  inverse?: boolean; // Show content when user DOESN'T have permission
}

/**
 * Permission Gate component that conditionally renders content based on user permissions
 * 
 * @example
 * // Show content only to admins
 * <PermissionGate roles={['admin']}>
 *   <AdminPanel />
 * </PermissionGate>
 * 
 * @example
 * // Show content based on specific permissions
 * <PermissionGate permissions={['user:create']} fallback={<div>Access denied</div>}>
 *   <CreateUserButton />
 * </PermissionGate>
 * 
 * @example
 * // Resource-based permission check
 * <PermissionGate resource="order" action="edit" context={{ownerId: orderId}}>
 *   <EditOrderButton />
 * </PermissionGate>
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  children,
  roles,
  permissions,
  requireAllPermissions = false,
  resource,
  action,
  context,
  fallback = null,
  inverse = false,
}) => {
  const permissionsHook = usePermissions();
  const { user } = permissionsHook;

  if (!user) {
    return inverse ? <>{children}</> : <>{fallback}</>;
  }

  let hasAccess = true;

  // Check role-based access
  if (roles && roles.length > 0) {
    hasAccess = roles.includes(user.role);
  }

  // Check permission-based access
  if (hasAccess && permissions && permissions.length > 0) {
    hasAccess = requireAllPermissions
      ? permissionsHook.hasAllPermissions(permissions)
      : permissionsHook.hasAnyPermission(permissions);
  }

  // Check resource-based access
  if (hasAccess && resource && action) {
    hasAccess = permissionsHook.canAccessResource(resource, action, context);
  }

  // Apply inverse logic if specified
  if (inverse) {
    hasAccess = !hasAccess;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};