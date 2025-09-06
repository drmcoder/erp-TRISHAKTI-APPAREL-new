import React from 'react';
import { usePermissions } from '@/app/hooks/usePermissions';

interface RoleBasedRendererProps {
  roles: {
    [role: string]: React.ReactNode;
  };
  fallback?: React.ReactNode;
  showMultiple?: boolean; // Show content for all matching roles
}

/**
 * Role-based renderer that shows different content based on user role
 * 
 * @example
 * <RoleBasedRenderer
 *   roles={{
 *     operator: <OperatorDashboard />,
 *     supervisor: <SupervisorDashboard />,
 *     admin: <AdminDashboard />
 *   }}
 *   fallback={<div>Please log in</div>}
 * />
 */
export const RoleBasedRenderer: React.FC<RoleBasedRendererProps> = ({
  roles,
  fallback = null,
  showMultiple = false,
}) => {
  const { user } = usePermissions();

  if (!user) {
    return <>{fallback}</>;
  }

  const content = roles[user.role];
  
  if (showMultiple) {
    // Show content for all roles that match or are hierarchically lower
    const roleHierarchy: { [key: string]: number } = {
      operator: 1,
      supervisor: 2,
      management: 3,
      admin: 4,
    };

    const userRoleLevel = roleHierarchy[user.role] || 0;
    const matchingRoles = Object.keys(roles).filter(role => 
      roleHierarchy[role] <= userRoleLevel
    );

    return (
      <>
        {matchingRoles.map(role => (
          <React.Fragment key={role}>
            {roles[role]}
          </React.Fragment>
        ))}
      </>
    );
  }

  return content ? <>{content}</> : <>{fallback}</>;
};