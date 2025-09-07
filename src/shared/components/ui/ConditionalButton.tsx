import React from 'react';
import { Button, ButtonProps } from '@/shared/components/ui/Button';
import { usePermissions } from '@/app/hooks/usePermissions';

interface ConditionalButtonProps extends Omit<ButtonProps, 'disabled'> {
  roles?: string[];
  permissions?: string[];
  requireAllPermissions?: boolean;
  resource?: string;
  action?: string;
  context?: Record<string, any>;
  hideWhenNoAccess?: boolean; // Hide button instead of disabling it
  disabledTitle?: string; // Tooltip when disabled due to permissions
  forceDisabled?: boolean; // Force disable regardless of permissions
}

/**
 * Button component that automatically manages visibility/state based on permissions
 * 
 * @example
 * <ConditionalButton
 *   permissions={['user:delete']}
 *   variant="destructive"
 *   hideWhenNoAccess
 *   onClick={handleDelete}
 * >
 *   Delete User
 * </ConditionalButton>
 */
export const ConditionalButton: React.FC<ConditionalButtonProps> = ({
  children,
  roles,
  permissions,
  requireAllPermissions = false,
  resource,
  action,
  context,
  hideWhenNoAccess = false,
  disabledTitle,
  forceDisabled = false,
  ...buttonProps
}) => {
  const permissionsHook = usePermissions();
  const { user } = permissionsHook;

  // If no user, hide button
  if (!user && hideWhenNoAccess) {
    return null;
  }

  let hasAccess = true;

  if (user) {
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
  } else {
    hasAccess = false;
  }

  // Hide button if no access and hideWhenNoAccess is true
  if (!hasAccess && hideWhenNoAccess) {
    return null;
  }

  // Determine if button should be disabled
  const isDisabled = forceDisabled || !hasAccess;

  return (
    <Button
      {...buttonProps}
      disabled={isDisabled}
      title={isDisabled && disabledTitle ? disabledTitle : buttonProps.title}
    >
      {children}
    </Button>
  );
};