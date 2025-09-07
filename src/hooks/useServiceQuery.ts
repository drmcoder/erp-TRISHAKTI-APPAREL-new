// React Query integration for service layer
import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query';
import { BaseService, ServiceResponse } from '@/services/base-service';
import { WorkAssignmentService } from '@/services/work-assignment-service';
import { OperatorWalletService } from '@/services/operator-wallet-service';
import { DamageReportService } from '@/services/damage-report-service';
import { OptimisticUpdates } from '@/services/optimistic-updates';
import { ConnectionMonitor } from '@/services/connection-monitor';

// Query key factory for consistent key management
export const queryKeys = {
  // Base entity keys
  entities: (entityType: string) => ['entities', entityType],
  entity: (entityType: string, id: string) => ['entities', entityType, id],
  entityList: (entityType: string, params?: any) => ['entities', entityType, 'list', params],
  
  // Specific service keys
  operatorWallet: (operatorId: string) => ['operator-wallet', operatorId],
  damageQueue: (supervisorId: string, filter?: string) => ['damage-queue', supervisorId, filter],
  availableWork: () => ['available-work'],
  operatorWork: (operatorId: string) => ['operator-work', operatorId],
  
  // Real-time keys
  realtime: (type: string, id?: string) => ['realtime', type, id].filter(Boolean),
};

interface UseServiceQueryOptions<T> extends Omit<UseQueryOptions<ServiceResponse<T>>, 'queryKey' | 'queryFn'> {
  useCache?: boolean;
  realtimeSubscription?: boolean;
}

/**
 * Enhanced useQuery hook for service layer with caching and real-time updates
 */
export function useServiceQuery<T>(
  entityType: string,
  method: string,
  params?: any,
  options?: UseServiceQueryOptions<T>
) {
  const queryClient = useQueryClient();
  
  const queryKey = params?.id ? 
    queryKeys.entity(entityType, params.id) :
    queryKeys.entityList(entityType, params);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const service = new BaseService(entityType);
      
      switch (method) {
        case 'getById':
          return service.getById<T>(params.id, options?.useCache);
        case 'getAll':
          return service.getAll<T>(params);
        case 'getWhere':
          return service.getWhere<T>(params.where, params.options);
        default:
          throw new Error(`Unknown method: ${method}`);
      }
    },
    enabled: !!entityType && !!method && (!params?.id || params.id !== ''),
    staleTime: options?.useCache !== false ? 5 * 60 * 1000 : 0, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    networkMode: ConnectionMonitor.isOnline() ? 'online' : 'offlineFirst',
    ...options
  });
}

/**
 * Mutation hook with optimistic updates
 */
export function useServiceMutation<T, TVariables = any>(
  entityType: string,
  method: string,
  options?: UseMutationOptions<ServiceResponse<T>, Error, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const service = new BaseService(entityType);
      
      switch (method) {
        case 'create':
          return service.create<T>((variables as any).data, (variables as any).id);
        case 'update':
          return service.update<T>((variables as any).id, (variables as any).updates);
        case 'delete':
          return service.delete((variables as any).id);
        default:
          throw new Error(`Unknown mutation method: ${method}`);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.entities(entityType) 
      });
      
      // Update specific entity in cache if it's an update
      if (method === 'update' && (variables as any).id) {
        queryClient.setQueryData(
          queryKeys.entity(entityType, (variables as any).id),
          data
        );
      }
    },
    ...options
  });
}

/**
 * Optimistic mutation hook
 */
export function useOptimisticMutation<T, TVariables = any>(
  entityType: string,
  method: string,
  options?: UseMutationOptions<ServiceResponse<T>, Error, TVariables> & {
    optimisticUpdate?: (variables: TVariables) => Partial<T>;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const service = new BaseService(entityType);
      const updateId = OptimisticUpdates.generateUpdateId('mutation');
      
      if (method === 'update' && options?.optimisticUpdate) {
        // Apply optimistic update
        const optimisticData = options.optimisticUpdate(variables);
        return service.optimisticUpdate(
          (variables as any).id,
          optimisticData,
          () => service.update<T>((variables as any).id, (variables as any).updates)
        );
      }
      
      // Fallback to regular mutation
      return service[method as keyof BaseService](...Object.values(variables as any));
    },
    onMutate: async (variables) => {
      if (method === 'update' && options?.optimisticUpdate) {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ 
          queryKey: queryKeys.entity(entityType, (variables as any).id) 
        });

        // Snapshot previous value
        const previousData = queryClient.getQueryData(
          queryKeys.entity(entityType, (variables as any).id)
        );

        // Optimistically update cache
        queryClient.setQueryData(
          queryKeys.entity(entityType, (variables as any).id),
          (old: ServiceResponse<T>) => ({
            ...old,
            data: { ...old.data, ...options.optimisticUpdate!(variables) }
          })
        );

        return { previousData };
      }
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData && method === 'update') {
        queryClient.setQueryData(
          queryKeys.entity(entityType, (variables as any).id),
          context.previousData
        );
      }
      
      options?.onError?.(err, variables, context);
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.entities(entityType) 
      });
      
      options?.onSuccess?.(data, variables, context);
    }
  });
}

