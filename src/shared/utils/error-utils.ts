export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface SerializableError {
  name: string;
  message: string;
  stack?: string;
  code?: string | number;
  context?: ErrorContext;
  timestamp: number;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly context: ErrorContext;
  public readonly timestamp: number;

  constructor(
    message: string,
    code = 'UNKNOWN_ERROR',
    context: ErrorContext = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.timestamp = Date.now();
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export const ErrorCodes = {
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  WARNING: 'WARNING',
  
  // Authentication errors
  AUTH_FAILED: 'AUTH_FAILED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  
  // Data errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  
  // Business logic errors
  WORK_NOT_AVAILABLE: 'WORK_NOT_AVAILABLE',
  INVALID_OPERATION: 'INVALID_OPERATION',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  
  // System errors
  FIREBASE_ERROR: 'FIREBASE_ERROR',
  REALTIME_CONNECTION_FAILED: 'REALTIME_CONNECTION_FAILED',
  SYNC_FAILED: 'SYNC_FAILED',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export const createAppError = (
  message: string,
  code: ErrorCode = ErrorCodes.UNKNOWN_ERROR as any,
  context: ErrorContext = {}
): AppError => {
  return new AppError(message, code, context);
};

export const serializeError = (error: Error): SerializableError => {
  const serialized: SerializableError = {
    name: error.name,
    message: error.message,
    timestamp: Date.now(),
  };

  if (error.stack) {
    serialized.stack = error.stack;
  }

  if (error instanceof AppError) {
    serialized.code = error.code;
    serialized.context = error.context;
    serialized.timestamp = error.timestamp;
  }

  return serialized;
};

export const deserializeError = (serialized: SerializableError): AppError => {
  const error = new AppError(
    serialized.message,
    serialized.code as ErrorCode,
    serialized.context
  );
  
  error.name = serialized.name;
  error.stack = serialized.stack;
  
  return error;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  
  return 'An unexpected error occurred';
};

export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return [
      ErrorCodes.NETWORK_ERROR,
      ErrorCodes.TIMEOUT,
      ErrorCodes.SERVER_ERROR,
    ].includes(error.code as any);
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('network') || 
           message.includes('fetch') || 
           message.includes('timeout') ||
           message.includes('connection');
  }
  
  return false;
};

export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return [
      ErrorCodes.AUTH_FAILED,
      ErrorCodes.SESSION_EXPIRED,
      ErrorCodes.INSUFFICIENT_PERMISSIONS,
    ].includes(error.code as any);
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('auth') || 
           message.includes('permission') || 
           message.includes('unauthorized') ||
           message.includes('forbidden');
  }
  
  return false;
};

export const shouldRetry = (error: unknown, attemptCount = 0): boolean => {
  const maxRetries = 3;
  
  if (attemptCount >= maxRetries) {
    return false;
  }
  
  if (isNetworkError(error)) {
    return true;
  }
  
  if (error instanceof AppError) {
    return error.code === ErrorCodes.TIMEOUT;
  }
  
  return false;
};

export const logError = (
  error: Error,
  context: ErrorContext = {},
  level: 'error' | 'warn' | 'info' = 'error'
) => {
  const serialized = serializeError(error);
  const logData = {
    ...serialized,
    context: { ...context, ...serialized.context },
  };
  
  console[level]('Error logged:', logData);
  
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry, LogRocket, etc.
    // errorTrackingService.captureException(error, context);
  }
};