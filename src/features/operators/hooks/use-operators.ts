// React Query hooks for operators (following REBUILD_BLUEPRINT pattern)
import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions 
} from '@tanstack/react-query';
import { operatorService } from '../services';
import { 
  Operator, 
  OperatorSummary, 
  CreateOperatorData, 
  UpdateOperatorData,
  OperatorStatus 
} from '../types';

// Query keys factory
export const operatorQueryKeys = {
  all: ['operators'] as const,
  lists: () => [...operatorQueryKeys.all, 'list'] as const,
  list: (filters: any) => [...operatorQueryKeys.lists(), { filters }] as const,
  details: () => [...operatorQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...operatorQueryKeys.details(), id] as const,
  status: (id: string) => [...operatorQueryKeys.all, 'status', id] as const,
};

// Get all operators with summary data
export function useOperators(options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: operatorQueryKeys.lists(),
    queryFn: () => operatorService.getOperatorsSummary(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes (formerly cacheTime)
    ...options
  });
}

// Get single operator by ID
export function useOperator(id: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: operatorQueryKeys.detail(id),
    queryFn: () => operatorService.getById<Operator>(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options
  });
}

// Get operator with real-time status
export function useOperatorWithStatus(id: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: operatorQueryKeys.status(id),
    queryFn: () => operatorService.getOperatorWithStatus(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds (status changes frequently)
    refetchInterval: 60 * 1000, // Refresh every minute
    ...options
  });
}

// Get operators by machine type
export function useOperatorsByMachine(machineType: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: [...operatorQueryKeys.lists(), 'machine', machineType],
    queryFn: () => operatorService.getOperatorsByMachine(machineType),
    enabled: !!machineType,
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

// Get operators by skill level
export function useOperatorsBySkill(skillLevel: string, options?: UseQueryOptions<any>) {
  return useQuery({
    queryKey: [...operatorQueryKeys.lists(), 'skill', skillLevel],
    queryFn: () => operatorService.getOperatorsBySkill(skillLevel),
    enabled: !!skillLevel,
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

// Create operator mutation
export function useCreateOperator() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateOperatorData) => operatorService.createOperator(data),
    onSuccess: () => {
      // Invalidate and refetch operators list
      queryClient.invalidateQueries({ queryKey: operatorQueryKeys.lists() });
    },
    onError: (error) => {
      console.error('Failed to create operator:', error);
    }
  });
}

// Update operator mutation
export function useUpdateOperator() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOperatorData }) => 
      operatorService.updateOperator(id, data),
    onMutate: async ({ id, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: operatorQueryKeys.detail(id) });
      
      const previousOperator = queryClient.getQueryData(operatorQueryKeys.detail(id));
      
      queryClient.setQueryData(operatorQueryKeys.detail(id), (old: any) => ({
        ...old,
        data: { ...old.data, ...data }
      }));
      
      return { previousOperator };
    },
    onError: (err, { id }, context) => {
      // Rollback optimistic update
      if (context?.previousOperator) {
        queryClient.setQueryData(operatorQueryKeys.detail(id), context.previousOperator);
      }
    },
    onSuccess: (result, { id }) => {
      // Update cache with server response
      queryClient.setQueryData(operatorQueryKeys.detail(id), result);
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: operatorQueryKeys.lists() });
    }
  });
}

// Update operator statistics
export function useUpdateOperatorStats() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      operatorId, 
      stats 
    }: { 
      operatorId: string; 
      stats: {
        efficiency?: number;
        qualityScore?: number;
        completedPieces?: number;
        earnings?: number;
      };
    }) => operatorService.updateOperatorStats(operatorId, stats),
    onSuccess: (_, { operatorId }) => {
      // Invalidate operator details and lists
      queryClient.invalidateQueries({ queryKey: operatorQueryKeys.detail(operatorId) });
      queryClient.invalidateQueries({ queryKey: operatorQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: operatorQueryKeys.status(operatorId) });
    }
  });
}

// Assign work to operator
export function useAssignWork() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      operatorId, 
      workData 
    }: { 
      operatorId: string; 
      workData: {
        bundleId: string;
        workItemId: string;
        assignmentMethod: 'supervisor_assigned' | 'self_assigned';
        estimatedCompletion?: Date;
      };
    }) => operatorService.assignWork(operatorId, workData),
    onSuccess: (_, { operatorId }) => {
      // Update operator status and assignments
      queryClient.invalidateQueries({ queryKey: operatorQueryKeys.detail(operatorId) });
      queryClient.invalidateQueries({ queryKey: operatorQueryKeys.status(operatorId) });
      queryClient.invalidateQueries({ queryKey: operatorQueryKeys.lists() });
    }
  });
}

// Complete work assignment
export function useCompleteWork() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      operatorId, 
      workData 
    }: { 
      operatorId: string; 
      workData: {
        bundleId: string;
        workItemId: string;
        completedPieces: number;
        qualityScore: number;
        efficiency: number;
        timeSpent: number;
      };
    }) => operatorService.completeWork(operatorId, workData),
    onSuccess: (_, { operatorId }) => {
      // Update all operator-related queries
      queryClient.invalidateQueries({ queryKey: operatorQueryKeys.detail(operatorId) });
      queryClient.invalidateQueries({ queryKey: operatorQueryKeys.status(operatorId) });
      queryClient.invalidateQueries({ queryKey: operatorQueryKeys.lists() });
      
      // Also invalidate work-related queries
      queryClient.invalidateQueries({ queryKey: ['work-items'] });
      queryClient.invalidateQueries({ queryKey: ['available-work'] });
    }
  });
}

// Update operator real-time status
export function useUpdateOperatorStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      operatorId, 
      status 
    }: { 
      operatorId: string; 
      status: Partial<OperatorStatus>;
    }) => operatorService.updateOperatorStatus(operatorId, status),
    onMutate: async ({ operatorId, status }) => {
      // Optimistic update for status
      await queryClient.cancelQueries({ queryKey: operatorQueryKeys.status(operatorId) });
      
      const previousStatus = queryClient.getQueryData(operatorQueryKeys.status(operatorId));
      
      queryClient.setQueryData(operatorQueryKeys.status(operatorId), (old: any) => ({
        ...old,
        data: { ...old.data, realtimeStatus: { ...old.data?.realtimeStatus, ...status } }
      }));
      
      return { previousStatus };
    },
    onError: (err, { operatorId }, context) => {
      // Rollback optimistic update
      if (context?.previousStatus) {
        queryClient.setQueryData(operatorQueryKeys.status(operatorId), context.previousStatus);
      }
    },
    onSuccess: (_, { operatorId }) => {
      // Invalidate status query to get fresh data
      queryClient.invalidateQueries({ queryKey: operatorQueryKeys.status(operatorId) });
      queryClient.invalidateQueries({ queryKey: operatorQueryKeys.lists() });
    }
  });
}

// Delete/deactivate operator
export function useDeactivateOperator() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (operatorId: string) => 
      operatorService.updateOperator(operatorId, { isActive: false }),
    onSuccess: () => {
      // Refresh operators list
      queryClient.invalidateQueries({ queryKey: operatorQueryKeys.lists() });
    }
  });
}