/**
 * Work assignment specific hooks
 */
export function useAtomicSelfAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      workId: string;
      operatorId: string;
      operatorInfo: { name: string; machineType: string };
    }) => {
      return WorkAssignmentService.atomicSelfAssign(
        params.workId,
        params.operatorId,
        params.operatorInfo
      );
    },
    onSuccess: () => {
      // Invalidate available work and operator work queries
      queryClient.invalidateQueries({ queryKey: queryKeys.availableWork() });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.entities('operatorWork') 
      });
    },
    onError: (error) => {
      console.error('Self-assignment failed:', error);
    }
  });
}

/**
 * Operator wallet specific hooks
 */
export function useOperatorWallet(operatorId: string, options?: UseServiceQueryOptions<any>) {
  const walletService = new OperatorWalletService();
  
  return useQuery({
    queryKey: queryKeys.operatorWallet(operatorId),
    queryFn: () => walletService.getWalletBalance(operatorId),
    enabled: !!operatorId,
    staleTime: 30 * 1000, // 30 seconds (wallet data changes frequently)
    ...options
  });
}

export function useWalletOperations(operatorId: string) {
  const queryClient = useQueryClient();
  const walletService = new OperatorWalletService();

  const holdPayment = useMutation({
    mutationFn: async (params: {
      bundleId: string;
      holdData: { reason: string; heldAmount: number; heldPieces?: number };
    }) => {
      return walletService.holdBundlePayment(params.bundleId, operatorId, params.holdData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.operatorWallet(operatorId) });
    }
  });

  const releasePayment = useMutation({
    mutationFn: async (params: {
      bundleId: string;
      releaseData?: { supervisorId: string; notes: string };
    }) => {
      return walletService.releaseBundlePayment(params.bundleId, operatorId, params.releaseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.operatorWallet(operatorId) });
    }
  });

  return { holdPayment, releasePayment };
}

/**
 * Damage report specific hooks
 */
export function useDamageQueue(supervisorId: string, statusFilter?: string[]) {
  const damageService = new DamageReportService();
  
  return useQuery({
    queryKey: queryKeys.damageQueue(supervisorId, statusFilter?.join(',')),
    queryFn: () => damageService.getSupervisorDamageQueue(supervisorId, statusFilter),
    enabled: !!supervisorId,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useDamageReportOperations() {
  const queryClient = useQueryClient();
  const damageService = new DamageReportService();

  const submitReport = useMutation({
    mutationFn: (reportData: any) => damageService.submitDamageReport(reportData),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.entities('damage_reports') 
      });
    }
  });

  const startRework = useMutation({
    mutationFn: (params: { reportId: string; supervisorData: any }) => 
      damageService.startRework(params.reportId, params.supervisorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.entities('damage_reports') 
      });
    }
  });

  const completeRework = useMutation({
    mutationFn: (params: { reportId: string; completionData: any }) =>
      damageService.completeRework(params.reportId, params.completionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.entities('damage_reports') 
      });
    }
  });

  return { submitReport, startRework, completeRework };
}

/**
 * Real-time subscription hooks
 */
export function useRealtimeSubscription<T>(
  entityType: string,
  subscriptionType: 'document' | 'collection',
  params: any,
  callback: (data: T) => void,
  options?: { enabled?: boolean }
) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!options?.enabled) return;

    const service = new BaseService(entityType);
    let unsubscribe: (() => void) | undefined;

    if (subscriptionType === 'document' && params.id) {
      unsubscribe = service.subscribeToDocument<T>(params.id, (data) => {
        if (data) {
          // Update query cache
          queryClient.setQueryData(
            queryKeys.entity(entityType, params.id),
            { success: true, data }
          );
        }
        callback(data);
      });
    } else if (subscriptionType === 'collection') {
      unsubscribe = service.subscribeToCollection<T>(
        (data) => {
          // Update query cache
          queryClient.setQueryData(
            queryKeys.entityList(entityType, params),
            { success: true, data }
          );
          callback(data as any);
        },
        params.where,
        params.options
      );
    }

    return unsubscribe;
  }, [entityType, subscriptionType, params.id, options?.enabled]);
}

/**
 * Service health monitoring
 */
export function useServiceHealth() {
  return useQuery({
    queryKey: ['service-health'],
    queryFn: async () => {
      const isOnline = ConnectionMonitor.isOnline();
      const optimisticStats = OptimisticUpdates.getStats();
      
      return {
        connectionStatus: isOnline ? 'online' : 'offline',
        optimisticUpdates: optimisticStats,
        timestamp: new Date().toISOString()
      };
    },
    refetchInterval: 30 * 1000, // Check every 30 seconds
    staleTime: 0
  });
}