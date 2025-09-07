// React Query hooks for Work Assignment system
// Following REBUILD_BLUEPRINT pattern with comprehensive data management

import { 
  useQuery, 
  useMutation, 
  useQueryClient
} from '@tanstack/react-query';
import type { 
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';
import { workAssignmentService } from '../services';
import type {
  WorkBundle,
  WorkItem,
  WorkAssignment,
  WorkAssignmentSummary,
  AssignmentRequest,
  AssignmentStatistics,
  CreateWorkBundleData,
  CreateWorkItemData,
  AssignWorkData,
  CompleteWorkData,
  AssignmentFilters,
  PaginatedResponse
} from '../types';

// Query keys factory
export const workAssignmentQueryKeys = {
  all: ['work-assignments'] as const,
  
  // Work Bundles
  bundles: () => [...workAssignmentQueryKeys.all, 'bundles'] as const,
  bundlesList: (filters: any) => [...workAssignmentQueryKeys.bundles(), 'list', { filters }] as const,
  bundleDetail: (id: string) => [...workAssignmentQueryKeys.bundles(), 'detail', id] as const,
  
  // Work Items
  workItems: () => [...workAssignmentQueryKeys.all, 'work-items'] as const,
  workItemsByBundle: (bundleId: string) => [...workAssignmentQueryKeys.workItems(), 'bundle', bundleId] as const,
  workItemDetail: (id: string) => [...workAssignmentQueryKeys.workItems(), 'detail', id] as const,
  
  // Assignments
  assignments: () => [...workAssignmentQueryKeys.all, 'assignments'] as const,
  assignmentsList: (filters: any) => [...workAssignmentQueryKeys.assignments(), 'list', { filters }] as const,
  assignmentDetail: (id: string) => [...workAssignmentQueryKeys.assignments(), 'detail', id] as const,
  operatorAssignments: (operatorId: string) => [...workAssignmentQueryKeys.assignments(), 'operator', operatorId] as const,
  
  // Statistics
  statistics: () => [...workAssignmentQueryKeys.all, 'statistics'] as const,
  assignmentStats: (filters: any) => [...workAssignmentQueryKeys.statistics(), 'assignments', { filters }] as const,
  
  // Requests
  requests: () => [...workAssignmentQueryKeys.all, 'requests'] as const,
  pendingRequests: () => [...workAssignmentQueryKeys.requests(), 'pending'] as const,
  operatorRequests: (operatorId: string) => [...workAssignmentQueryKeys.requests(), 'operator', operatorId] as const
};

// ==================== WORK BUNDLE HOOKS ====================

// Get work bundles with filtering
export function useWorkBundles(
  filters?: AssignmentFilters,
  options?: UseQueryOptions<PaginatedResponse<WorkBundle>>
) {
  return useQuery({
    queryKey: workAssignmentQueryKeys.bundlesList(filters),
    queryFn: () => workAssignmentService.getWorkBundles(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options
  });
}

// Get single work bundle
export function useWorkBundle(
  bundleId: string,
  options?: UseQueryOptions<WorkBundle>
) {
  return useQuery({
    queryKey: workAssignmentQueryKeys.bundleDetail(bundleId),
    queryFn: () => workAssignmentService.getWorkBundleById(bundleId),
    enabled: !!bundleId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    ...options
  });
}

// Create work bundle mutation
export function useCreateWorkBundle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateWorkBundleData) => workAssignmentService.createWorkBundle(data),
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate bundles list
        queryClient.invalidateQueries({ queryKey: workAssignmentQueryKeys.bundles() });
        
        // Add to cache
        queryClient.setQueryData(
          workAssignmentQueryKeys.bundleDetail(result.data!.id!),
          result.data
        );
      }
    },
    onError: (error) => {
      console.error('Failed to create work bundle:', error);
    }
  });
}

// Update work bundle mutation
export function useUpdateWorkBundle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkBundle> }) => 
      workAssignmentService.update(id, data, 'workBundles'),
    onMutate: async ({ id, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: workAssignmentQueryKeys.bundleDetail(id) });
      
      const previousBundle = queryClient.getQueryData(workAssignmentQueryKeys.bundleDetail(id));
      
      queryClient.setQueryData(workAssignmentQueryKeys.bundleDetail(id), (old: any) => ({
        ...old,
        ...data
      }));
      
      return { previousBundle };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousBundle) {
        queryClient.setQueryData(workAssignmentQueryKeys.bundleDetail(id), context.previousBundle);
      }
    },
    onSuccess: (_, { id }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: workAssignmentQueryKeys.bundleDetail(id) });
      queryClient.invalidateQueries({ queryKey: workAssignmentQueryKeys.bundles() });
    }
  });
}

