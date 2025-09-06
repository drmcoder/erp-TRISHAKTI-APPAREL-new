// Assignment Dashboard Component
// Comprehensive dashboard for managing work assignments with drag-and-drop interface

import React, { useState, useMemo } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { LoadingSpinner } from '@/shared/components/loading-spinner';
import { EmptyState } from '@/shared/components/empty-state';
import { WorkBundleCard } from './work-bundle-card';
import { AssignmentColumn } from './assignment-column';
import { BulkAssignmentModal } from './bulk-assignment-modal';
import { 
  useWorkBundles, 
  useWorkAssignments, 
  useAssignmentStatistics,
  useOperators 
} from '../hooks/use-work-assignments';
import { 
  WorkBundle, 
  WorkAssignmentSummary, 
  AssignmentFilters,
  ASSIGNMENT_STATUS 
} from '../types';

interface AssignmentDashboardProps {
  onCreateBundle?: () => void;
  onViewBundle?: (bundleId: string) => void;
  onEditBundle?: (bundleId: string) => void;
  onAssignWork?: (bundleId: string) => void;
  onViewAssignment?: (assignmentId: string) => void;
}

export const AssignmentDashboard: React.FC<AssignmentDashboardProps> = ({
  onCreateBundle,
  onViewBundle,
  onEditBundle,
  onAssignWork,
  onViewAssignment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [draggedItem, setDraggedItem] = useState<WorkAssignmentSummary | null>(null);
  const [showBulkAssignment, setShowBulkAssignment] = useState(false);
  const [selectedBundles, setSelectedBundles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Build filters
  const filters = useMemo<AssignmentFilters>(() => ({
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    operatorId: operatorFilter !== 'all' ? operatorFilter : undefined
  }), [searchTerm, statusFilter, priorityFilter, operatorFilter]);

  // Fetch data
  const { 
    data: bundlesResult, 
    isLoading: bundlesLoading, 
    error: bundlesError 
  } = useWorkBundles(filters);

  const { 
    data: assignmentsResult, 
    isLoading: assignmentsLoading 
  } = useWorkAssignments(filters);

  const { data: statisticsResult } = useAssignmentStatistics(filters);
  const { data: operatorsResult } = useOperators();

  const bundles = bundlesResult?.success ? bundlesResult.data?.items || [] : [];
  const assignments = assignmentsResult?.success ? assignmentsResult.data?.items || [] : [];
  const statistics = statisticsResult?.data;
  const operators = operatorsResult?.success ? operatorsResult.data || [] : [];

  // Group assignments by status for Kanban view
  const assignmentColumns = useMemo(() => {
    const columns = {
      pending: assignments.filter(a => a.status === 'pending'),
      assigned: assignments.filter(a => a.status === 'assigned'),
      started: assignments.filter(a => a.status === 'started'),
      paused: assignments.filter(a => a.status === 'paused'),
      completed: assignments.filter(a => a.status === 'completed')
    };
    return columns;
  }, [assignments]);

  // Handle drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    const assignment = assignments.find(a => a.id === event.active.id);
    setDraggedItem(assignment || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setDraggedItem(null);
      return;
    }

    const newStatus = over.id as string;
    const assignmentId = active.id as string;
    
    // Update assignment status
    // This would call an API to update the assignment status
    console.log(`Moving assignment ${assignmentId} to ${newStatus}`);
    
    setDraggedItem(null);
  };

  // Handle bulk selection
  const toggleBundleSelection = (bundleId: string) => {
    setSelectedBundles(prev => 
      prev.includes(bundleId) 
        ? prev.filter(id => id !== bundleId)
        : [...prev, bundleId]
    );
  };

  const selectAllBundles = () => {
    setSelectedBundles(bundles.map(b => b.id!));
  };

  const clearSelection = () => {
    setSelectedBundles([]);
  };

  if (bundlesLoading || assignmentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (bundlesError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Failed to load work assignments</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work Assignments</h1>
          <p className="text-gray-600">Manage work bundles and operator assignments</p>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
          >
            {viewMode === 'kanban' ? 'List View' : 'Kanban View'}
          </Button>
          
          {selectedBundles.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowBulkAssignment(true)}
              className="text-blue-600 border-blue-600"
            >
              Bulk Assign ({selectedBundles.length})
            </Button>
          )}
          
          {onCreateBundle && (
            <Button onClick={onCreateBundle} className="flex items-center space-x-2">
              <PlusIcon className="h-4 w-4" />
              <span>Create Bundle</span>
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.totalAssignments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{statistics.activeAssignments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Efficiency</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.round(statistics.averageEfficiency * 100)}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">On-Time %</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(statistics.onTimeCompletion)}%
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search bundles, orders, or operators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
            {(statusFilter !== 'all' || priorityFilter !== 'all' || operatorFilter !== 'all') && (
              <Badge variant="primary" className="ml-1">
                {[statusFilter, priorityFilter, operatorFilter].filter(f => f !== 'all').length}
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  {Object.entries(ASSIGNMENT_STATUS).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">🚨 Urgent</option>
                  <option value="high">⬆️ High</option>
                  <option value="medium">➡️ Medium</option>
                  <option value="low">⬇️ Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operator
                </label>
                <select
                  value={operatorFilter}
                  onChange={(e) => setOperatorFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Operators</option>
                  {operators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.name} ({operator.employeeId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    setPriorityFilter('all');
                    setOperatorFilter('all');
                    setSearchTerm('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Bulk Selection Controls */}
      {selectedBundles.length > 0 && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <span className="text-blue-700 font-medium">
              {selectedBundles.length} bundle(s) selected
            </span>
            <Button variant="ghost" size="sm" onClick={selectAllBundles}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear Selection
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkAssignment(true)}
            >
              Bulk Assign
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'kanban' ? (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {Object.entries(assignmentColumns).map(([status, columnAssignments]) => (
              <AssignmentColumn
                key={status}
                status={status}
                assignments={columnAssignments}
                onViewAssignment={onViewAssignment}
              />
            ))}
          </div>
          
          <DragOverlay>
            {draggedItem && (
              <div className="rotate-3 opacity-90">
                {/* Assignment card for drag overlay */}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        <div>
          {bundles.length === 0 ? (
            <EmptyState
              icon={ChartBarIcon}
              title="No work bundles found"
              description={
                searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? "Try adjusting your filters to see more bundles"
                  : "Get started by creating your first work bundle"
              }
              action={
                onCreateBundle ? (
                  <Button onClick={onCreateBundle}>
                    Create First Bundle
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bundles.map((bundle) => (
                <WorkBundleCard
                  key={bundle.id}
                  bundle={bundle}
                  onView={() => onViewBundle?.(bundle.id!)}
                  onEdit={() => onEditBundle?.(bundle.id!)}
                  onAssign={() => onAssignWork?.(bundle.id!)}
                  className={
                    selectedBundles.includes(bundle.id!) 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'cursor-pointer hover:bg-gray-50'
                  }
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bulk Assignment Modal */}
      {showBulkAssignment && (
        <BulkAssignmentModal
          selectedBundles={selectedBundles}
          onClose={() => setShowBulkAssignment(false)}
          onComplete={() => {
            setShowBulkAssignment(false);
            clearSelection();
          }}
        />
      )}
    </div>
  );
};