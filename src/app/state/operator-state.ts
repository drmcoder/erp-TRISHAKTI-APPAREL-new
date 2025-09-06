// Global State Management for Operator Module
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { OperatorSummary, Operator, OperatorStatus } from '@/features/operators/types';

// Operator State Interface
interface OperatorState {
  // Current operator data
  operators: OperatorSummary[];
  selectedOperator: Operator | null;
  
  // UI State
  filters: {
    search: string;
    status: string;
    machineType: string;
    skillLevel: string;
    shift: string;
  };
  
  // Real-time status tracking
  operatorStatuses: Record<string, OperatorStatus>;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  
  // Error states
  error: string | null;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Statistics
  statistics: {
    total: number;
    active: number;
    available: number;
    avgEfficiency: number;
  };
  
  // Actions
  setOperators: (operators: OperatorSummary[]) => void;
  setSelectedOperator: (operator: Operator | null) => void;
  updateOperatorStatus: (operatorId: string, status: OperatorStatus) => void;
  setFilters: (filters: Partial<OperatorState['filters']>) => void;
  resetFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: Partial<OperatorState['pagination']>) => void;
  setStatistics: (statistics: OperatorState['statistics']) => void;
  
  // Computed getters
  getFilteredOperators: () => OperatorSummary[];
  getOperatorById: (id: string) => OperatorSummary | undefined;
  getAvailableOperators: () => OperatorSummary[];
  getOperatorsByMachine: (machineType: string) => OperatorSummary[];
}

// Default filter state
const defaultFilters: OperatorState['filters'] = {
  search: '',
  status: 'all',
  machineType: 'all',
  skillLevel: 'all',
  shift: 'all'
};

// Default pagination state
const defaultPagination: OperatorState['pagination'] = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
};

// Default statistics
const defaultStatistics: OperatorState['statistics'] = {
  total: 0,
  active: 0,
  available: 0,
  avgEfficiency: 0
};

// Create the store
export const useOperatorStore = create<OperatorState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        operators: [],
        selectedOperator: null,
        filters: defaultFilters,
        operatorStatuses: {},
        isLoading: false,
        isCreating: false,
        isUpdating: false,
        error: null,
        pagination: defaultPagination,
        statistics: defaultStatistics,
        
        // Actions
        setOperators: (operators) => {
          set({ operators, error: null }, false, 'setOperators');
        },
        
        setSelectedOperator: (operator) => {
          set({ selectedOperator: operator }, false, 'setSelectedOperator');
        },
        
        updateOperatorStatus: (operatorId, status) => {
          set((state) => ({
            operatorStatuses: {
              ...state.operatorStatuses,
              [operatorId]: status
            },
            // Update operator in list if exists
            operators: state.operators.map(op => 
              op.id === operatorId 
                ? { ...op, currentStatus: status.status, currentWork: status.currentWork }
                : op
            ),
            // Update selected operator if it's the same one
            selectedOperator: state.selectedOperator?.id === operatorId
              ? { ...state.selectedOperator, realtimeStatus: status }
              : state.selectedOperator
          }), false, 'updateOperatorStatus');
        },
        
        setFilters: (newFilters) => {
          set((state) => ({
            filters: { ...state.filters, ...newFilters }
          }), false, 'setFilters');
        },
        
        resetFilters: () => {
          set({ filters: defaultFilters }, false, 'resetFilters');
        },
        
        setLoading: (loading) => {
          set({ isLoading: loading }, false, 'setLoading');
        },
        
        setError: (error) => {
          set({ error }, false, 'setError');
        },
        
        setPagination: (pagination) => {
          set((state) => ({
            pagination: { ...state.pagination, ...pagination }
          }), false, 'setPagination');
        },
        
        setStatistics: (statistics) => {
          set({ statistics }, false, 'setStatistics');
        },
        
        // Computed getters
        getFilteredOperators: () => {
          const { operators, filters } = get();
          return operators.filter((operator) => {
            // Search filter
            if (filters.search) {
              const searchTerm = filters.search.toLowerCase();
              const matchesSearch = 
                operator.name.toLowerCase().includes(searchTerm) ||
                operator.employeeId.toLowerCase().includes(searchTerm) ||
                operator.username.toLowerCase().includes(searchTerm);
              
              if (!matchesSearch) return false;
            }
            
            // Status filter
            if (filters.status !== 'all') {
              if (operator.currentStatus !== filters.status) return false;
            }
            
            // Machine type filter
            if (filters.machineType !== 'all') {
              if (!operator.machineTypes.includes(filters.machineType) && 
                  operator.primaryMachine !== filters.machineType) {
                return false;
              }
            }
            
            // Skill level filter
            if (filters.skillLevel !== 'all') {
              if (operator.skillLevel !== filters.skillLevel) return false;
            }
            
            // Shift filter
            if (filters.shift !== 'all') {
              if (operator.shift !== filters.shift) return false;
            }
            
            return true;
          });
        },
        
        getOperatorById: (id) => {
          return get().operators.find(op => op.id === id);
        },
        
        getAvailableOperators: () => {
          return get().operators.filter(op => op.currentStatus === 'idle');
        },
        
        getOperatorsByMachine: (machineType) => {
          return get().operators.filter(op => 
            op.machineTypes.includes(machineType) || 
            op.primaryMachine === machineType
          );
        }
      }),
      {
        name: 'operator-store',
        // Only persist filters and pagination, not the actual data
        partialize: (state) => ({
          filters: state.filters,
          pagination: state.pagination
        })
      }
    ),
    {
      name: 'operator-store'
    }
  )
);

