import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser, useIsAuthenticated } from '@/app/store/auth-store';
import { LoadingPage } from '@/shared/components/ui';
import { PermissionsService } from '@/services/permissions-service';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  requireAllPermissions?: boolean;
  resource?: string;
  action?: string;
  context?: Record<string, any>;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  requireAllPermissions = true,
  resource,
  action,
  context,
  fallbackPath = '/login'
}) => {
  const location = useLocation();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  // Show loading while authentication state is being determined
  if (isAuthenticated === undefined) {
    return <LoadingPage message="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // Check role permissions if required
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return (
      <Navigate 
        to="/unauthorized"
        state={{ from: location }}
        replace
      />
    );
  }

  // Check specific permissions if required
  if (requiredPermissions.length > 0) {
    const hasPermission = requireAllPermissions
      ? PermissionsService.hasAllPermissions(user, requiredPermissions)
      : PermissionsService.hasAnyPermission(user, requiredPermissions);

    if (!hasPermission) {
      return (
        <Navigate 
          to="/unauthorized"
          state={{ from: location }}
          replace
        />
      );
    }
  }

  // Check resource-based permissions if specified
  if (resource && action) {
    const canAccess = PermissionsService.canAccessResource(user, resource, action, context);
    if (!canAccess) {
      return (
        <Navigate 
          to="/unauthorized"
          state={{ from: location }}
          replace
        />
      );
    }
  }

  return <>{children}</>;
};