// ==================== WORK ITEM HOOKS ====================

// Get work items by bundle
export function useWorkItemsByBundle(
  bundleId: string,
  options?: UseQueryOptions<WorkItem[]>
) {
  return useQuery({
    queryKey: workAssignmentQueryKeys.workItemsByBundle(bundleId),
    queryFn: () => workAssignmentService.getWorkItemsByBundle(bundleId),
    enabled: !!bundleId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options
  });
}

// Create work item mutation
export function useCreateWorkItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateWorkItemData) => workAssignmentService.createWorkItem(data),
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate work items for the bundle
        queryClient.invalidateQueries({ 
          queryKey: workAssignmentQueryKeys.workItemsByBundle(variables.bundleId) 
        });
        
        // Invalidate bundle detail to update work items count
        queryClient.invalidateQueries({ 
          queryKey: workAssignmentQueryKeys.bundleDetail(variables.bundleId) 
        });
      }
    }
  });
}

// ==================== ASSIGNMENT HOOKS ====================

// Get assignments with filtering
export function useWorkAssignments(
  filters?: AssignmentFilters,
  options?: UseQueryOptions<PaginatedResponse<WorkAssignmentSummary>>
) {
  return useQuery({
    queryKey: workAssignmentQueryKeys.assignmentsList(filters),
    queryFn: () => workAssignmentService.getAssignments(filters),
    staleTime: 30 * 1000, // 30 seconds (assignments change frequently)
    refetchInterval: 60 * 1000, // Refresh every minute
    ...options
  });
}

// Get assignments for specific operator
export function useOperatorAssignments(
  operatorId: string,
  options?: UseQueryOptions<PaginatedResponse<WorkAssignmentSummary>>
) {
  return useQuery({
    queryKey: workAssignmentQueryKeys.operatorAssignments(operatorId),
    queryFn: () => workAssignmentService.getAssignments({ operatorId }),
    enabled: !!operatorId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
    ...options
  });
}

// Assign work mutation
export function useAssignWork() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AssignWorkData) => workAssignmentService.assignWork(data),
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate assignments list
        queryClient.invalidateQueries({ queryKey: workAssignmentQueryKeys.assignments() });
        
        // Invalidate operator assignments
        queryClient.invalidateQueries({ 
          queryKey: workAssignmentQueryKeys.operatorAssignments(variables.operatorId) 
        });
        
        // Invalidate work items for the bundle
        const assignment = result.data!;
        queryClient.invalidateQueries({ 
          queryKey: workAssignmentQueryKeys.workItemsByBundle(assignment.bundleId) 
        });
        
        // Invalidate statistics
        queryClient.invalidateQueries({ queryKey: workAssignmentQueryKeys.statistics() });
      }
    },
    onError: (error) => {
      console.error('Failed to assign work:', error);
    }
  });
}

// Complete assignment mutation
export function useCompleteAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CompleteWorkData) => workAssignmentService.completeAssignment(data),
    onSuccess: (result, variables) => {
      if (result.success) {
        const assignment = result.data!;
        
        // Update assignment in cache
        queryClient.setQueryData(
          workAssignmentQueryKeys.assignmentDetail(variables.assignmentId),
          assignment
        );
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: workAssignmentQueryKeys.assignments() });
        queryClient.invalidateQueries({ 
          queryKey: workAssignmentQueryKeys.operatorAssignments(assignment.operatorId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: workAssignmentQueryKeys.workItemsByBundle(assignment.bundleId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: workAssignmentQueryKeys.bundleDetail(assignment.bundleId) 
        });
        queryClient.invalidateQueries({ queryKey: workAssignmentQueryKeys.statistics() });
        
        // Also invalidate operator queries
        queryClient.invalidateQueries({ queryKey: ['operators'] });
      }
    }
  });
}

// Bulk assign work mutation
export function useBulkAssignWork() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assignments: AssignWorkData[]) => {
      const results = await Promise.allSettled(
        assignments.map(assignment => workAssignmentService.assignWork(assignment))
      );
      
      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;
      
      const failed = results.length - successful;
      
      return {
        success: successful > 0,
        data: { successful, failed, total: results.length },
        results
      };
    },
    onSuccess: () => {
      // Invalidate all assignment-related queries
      queryClient.invalidateQueries({ queryKey: workAssignmentQueryKeys.assignments() });
      queryClient.invalidateQueries({ queryKey: workAssignmentQueryKeys.workItems() });
      queryClient.invalidateQueries({ queryKey: workAssignmentQueryKeys.statistics() });
    }
  });
}