// Selectors for better performance
export const operatorSelectors = {
  // Get filtered operators with memoization
  useFilteredOperators: () => {
    return useOperatorStore((state) => state.getFilteredOperators());
  },
  
  // Get specific operator
  useOperatorById: (id: string) => {
    return useOperatorStore((state) => state.getOperatorById(id));
  },
  
  // Get available operators
  useAvailableOperators: () => {
    return useOperatorStore((state) => state.getAvailableOperators());
  },
  
  // Get operators by machine
  useOperatorsByMachine: (machineType: string) => {
    return useOperatorStore((state) => state.getOperatorsByMachine(machineType));
  },
  
  // Get current filters
  useFilters: () => {
    return useOperatorStore((state) => state.filters);
  },
  
  // Get loading state
  useLoading: () => {
    return useOperatorStore((state) => state.isLoading);
  },
  
  // Get error state
  useError: () => {
    return useOperatorStore((state) => state.error);
  },
  
  // Get statistics
  useStatistics: () => {
    return useOperatorStore((state) => state.statistics);
  },
  
  // Get pagination
  usePagination: () => {
    return useOperatorStore((state) => state.pagination);
  }
};

// Actions for easier usage
export const operatorActions = {
  setOperators: (operators: OperatorSummary[]) => 
    useOperatorStore.getState().setOperators(operators),
    
  setSelectedOperator: (operator: Operator | null) => 
    useOperatorStore.getState().setSelectedOperator(operator),
    
  updateOperatorStatus: (operatorId: string, status: OperatorStatus) => 
    useOperatorStore.getState().updateOperatorStatus(operatorId, status),
    
  setFilters: (filters: Partial<OperatorState['filters']>) => 
    useOperatorStore.getState().setFilters(filters),
    
  resetFilters: () => 
    useOperatorStore.getState().resetFilters(),
    
  setLoading: (loading: boolean) => 
    useOperatorStore.getState().setLoading(loading),
    
  setError: (error: string | null) => 
    useOperatorStore.getState().setError(error),
    
  setPagination: (pagination: Partial<OperatorState['pagination']>) => 
    useOperatorStore.getState().setPagination(pagination),
    
  setStatistics: (statistics: OperatorState['statistics']) => 
    useOperatorStore.getState().setStatistics(statistics)
};