import { useUser } from '@/app/store/auth-store';
import { PermissionsService } from '@/services/permissions-service';

export const usePermissions = () => {
  const user = useUser();

  const hasPermission = (permission: string): boolean => {
    return PermissionsService.hasPermission(user, permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return PermissionsService.hasAnyPermission(user, permissions);
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return PermissionsService.hasAllPermissions(user, permissions);
  };

  const canAccessResource = (
    resource: string, 
    action: string, 
    context?: Record<string, any>
  ): boolean => {
    return PermissionsService.canAccessResource(user, resource, action, context);
  };

  const getUserPermissions = (): string[] => {
    return PermissionsService.getUserPermissions(user);
  };

  const getNavigationItems = (): string[] => {
    return PermissionsService.getNavigationItems(user);
  };

  const getResourceActions = (resource: string): string[] => {
    return PermissionsService.getResourceActions(user, resource);
  };

  const filterResources = <T extends { id: string; ownerId?: string; department?: string }>(
    resources: T[],
    resource: string,
    action: string = 'view'
  ): T[] => {
    return PermissionsService.filterResources(user, resources, resource, action);
  };

  const isHigherRole = (targetRole: string): boolean => {
    return user ? PermissionsService.isHigherRole(user.role, targetRole) : false;
  };

  return {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessResource,
    getUserPermissions,
    getNavigationItems,
    getResourceActions,
    filterResources,
    isHigherRole,
  };
};