// ==================== ASSIGNMENT REQUEST HOOKS ====================

// Create assignment request (self-assignment)
export function useCreateAssignmentRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ workItemId, operatorId, reason }: {
      workItemId: string;
      operatorId: string;
      reason?: string;
    }) => workAssignmentService.createAssignmentRequest(workItemId, operatorId, reason),
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate requests queries
        queryClient.invalidateQueries({ queryKey: workAssignmentQueryKeys.requests() });
        queryClient.invalidateQueries({ 
          queryKey: workAssignmentQueryKeys.operatorRequests(variables.operatorId) 
        });
      }
    }
  });
}

// Get pending assignment requests
export function usePendingAssignmentRequests(
  options?: UseQueryOptions<AssignmentRequest[]>
) {
  return useQuery({
    queryKey: workAssignmentQueryKeys.pendingRequests(),
    queryFn: async () => {
      // This would be implemented in the service
      return { success: true, data: [] as AssignmentRequest[] };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
    ...options
  });
}

// ==================== STATISTICS HOOKS ====================

// Get assignment statistics
export function useAssignmentStatistics(
  filters?: AssignmentFilters,
  options?: UseQueryOptions<AssignmentStatistics>
) {
  return useQuery({
    queryKey: workAssignmentQueryKeys.assignmentStats(filters),
    queryFn: () => workAssignmentService.getAssignmentStatistics(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    ...options
  });
}

// ==================== REAL-TIME HOOKS ====================

// Real-time assignment updates
export function useRealTimeAssignments(operatorId?: string) {
  const queryClient = useQueryClient();
  
  // This would integrate with WebSocket or Firebase real-time database
  // For now, we'll use polling
  return useQuery({
    queryKey: operatorId 
      ? workAssignmentQueryKeys.operatorAssignments(operatorId)
      : workAssignmentQueryKeys.assignments(),
    queryFn: () => workAssignmentService.getAssignments(
      operatorId ? { operatorId } : undefined
    ),
    refetchInterval: 30 * 1000, // Poll every 30 seconds
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });
}

// ==================== UTILITY HOOKS ====================

// Available work items for assignment
export function useAvailableWorkItems(
  operatorId?: string,
  options?: UseQueryOptions<WorkItem[]>
) {
  return useQuery({
    queryKey: ['available-work-items', operatorId],
    queryFn: async () => {
      // This would fetch unassigned work items that match operator skills
      return { success: true, data: [] as WorkItem[] };
    },
    enabled: !!operatorId,
    staleTime: 60 * 1000, // 1 minute
    ...options
  });
}

// Assignment recommendations for operator
export function useAssignmentRecommendations(
  operatorId: string,
  options?: UseQueryOptions<WorkItem[]>
) {
  return useQuery({
    queryKey: ['assignment-recommendations', operatorId],
    queryFn: async () => {
      // This would use AI/ML to recommend optimal assignments
      return { success: true, data: [] as WorkItem[] };
    },
    enabled: !!operatorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
}

// Work progress tracking
export function useWorkProgress(
  assignmentId: string,
  options?: UseQueryOptions<{
    progress: number;
    efficiency: number;
    qualityScore?: number;
    estimatedCompletion: Date;
  }>
) {
  return useQuery({
    queryKey: ['work-progress', assignmentId],
    queryFn: async () => {
      // This would fetch real-time progress data
      return {
        success: true,
        data: {
          progress: 0,
          efficiency: 0,
          estimatedCompletion: new Date()
        }
      };
    },
    enabled: !!assignmentId,
    refetchInterval: 30 * 1000, // Update every 30 seconds
    ...options
  });
}

// Additional missing hooks for compatibility
export function useOperators() {
  return useQuery({
    queryKey: ['operators'],
    queryFn: async () => {
      // This would fetch all operators
      return { success: true, data: [] };
    }
  });
}

export function useStartWorkSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      // This would start a work session
      return { success: true, data: null };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-sessions'] });
    }
  });
}

export function usePauseWorkSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      // This would pause a work session
      return { success: true, data: null };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-sessions'] });
    }
  });
}

