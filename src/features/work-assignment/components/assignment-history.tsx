// Assignment History Component
// Comprehensive tracking and visualization of assignment history

import React, { useState, useMemo } from 'react';
import {
  ClockIcon,
  UserIcon,
  ChartBarIcon,
  DocumentTextIcon,
  FunnelIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { EmptyState } from '@/shared/components/empty-state';
import { 
  WorkAssignment, 
  AssignmentFilters, 
  ASSIGNMENT_STATUS,
  WorkSession 
} from '../types';

interface AssignmentHistoryProps {
  operatorId?: string;
  bundleId?: string;
  workItemId?: string;
  onViewAssignment?: (assignmentId: string) => void;
  onViewOperator?: (operatorId: string) => void;
  className?: string;
}

interface AssignmentHistoryEntry {
  id: string;
  assignmentId: string;
  timestamp: Date;
  action: 'assigned' | 'started' | 'paused' | 'resumed' | 'completed' | 'cancelled' | 'reassigned';
  actorId: string;
  actorName: string;
  actorRole: 'operator' | 'supervisor' | 'system';
  details: {
    bundleNumber: string;
    operatorName: string;
    operation: string;
    machineType: string;
    previousOperator?: string;
    reason?: string;
    efficiency?: number;
    qualityScore?: number;
    piecesCompleted?: number;
    notes?: string;
  };
  metadata: {
    duration?: number; // for completed assignments
    issues?: string[];
    earnings?: number;
  };
}

export const AssignmentHistory: React.FC<AssignmentHistoryProps> = ({
  operatorId,
  bundleId,
  workItemId,
  onViewAssignment,
  onViewOperator,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - in real implementation, this would come from API
  const mockHistoryData: AssignmentHistoryEntry[] = [
    {
      id: '1',
      assignmentId: 'assign_001',
      timestamp: new Date('2024-01-15T09:00:00'),
      action: 'assigned',
      actorId: 'sup_001',
      actorName: 'John Supervisor',
      actorRole: 'supervisor',
      details: {
        bundleNumber: 'BDL-2024-001',
        operatorName: 'Maya Sharma',
        operation: 'Side Seam Stitching',
        machineType: 'sewing',
        reason: 'Skill match and availability'
      },
      metadata: {}
    },
    {
      id: '2',
      assignmentId: 'assign_001',
      timestamp: new Date('2024-01-15T09:15:00'),
      action: 'started',
      actorId: 'op_001',
      actorName: 'Maya Sharma',
      actorRole: 'operator',
      details: {
        bundleNumber: 'BDL-2024-001',
        operatorName: 'Maya Sharma',
        operation: 'Side Seam Stitching',
        machineType: 'sewing'
      },
      metadata: {}
    },
    {
      id: '3',
      assignmentId: 'assign_001',
      timestamp: new Date('2024-01-15T11:30:00'),
      action: 'paused',
      actorId: 'op_001',
      actorName: 'Maya Sharma',
      actorRole: 'operator',
      details: {
        bundleNumber: 'BDL-2024-001',
        operatorName: 'Maya Sharma',
        operation: 'Side Seam Stitching',
        machineType: 'sewing',
        reason: 'Lunch break'
      },
      metadata: {}
    },
    {
      id: '4',
      assignmentId: 'assign_001',
      timestamp: new Date('2024-01-15T12:30:00'),
      action: 'resumed',
      actorId: 'op_001',
      actorName: 'Maya Sharma',
      actorRole: 'operator',
      details: {
        bundleNumber: 'BDL-2024-001',
        operatorName: 'Maya Sharma',
        operation: 'Side Seam Stitching',
        machineType: 'sewing'
      },
      metadata: {}
    },
    {
      id: '5',
      assignmentId: 'assign_001',
      timestamp: new Date('2024-01-15T16:45:00'),
      action: 'completed',
      actorId: 'op_001',
      actorName: 'Maya Sharma',
      actorRole: 'operator',
      details: {
        bundleNumber: 'BDL-2024-001',
        operatorName: 'Maya Sharma',
        operation: 'Side Seam Stitching',
        machineType: 'sewing',
        efficiency: 0.89,
        qualityScore: 0.94,
        piecesCompleted: 45,
        notes: 'Completed successfully with high quality'
      },
      metadata: {
        duration: 450, // 7.5 hours in minutes
        earnings: 675,
        issues: []
      }
    },
    {
      id: '6',
      assignmentId: 'assign_002',
      timestamp: new Date('2024-01-14T10:00:00'),
      action: 'reassigned',
      actorId: 'sup_001',
      actorName: 'John Supervisor',
      actorRole: 'supervisor',
      details: {
        bundleNumber: 'BDL-2024-002',
        operatorName: 'Ram Thapa',
        operation: 'Button Hole',
        machineType: 'sewing',
        previousOperator: 'Sita Devi',
        reason: 'Original operator unavailable due to training'
      },
      metadata: {}
    }
  ];

  // Filter history data
  const filteredHistory = useMemo(() => {
    let filtered = mockHistoryData;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.details.bundleNumber.toLowerCase().includes(term) ||
        entry.details.operatorName.toLowerCase().includes(term) ||
        entry.details.operation.toLowerCase().includes(term) ||
        entry.actorName.toLowerCase().includes(term)
      );
    }

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(entry => entry.action === actionFilter);
    }

    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(entry => 
        entry.timestamp >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(entry => 
        entry.timestamp <= new Date(dateRange.end)
      );
    }

    // Context filters
    if (operatorId) {
      filtered = filtered.filter(entry => 
        entry.actorId === operatorId || entry.details.operatorName.includes('') // Would match operator ID
      );
    }

    if (bundleId) {
      filtered = filtered.filter(entry => 
        entry.details.bundleNumber.includes('') // Would match bundle ID
      );
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [mockHistoryData, searchTerm, actionFilter, dateRange, operatorId, bundleId]);

  // Get action icon and color
  const getActionConfig = (action: string) => {
    const configs = {
      assigned: { icon: UserIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
      started: { icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-100' },
      paused: { icon: ClockIcon, color: 'text-yellow-600', bg: 'bg-yellow-100' },
      resumed: { icon: ArrowPathIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
      completed: { icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-100' },
      cancelled: { icon: XCircleIcon, color: 'text-red-600', bg: 'bg-red-100' },
      reassigned: { icon: ArrowPathIcon, color: 'text-orange-600', bg: 'bg-orange-100' }
    };
    return configs[action as keyof typeof configs] || configs.assigned;
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Assignment History</h2>
          <p className="text-gray-600">
            {operatorId ? 'Operator assignment history' : 
             bundleId ? 'Bundle assignment history' : 
             'Complete assignment history'}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => window.location.reload()}
          className="flex items-center space-x-2"
        >
          <ArrowPathIcon className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by bundle, operator, or operation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
            {(actionFilter !== 'all' || dateRange.start || dateRange.end) && (
              <Badge variant="primary" className="ml-1">
                Active
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Action Type
                </label>
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Actions</option>
                  <option value="assigned">Assigned</option>
                  <option value="started">Started</option>
                  <option value="paused">Paused</option>
                  <option value="resumed">Resumed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="reassigned">Reassigned</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActionFilter('all');
                  setDateRange({ start: '', end: '' });
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* History Timeline */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredHistory.length === 0 ? (
          <EmptyState
            icon={DocumentTextIcon}
            title="No history found"
            description={
              searchTerm || actionFilter !== 'all' || dateRange.start || dateRange.end
                ? "Try adjusting your filters to see more history"
                : "Assignment history will appear here as work is assigned and completed"
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((entry, index) => {
              const actionConfig = getActionConfig(entry.action);
              const Icon = actionConfig.icon;
              const isLast = index === filteredHistory.length - 1;

              return (
                <div key={entry.id} className="flex">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`p-2 rounded-full ${actionConfig.bg}`}>
                      <Icon className={`h-4 w-4 ${actionConfig.color}`} />
                    </div>
                    {!isLast && (
                      <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                    )}
                  </div>

                  {/* Content */}
                  <Card className="ml-4 p-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900 capitalize">
                            {entry.action.replace('_', ' ')}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {entry.actorRole}
                          </Badge>
                        </div>

                        {/* Details */}
                        <div className="text-sm text-gray-700 mb-3">
                          <span className="font-medium">{entry.details.bundleNumber}</span>
                          {' → '}
                          <span className="font-medium">{entry.details.operatorName}</span>
                          {' • '}
                          <span>{entry.details.operation}</span>
                          {' • '}
                          <span className="text-gray-500">{entry.details.machineType}</span>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-2">
                          {entry.details.reason && (
                            <div className="flex items-start space-x-2 text-sm">
                              <DocumentTextIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600">{entry.details.reason}</span>
                            </div>
                          )}

                          {entry.details.previousOperator && (
                            <div className="flex items-center space-x-2 text-sm">
                              <ArrowPathIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">
                                Reassigned from {entry.details.previousOperator}
                              </span>
                            </div>
                          )}

                          {entry.details.notes && (
                            <div className="flex items-start space-x-2 text-sm">
                              <DocumentTextIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-600">{entry.details.notes}</span>
                            </div>
                          )}

                          {/* Performance metrics for completed assignments */}
                          {entry.action === 'completed' && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 p-3 bg-gray-50 rounded-lg">
                              {entry.details.efficiency && (
                                <div>
                                  <p className="text-xs text-gray-500">Efficiency</p>
                                  <p className={`text-sm font-medium ${
                                    entry.details.efficiency > 0.8 ? 'text-green-600' : 
                                    entry.details.efficiency > 0.6 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {Math.round(entry.details.efficiency * 100)}%
                                  </p>
                                </div>
                              )}

                              {entry.details.qualityScore && (
                                <div>
                                  <p className="text-xs text-gray-500">Quality</p>
                                  <p className={`text-sm font-medium ${
                                    entry.details.qualityScore > 0.9 ? 'text-green-600' : 
                                    entry.details.qualityScore > 0.8 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {Math.round(entry.details.qualityScore * 100)}%
                                  </p>
                                </div>
                              )}

                              {entry.details.piecesCompleted && (
                                <div>
                                  <p className="text-xs text-gray-500">Pieces</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {entry.details.piecesCompleted}
                                  </p>
                                </div>
                              )}

                              {entry.metadata.earnings && (
                                <div>
                                  <p className="text-xs text-gray-500">Earnings</p>
                                  <p className="text-sm font-medium text-green-600">
                                    ₹{entry.metadata.earnings.toLocaleString()}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {entry.metadata.duration && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <ClockIcon className="h-4 w-4 text-gray-400" />
                              <span>Duration: {formatDuration(entry.metadata.duration)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions and timestamp */}
                      <div className="flex flex-col items-end space-y-2 ml-4">
                        <div className="text-xs text-gray-500">
                          {entry.timestamp.toLocaleDateString()} {entry.timestamp.toLocaleTimeString()}
                        </div>
                        
                        <div className="flex space-x-1">
                          {onViewAssignment && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewAssignment(entry.assignmentId)}
                              className="text-xs px-2 py-1 h-auto text-blue-600 hover:bg-blue-50"
                            >
                              View Assignment
                            </Button>
                          )}
                          
                          {onViewOperator && entry.actorRole === 'operator' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewOperator(entry.actorId)}
                              className="text-xs px-2 py-1 h-auto text-green-600 hover:bg-green-50"
                            >
                              View Operator
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};