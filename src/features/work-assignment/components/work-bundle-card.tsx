// Work Bundle Card Component
// Modern card component for displaying work bundle information

import React from 'react';
import {
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  TagIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/card';
import type { WorkBundle } from '../types';
import { WORK_PRIORITIES, ASSIGNMENT_STATUS } from '../types';

interface WorkBundleCardProps {
  bundle: WorkBundle;
  onView?: () => void;
  onEdit?: () => void;
  onAssign?: () => void;
  onViewProgress?: () => void;
  className?: string;
  showActions?: boolean;
}

export const WorkBundleCard: React.FC<WorkBundleCardProps> = ({
  bundle,
  onView,
  onEdit,
  onAssign,
  onViewProgress,
  className = '',
  showActions = true
}) => {
  const priorityConfig = WORK_PRIORITIES[bundle.priority];
  const statusConfig = ASSIGNMENT_STATUS[bundle.status as keyof typeof ASSIGNMENT_STATUS];
  
  // Calculate progress
  const progress = bundle.totalPieces > 0 
    ? (bundle.completedPieces / bundle.totalPieces) * 100 
    : 0;
  
  // Calculate days remaining
  const daysRemaining = Math.ceil(
    (new Date(bundle.targetCompletionDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  
  const isOverdue = daysRemaining < 0;
  const isUrgent = daysRemaining <= 2 || bundle.isUrgent;

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {bundle.bundleNumber}
            </h3>
            <p className="text-sm text-gray-500">Order: {bundle.orderNumber}</p>
          </div>
          {bundle.isUrgent && (
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge
            variant={priorityConfig.color as any}
            className="flex items-center space-x-1"
          >
            <span>{priorityConfig.icon}</span>
            <span className="hidden sm:inline">{priorityConfig.label}</span>
          </Badge>
          <Badge
            variant={statusConfig.color as any}
            className="flex items-center space-x-1"
          >
            <span>{statusConfig.icon}</span>
            <span className="hidden sm:inline">{statusConfig.label}</span>
          </Badge>
        </div>
      </div>

      {/* Garment Info */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-sm">
        <div>
          <p className="text-gray-500">Garment</p>
          <p className="font-medium text-gray-900">{bundle.garmentType}</p>
        </div>
        <div>
          <p className="text-gray-500">Size</p>
          <p className="font-medium text-gray-900">{bundle.garmentSize}</p>
        </div>
        <div>
          <p className="text-gray-500">Quantity</p>
          <p className="font-medium text-gray-900">{bundle.quantity} pcs</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className={`font-medium ${progress === 100 ? 'text-green-600' : 'text-gray-900'}`}>
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              progress === 100 
                ? 'bg-green-500' 
                : progress > 50 
                ? 'bg-blue-500' 
                : 'bg-yellow-500'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{bundle.completedPieces} completed</span>
          <span>{bundle.remainingPieces} remaining</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <UserGroupIcon className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Operators</p>
            <p className="text-sm font-medium text-gray-900">
              {bundle.assignedOperators.length}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ClockIcon className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Est. Hours</p>
            <p className="text-sm font-medium text-gray-900">
              {bundle.estimatedHours}h
            </p>
          </div>
        </div>

        {bundle.efficiency && (
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Efficiency</p>
              <p className={`text-sm font-medium ${
                bundle.efficiency > 0.8 ? 'text-green-600' : 
                bundle.efficiency > 0.6 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {Math.round(bundle.efficiency * 100)}%
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Due</p>
            <p className={`text-sm font-medium ${
              isOverdue ? 'text-red-600' : 
              isUrgent ? 'text-yellow-600' : 'text-gray-900'
            }`}>
              {isOverdue ? `${Math.abs(daysRemaining)}d ago` : 
               daysRemaining === 0 ? 'Today' : `${daysRemaining}d`}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-gray-500 mb-1">Start Date</p>
            <div className="flex items-center space-x-1">
              <CalendarDaysIcon className="h-3 w-3 text-gray-400" />
              <span className="text-gray-900">
                {new Date(bundle.targetStartDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Target Completion</p>
            <div className="flex items-center space-x-1">
              <CalendarDaysIcon className="h-3 w-3 text-gray-400" />
              <span className={`${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                {new Date(bundle.targetCompletionDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {bundle.actualStartDate && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-gray-500 text-xs mb-1">Actual Progress</p>
            <div className="flex items-center space-x-1">
              <CheckCircleIcon className="h-3 w-3 text-green-500" />
              <span className="text-xs text-gray-900">
                Started: {new Date(bundle.actualStartDate).toLocaleDateString()}
              </span>
              {bundle.actualCompletionDate && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-xs text-gray-900">
                    Completed: {new Date(bundle.actualCompletionDate).toLocaleDateString()}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Work Items Summary */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Work Items</span>
          <span className="text-gray-500">{bundle.workItems.length} items</span>
        </div>
        
        {bundle.workItems.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {bundle.workItems.slice(0, 3).map((item, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs"
              >
                {item.operation}
              </Badge>
            ))}
            {bundle.workItems.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{bundle.workItems.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Notes */}
      {bundle.notes && (
        <div className="mb-4 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
          <p className="text-sm text-gray-700">{bundle.notes}</p>
        </div>
      )}

      {/* Actions */}
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
            
            {bundle.status !== 'completed' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
              >
                Edit
              </Button>
            )}
          </div>

          <div className="flex space-x-2">
            {bundle.status === 'pending' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAssign}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Assign Work
              </Button>
            )}
            
            {bundle.status === 'in_progress' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewProgress}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                View Progress
              </Button>
            )}
            
            {bundle.status === 'completed' && (
              <div className="flex items-center space-x-1 text-green-600">
                <CheckCircleIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Completed</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quality/Issues Indicator */}
      {bundle.qualityScore && bundle.qualityScore < 0.8 && (
        <div className="mt-2 flex items-center space-x-2 text-orange-600">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <span className="text-sm">Quality attention needed</span>
        </div>
      )}
    </Card>
  );
};