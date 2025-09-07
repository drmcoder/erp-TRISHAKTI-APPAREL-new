// Mobile Work Assignment Dashboard
// Touch-optimized dashboard with swipe actions and mobile-first design

import React, { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  Plus,
  Filter,
  Search,
  SortAsc,
  MoreVertical,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  ArrowRight,
  Briefcase,
  Users,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Badge } from '@/shared/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TouchButton, 
  SwipeableCard, 
  ActionSheet, 
  PullToRefresh,
  TouchNumberInput 
} from '@/components/ui/touch-friendly-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { WorkItem, WorkAssignment, OperatorSummary } from '../types';
import { isMobile, isTablet } from '@/config/ui-config';

interface MobileWorkAssignmentDashboardProps {
  operatorId?: string;
  onCreateAssignment?: (workItemId: string, operatorId: string) => void;
  onEditAssignment?: (assignmentId: string) => void;
  onDeleteAssignment?: (assignmentId: string) => void;
  onViewDetails?: (assignmentId: string) => void;
}

interface FilterState {
  status: string;
  priority: string;
  operation: string;
  search: string;
}

export const MobileWorkAssignmentDashboard: React.FC<MobileWorkAssignmentDashboardProps> = ({
  operatorId,
  onCreateAssignment,
  onEditAssignment,
  onDeleteAssignment,
  onViewDetails
}) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    priority: 'all',
    operation: 'all',
    search: ''
  });
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get work assignments
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['mobileAssignments', operatorId, filters],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return [
        {
          id: '1',
          workItemId: 'work1',
          operatorId: 'op1',
          status: 'assigned',
          workItem: {
            id: 'work1',
            bundleNumber: 'B001',
            operation: 'Cutting',
            targetQuantity: 100,
            completedQuantity: 25,
            priority: 'high',
            estimatedDuration: 120,
            deadline: new Date(Date.now() + 86400000)
          }
        },
        {
          id: '2',
          workItemId: 'work2',
          operatorId: 'op1',
          status: 'started',
          workItem: {
            id: 'work2',
            bundleNumber: 'B002',
            operation: 'Sewing',
            targetQuantity: 50,
            completedQuantity: 40,
            priority: 'medium',
            estimatedDuration: 90,
            deadline: new Date(Date.now() + 172800000)
          }
        }
      ] as (WorkAssignment & { workItem: WorkItem })[];
    }
  });

  // Get available operators for quick assignment
  const { data: operators = [] } = useQuery({
    queryKey: ['mobileOperators'],
    queryFn: async () => {
      return [
        { id: 'op1', name: 'John Doe', currentStatus: 'active', skillLevel: 'advanced' },
        { id: 'op2', name: 'Jane Smith', currentStatus: 'active', skillLevel: 'intermediate' }
      ] as OperatorSummary[];
    }
  });

  // Start/pause assignment mutation
  const toggleAssignmentMutation = useMutation({
    mutationFn: async ({ assignmentId, action }: { assignmentId: string; action: 'start' | 'pause' }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { assignmentId, action };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mobileAssignments']);
    }
  });

  // Filter assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const workItem = assignment.workItem;
      
      if (filters.status !== 'all' && assignment.status !== filters.status) return false;
      if (filters.priority !== 'all' && workItem.priority !== filters.priority) return false;
      if (filters.operation !== 'all' && workItem.operation !== filters.operation) return false;
      if (filters.search && !workItem.bundleNumber.toLowerCase().includes(filters.search.toLowerCase())) return false;
      
      return true;
    });
  }, [assignments, filters]);

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries(['mobileAssignments']);
    setRefreshing(false);
  }, [queryClient]);

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned': return Clock;
      case 'started': return Play;
      case 'paused': return Pause;
      case 'completed': return CheckCircle;
      default: return AlertCircle;
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = (completed: number, target: number) => {
    return Math.round((completed / target) * 100);
  };

  // Mobile-optimized assignment card
  const AssignmentCard = ({ assignment }: { assignment: WorkAssignment & { workItem: WorkItem } }) => {
    const { workItem } = assignment;
    const StatusIcon = getStatusIcon(assignment.status);
    const progressPercentage = getProgressPercentage(workItem.completedQuantity, workItem.targetQuantity);

    return (
      <SwipeableCard
        leftActions={[
          {
            label: assignment.status === 'started' ? 'Pause' : 'Start',
            icon: assignment.status === 'started' ? Pause : Play,
            color: assignment.status === 'started' ? 'orange' : 'green',
            action: () => toggleAssignmentMutation.mutate({
              assignmentId: assignment.id!,
              action: assignment.status === 'started' ? 'pause' : 'start'
            })
          }
        ]}
        rightActions={[
          {
            label: 'Edit',
            icon: Edit,
            color: 'blue',
            action: () => onEditAssignment?.(assignment.id!)
          },
          {
            label: 'Delete',
            icon: Trash2,
            color: 'red',
            action: () => onDeleteAssignment?.(assignment.id!)
          }
        ]}
        className="mb-3"
      >
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow duration-200"
          onClick={() => onViewDetails?.(assignment.id!)}
        >
          <CardContent className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusIcon className={cn(
                  "w-5 h-5",
                  assignment.status === 'started' && "text-green-600 animate-pulse",
                  assignment.status === 'paused' && "text-orange-600",
                  assignment.status === 'assigned' && "text-blue-600",
                  assignment.status === 'completed' && "text-green-600"
                )} />
                <h3 className="font-semibold text-base">{workItem.bundleNumber}</h3>
              </div>
              
              <Badge className={cn(
                "text-xs font-medium border",
                getPriorityColor(workItem.priority)
              )}>
                {workItem.priority}
              </Badge>
            </div>

            {/* Operation and Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Operation:</span>
                <span className="font-medium">{workItem.operation}</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress:</span>
                  <span className="font-medium">
                    {workItem.completedQuantity} / {workItem.targetQuantity} ({progressPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-300 rounded-full",
                      progressPercentage >= 90 ? "bg-green-500" :
                      progressPercentage >= 70 ? "bg-blue-500" :
                      progressPercentage >= 50 ? "bg-orange-500" : "bg-red-500"
                    )}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{workItem.estimatedDuration}min</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>Assigned</span>
                </div>
              </div>
              
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </SwipeableCard>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="px-4 py-3 space-y-3">
          {/* Title and Actions */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Work Assignments</h1>
            <div className="flex items-center gap-2">
              <TouchButton
                variant="outline"
                size="sm"
                icon={Filter}
                onClick={() => setShowFilters(!showFilters)}
                className={cn(showFilters && "bg-accent")}
              />
              <TouchButton
                variant="default"
                size="sm"
                icon={Plus}
                onClick={() => setSelectedItem(null)}
              >
                Assign
              </TouchButton>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search bundles..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 h-10 text-base" // Prevent iOS zoom
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="started">Started</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.priority}
                onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.operation}
                onValueChange={(value) => setFilters(prev => ({ ...prev, operation: value }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Operations</SelectItem>
                  <SelectItem value="cutting">Cutting</SelectItem>
                  <SelectItem value="sewing">Sewing</SelectItem>
                  <SelectItem value="finishing">Finishing</SelectItem>
                  <SelectItem value="embroidery">Embroidery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Assignment List */}
      <PullToRefresh onRefresh={handleRefresh} refreshing={refreshing}>
        <div className="p-4 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredAssignments.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredAssignments.filter(a => a.status === 'started').length}
                </div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </Card>
          </div>

          {/* Assignment Cards */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-2 bg-gray-200 rounded" />
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <Briefcase className="w-12 h-12 mx-auto mb-3" />
                <p className="text-lg font-medium">No assignments found</p>
                <p className="text-sm">Try adjusting your filters or create a new assignment</p>
              </div>
              <TouchButton
                variant="outline"
                className="mt-4"
                icon={Plus}
                onClick={() => setSelectedItem(null)}
              >
                Create Assignment
              </TouchButton>
            </div>
          ) : (
            <div className="space-y-0">
              {filteredAssignments.map(assignment => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* Action Sheet for additional options */}
      <ActionSheet
        open={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="Assignment Actions"
        actions={[
          { 
            label: 'Bulk Assign',
            icon: Users,
            action: () => console.log('Bulk assign')
          },
          { 
            label: 'Export Report',
            icon: ArrowRight,
            action: () => console.log('Export report')
          },
          { 
            label: 'Refresh Data',
            icon: RefreshCw,
            action: handleRefresh
          }
        ]}
      />
    </div>
  );
};