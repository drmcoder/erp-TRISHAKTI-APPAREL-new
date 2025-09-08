// Modern Operator Card Component (following REBUILD_BLUEPRINT design system)
import React from 'react';
import { 
  UserIcon, 
  CpuChipIcon, 
  BoltIcon,
  ClockIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import type { OperatorSummary } from '@/types/operator-types';
import { STATUS_CONFIG } from '@/types/operator-types';

interface OperatorCardProps {
  operator: OperatorSummary;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: () => void;
  showActions?: boolean; // Control visibility based on user role
  className?: string;
}

export const OperatorCard: React.FC<OperatorCardProps> = ({
  operator,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  showActions = true,
  className = ''
}) => {
  const statusConfig = STATUS_CONFIG[operator.currentStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.offline;
  
  // Generate avatar display
  const renderAvatar = () => {
    if (operator.avatar) {
      switch (operator.avatar.type) {
        case 'emoji':
          return (
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
              {operator.avatar.value}
            </div>
          );
        case 'photo':
          return (
            <img
              src={operator.avatar.value}
              alt={operator.name}
              className="h-12 w-12 rounded-full object-cover"
            />
          );
        case 'initials':
          return (
            <div 
              className="h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: operator.avatar.backgroundColor || '#3B82F6' }}
            >
              {operator.avatar.value}
            </div>
          );
      }
    }
    
    // Default avatar with initials
    const initials = operator.name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
      
    return (
      <div className="h-12 w-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold">
        {initials}
      </div>
    );
  };

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {renderAvatar()}
          <div>
            <h3 className="font-semibold text-gray-900">{operator.name}</h3>
            <p className="text-sm text-gray-500">ID: {operator.employeeId}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge
            variant={statusConfig.color as any}
            className="flex items-center space-x-1"
          >
            <span>{statusConfig.icon}</span>
            <span className="hidden sm:inline">{statusConfig.label}</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <CpuChipIcon className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Machine</p>
            <p className="text-sm font-medium text-gray-900">{operator.primaryMachine}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <BoltIcon className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Efficiency</p>
            <p className="text-sm font-medium text-gray-900">
              {Math.round(operator.efficiency * 100)}%
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <CheckBadgeIcon className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Quality</p>
            <p className="text-sm font-medium text-gray-900">
              {Math.round(operator.qualityScore * 100)}%
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ClockIcon className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Current Work</p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {operator.currentWork || 'None'}
            </p>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onView}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              View Details
            </Button>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete
              </Button>
            )}
          </div>

          {onStatusChange && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onStatusChange}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              Update Status
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};