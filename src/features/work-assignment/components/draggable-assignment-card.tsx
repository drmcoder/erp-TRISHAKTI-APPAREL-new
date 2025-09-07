// Draggable Assignment Card Component
// Individual assignment card with drag-and-drop functionality

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  UserIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { WorkAssignmentSummary, WORK_PRIORITIES } from '../types';

interface DraggableAssignmentCardProps {
  assignment: WorkAssignmentSummary;
  onView?: () => void;
}

export const DraggableAssignmentCard: React.FC<DraggableAssignmentCardProps> = ({
  assignment,
  onView
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: assignment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const priorityConfig = WORK_PRIORITIES[assignment.priority as keyof typeof WORK_PRIORITIES];
  
  // Calculate urgency indicators
  const targetDate = new Date(assignment.targetCompletion);
  const daysRemaining = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0;
  const isUrgent = daysRemaining <= 1 || assignment.priority === 'urgent';

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-gray-900 text-sm truncate max-w-[120px]">
            {assignment.bundleNumber}
          </h4>
          {isUrgent && (
            <ExclamationTriangleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
          )}
        </div>
        
        <Badge
          variant={priorityConfig.color as any}
          className="text-xs"
        >
          {priorityConfig.icon}
        </Badge>
      </div>

      {/* Operator Info */}
      <div className="flex items-center space-x-2 mb-3">
        <UserIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {assignment.operatorName}
          </p>
          <p className="text-xs text-gray-500">{assignment.operatorId}</p>
        </div>
      </div>

      {/* Work Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2">
          <CpuChipIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-600 truncate">{assignment.machineType}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600 truncate">{assignment.operation}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-600">Progress</span>
          <span className={`font-medium ${
            assignment.progress === 100 ? 'text-green-600' : 'text-gray-900'
          }`}>
            {Math.round(assignment.progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${
              assignment.progress === 100 
                ? 'bg-green-500' 
                : assignment.progress > 50 
                ? 'bg-blue-500' 
                : 'bg-yellow-500'
            }`}
            style={{ width: `${assignment.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="flex items-center space-x-1">
          <ChartBarIcon className="h-3 w-3 text-gray-400" />
          <span className="text-gray-600">Eff:</span>
          <span className={`font-medium ${
            assignment.efficiency > 0.8 ? 'text-green-600' : 
            assignment.efficiency > 0.6 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {Math.round(assignment.efficiency * 100)}%
          </span>
        </div>
        
        {assignment.qualityScore && (
          <div className="flex items-center space-x-1">
            <span className="text-gray-600">Qty:</span>
            <span className={`font-medium ${
              assignment.qualityScore > 0.9 ? 'text-green-600' : 
              assignment.qualityScore > 0.8 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {Math.round(assignment.qualityScore * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="flex items-center justify-between text-xs mb-3">
        <div className="flex items-center space-x-1">
          <ClockIcon className="h-3 w-3 text-gray-400" />
          <span className={`${
            isOverdue ? 'text-red-600 font-medium' : 
            isUrgent ? 'text-yellow-600 font-medium' : 'text-gray-600'
          }`}>
            {isOverdue ? `${Math.abs(daysRemaining)}d ago` : 
             daysRemaining === 0 ? 'Today' : `${daysRemaining}d`}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <CurrencyRupeeIcon className="h-3 w-3 text-gray-400" />
          <span className="text-gray-900 font-medium">
            ₹{assignment.estimatedEarnings.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Order Info */}
      <div className="text-xs text-gray-500 mb-3 truncate">
        Order: {assignment.orderNumber}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          {new Date(assignment.assignedDate).toLocaleDateString()}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onView?.();
          }}
          className="text-xs px-2 py-1 h-auto text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          View
        </Button>
      </div>

      {/* Status Indicators */}
      {isOverdue && (
        <div className="mt-2 flex items-center space-x-1 text-red-600">
          <ExclamationTriangleIcon className="h-3 w-3" />
          <span className="text-xs font-medium">Overdue</span>
        </div>
      )}
      
      {assignment.progress === 100 && assignment.status !== 'completed' && (
        <div className="mt-2 flex items-center space-x-1 text-green-600">
          <span className="text-xs font-medium">Ready for review</span>
        </div>
      )}
    </Card>
  );
};