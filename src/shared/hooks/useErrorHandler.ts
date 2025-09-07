import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  toastDuration?: number;
  logError?: boolean;
  onError?: (error: Error) => void;
}

export interface UseErrorHandlerReturn {
  error: Error | null;
  clearError: () => void;
  handleError: (error: Error | string) => void;
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R>
  ) => (...args: T) => Promise<R | void>;
}

export const useErrorHandler = (
  options: ErrorHandlerOptions = {}
): UseErrorHandlerReturn => {
  const {
    showToast = true,
    toastDuration = 5000,
    logError = true,
    onError,
  } = options;

  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((errorInput: Error | string) => {
    const errorObj = typeof errorInput === 'string' 
      ? new Error(errorInput) 
      : errorInput;
    
    setError(errorObj);
    
    if (logError) {
      console.error('Error handled:', errorObj);
    }
    
    if (showToast) {
      toast.error(errorObj.message, {
        duration: toastDuration,
      });
    }
    
    onError?.(errorObj);
  }, [showToast, toastDuration, logError, onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R | void> => {
      try {
        clearError();
        return await fn(...args);
      } catch (error) {
        handleError(error as Error);
      }
    };
  }, [handleError, clearError]);

  return {
    error,
    clearError,
    handleError,
    withErrorHandling,
  };
};

export const useAsyncError = () => {
  const [, setError] = useState();
  
  return useCallback(
    (error: Error) => {
      setError(() => {
        throw error;
      });
    },
    [setError]
  );
};