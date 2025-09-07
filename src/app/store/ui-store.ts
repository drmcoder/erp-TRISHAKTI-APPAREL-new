import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface GlobalError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: number;
  details?: any;
  dismissible?: boolean;
  persistent?: boolean;
}

export interface LoadingOperation {
  id: string;
  label: string;
  startTime: number;
  progress?: number;
}

interface UIState {
  // Loading state
  globalLoading: boolean;
  loadingOperations: Record<string, LoadingOperation>;
  
  // Error state
  errors: GlobalError[];
  
  // Modal/overlay state
  modalStack: string[];
  
  // Actions
  setGlobalLoading: (loading: boolean) => void;
  startOperation: (id: string, label: string) => void;
  updateOperationProgress: (id: string, progress: number) => void;
  completeOperation: (id: string) => void;
  
  addError: (error: Omit<GlobalError, 'id' | 'timestamp'>) => void;
  dismissError: (id: string) => void;
  clearErrors: () => void;
  
  pushModal: (modalId: string) => void;
  popModal: () => string | undefined;
  clearModals: () => void;
  isModalOpen: (modalId: string) => boolean;
  
  // Computed getters
  hasActiveOperations: () => boolean;
  getOperationProgress: () => number;
  hasErrors: () => boolean;
  getTopModal: () => string | undefined;
}

export const useUIStore = create<UIState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      globalLoading: false,
      loadingOperations: {},
      errors: [],
      modalStack: [],

      // Loading actions
      setGlobalLoading: (loading: boolean) => {
        set(state => {
          state.globalLoading = loading;
        });
      },

      startOperation: (id: string, label: string) => {
        set(state => {
          state.loadingOperations[id] = {
            id,
            label,
            startTime: Date.now(),
            progress: 0,
          };
        });
      },

      updateOperationProgress: (id: string, progress: number) => {
        set(state => {
          if (state.loadingOperations[id]) {
            state.loadingOperations[id].progress = Math.max(0, Math.min(100, progress));
          }
        });
      },

      completeOperation: (id: string) => {
        set(state => {
          delete state.loadingOperations[id];
        });
      },

      // Error actions
      addError: (error: Omit<GlobalError, 'id' | 'timestamp'>) => {
        set(state => {
          const newError: GlobalError = {
            ...error,
            id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            dismissible: error.dismissible ?? true,
            persistent: error.persistent ?? false,
          };
          
          state.errors.push(newError);
          
          // Auto-dismiss non-persistent errors after 10 seconds
          if (!newError.persistent) {
            setTimeout(() => {
              get().dismissError(newError.id);
            }, 10000);
          }
        });
      },

      dismissError: (id: string) => {
        set(state => {
          state.errors = state.errors.filter(error => error.id !== id);
        });
      },

      clearErrors: () => {
        set(state => {
          state.errors = [];
        });
      },

      // Modal actions
      pushModal: (modalId: string) => {
        set(state => {
          if (!state.modalStack.includes(modalId)) {
            state.modalStack.push(modalId);
          }
        });
      },

      popModal: () => {
        const { modalStack } = get();
        const topModal = modalStack[modalStack.length - 1];
        
        set(state => {
          state.modalStack.pop();
        });
        
        return topModal;
      },

      clearModals: () => {
        set(state => {
          state.modalStack = [];
        });
      },

      isModalOpen: (modalId: string) => {
        return get().modalStack.includes(modalId);
      },

      // Computed getters
      hasActiveOperations: () => {
        return Object.keys(get().loadingOperations).length > 0;
      },

      getOperationProgress: () => {
        const operations = Object.values(get().loadingOperations);
        if (operations.length === 0) return 0;
        
        const totalProgress = operations.reduce((sum, op) => sum + (op.progress || 0), 0);
        return Math.round(totalProgress / operations.length);
      },

      hasErrors: () => {
        return get().errors.length > 0;
      },

      getTopModal: () => {
        const { modalStack } = get();
        return modalStack[modalStack.length - 1];
      },
    })),
    { name: 'UIStore' }
  )
);

// Selectors for better performance
export const useGlobalLoading = () => useUIStore(state => state.globalLoading);
export const useLoadingOperations = () => useUIStore(state => state.loadingOperations);
export const useGlobalErrors = () => useUIStore(state => state.errors);
export const useModalStack = () => useUIStore(state => state.modalStack);
export const useHasActiveOperations = () => useUIStore(state => state.hasActiveOperations());
export const useOperationProgress = () => useUIStore(state => state.getOperationProgress());
export const useHasErrors = () => useUIStore(state => state.hasErrors());
export const useTopModal = () => useUIStore(state => state.getTopModal());