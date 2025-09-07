import React, { createContext, useContext, useCallback } from 'react';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { useUIStore } from '@/app/store/ui-store';
import { AppError, logError, createAppError, ErrorCodes } from '@/shared/utils/error-utils';
import type { ErrorCode } from '@/shared/utils/error-utils';

interface ErrorContextValue {
  reportError: (error: Error | string, context?: any) => void;
  reportWarning: (message: string, context?: any) => void;
  reportInfo: (message: string, context?: any) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

export const useErrorReporting = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorReporting must be used within ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ 
  children, 
  fallback 
}) => {
  const addError = useUIStore(state => state.addError);
  const clearErrors = useUIStore(state => state.clearErrors);

  const reportError = useCallback((
    errorInput: Error | string, 
    context: any = {}
  ) => {
    const error = typeof errorInput === 'string' 
      ? createAppError(errorInput, ErrorCodes.UNKNOWN_ERROR, context)
      : errorInput;

    logError(error, context, 'error');
    
    addError({
      message: error.message,
      type: 'error',
      details: context,
      persistent: context.persistent || false,
    });
  }, [addError]);

  const reportWarning = useCallback((message: string, context: any = {}) => {
    logError(new AppError(message, ErrorCodes.WARNING, context), context, 'warn');
    
    addError({
      message,
      type: 'warning',
      details: context,
      persistent: false,
    });
  }, [addError]);

  const reportInfo = useCallback((message: string, context: any = {}) => {
    addError({
      message,
      type: 'info',
      details: context,
      persistent: false,
    });
  }, [addError]);

  const handleBoundaryError = useCallback((error: Error, errorInfo: any) => {
    reportError(error, { 
      errorInfo, 
      boundary: true, 
      persistent: true 
    });
  }, [reportError]);

  const value: ErrorContextValue = {
    reportError,
    reportWarning,
    reportInfo,
    clearErrors,
  };

  return (
    <ErrorContext.Provider value={value}>
      <ErrorBoundary 
        onError={handleBoundaryError}
        fallback={fallback ? (
          <fallback 
            error={new Error('Component error')} 
            retry={() => window.location.reload()} 
          />
        ) : undefined}
      >
        {children}
      </ErrorBoundary>
    </ErrorContext.Provider>
  );
};