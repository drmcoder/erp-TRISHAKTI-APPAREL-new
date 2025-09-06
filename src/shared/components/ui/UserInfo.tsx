import React from 'react';
import { User, Shield, Clock, MapPin } from 'lucide-react';
import { Badge, Text, Stack, Flex } from '@/shared/components/ui';
import { usePermissions } from '@/app/hooks/usePermissions';
import { cn } from '@/shared/utils';

interface UserInfoProps {
  showPermissions?: boolean;
  showLastLogin?: boolean;
  showDepartment?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * User information display component
 */
export const UserInfo: React.FC<UserInfoProps> = ({
  showPermissions = false,
  showLastLogin = false,
  showDepartment = false,
  compact = false,
  className,
}) => {
  const { user, getUserPermissions } = usePermissions();

  if (!user) {
    return (
      <div className={cn('text-center py-4', className)}>
        <Text color="muted">Not authenticated</Text>
      </div>
    );
  }

  const roleColors = {
    operator: 'blue',
    supervisor: 'green', 
    management: 'purple',
    admin: 'red',
  } as const;

  const userPermissions = showPermissions ? getUserPermissions() : [];

  if (compact) {
    return (
      <Flex align="center" gap={2} className={className}>
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-primary-600" />
        </div>
        <div className="min-w-0 flex-1">
          <Text size="sm" weight="medium" className="truncate">
            {user.name}
          </Text>
          <Text size="xs" color="muted" className="capitalize">
            {user.role}
          </Text>
        </div>
        <Badge 
          size="sm" 
          variant={roleColors[user.role] || 'gray'}
        >
          {user.role}
        </Badge>
      </Flex>
    );
  }

  return (
    <div className={cn('p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg', className)}>
      <Stack spacing={3}>
        {/* User basic info */}
        <Flex align="center" gap={3}>
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <Text size="lg" weight="bold" className="text-secondary-900 dark:text-secondary-100">
              {user.name}
            </Text>
            <Text size="sm" color="muted">
              @{user.username}
            </Text>
          </div>
          <Badge 
            size="md" 
            variant={roleColors[user.role] || 'gray'}
            className="capitalize"
          >
            <Shield className="w-3 h-3 mr-1" />
            {user.role}
          </Badge>
        </Flex>

        {/* Email */}
        {user.email && (
          <Flex align="center" gap={2}>
            <Text size="sm" color="muted">
              {user.email}
            </Text>
          </Flex>
        )}

        {/* Department */}
        {showDepartment && user.department && (
          <Flex align="center" gap={2}>
            <MapPin className="w-4 h-4 text-secondary-500" />
            <Text size="sm">
              Department: {user.department}
            </Text>
          </Flex>
        )}

        {/* Last login */}
        {showLastLogin && user.lastLogin && (
          <Flex align="center" gap={2}>
            <Clock className="w-4 h-4 text-secondary-500" />
            <Text size="sm" color="muted">
              Last login: {new Date(user.lastLogin).toLocaleString()}
            </Text>
          </Flex>
        )}

        {/* Permissions */}
        {showPermissions && userPermissions.length > 0 && (
          <div>
            <Text size="sm" weight="medium" className="mb-2">
              Permissions ({userPermissions.length})
            </Text>
            <div className="flex flex-wrap gap-1">
              {userPermissions.slice(0, 6).map((permission) => (
                <Badge key={permission} size="sm" variant="outline">
                  {permission}
                </Badge>
              ))}
              {userPermissions.length > 6 && (
                <Badge size="sm" variant="secondary">
                  +{userPermissions.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div>
            <Text size="sm" weight="medium" className="mb-2">
              Skills
            </Text>
            <div className="flex flex-wrap gap-1">
              {user.skills.map((skill) => (
                <Badge key={skill} size="sm" variant="blue">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Machine type for operators */}
        {user.role === 'operator' && user.machineType && (
          <Flex align="center" gap={2}>
            <Text size="sm">
              Machine: <span className="font-medium">{user.machineType}</span>
            </Text>
          </Flex>
        )}

        {/* Status */}
        <Flex align="center" justify="between">
          <Badge 
            size="sm" 
            variant={user.active ? 'green' : 'red'}
          >
            {user.active ? 'Active' : 'Inactive'}
          </Badge>
          <Text size="xs" color="muted">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        </Flex>
      </Stack>
    </div>
  );
};