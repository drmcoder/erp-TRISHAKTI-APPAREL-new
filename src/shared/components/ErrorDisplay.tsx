import React from 'react';
import { 
  AlertTriangle, 
  XCircle, 
  AlertCircle, 
  RefreshCcw, 
  X 
} from 'lucide-react';
import { cn } from '@/shared/utils';

export interface ErrorDisplayProps {
  error: Error | string;
  title?: string;
  variant?: 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  showDetails?: boolean;
}

const variantStyles = {
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: 'text-red-500',
    button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: 'text-yellow-500',
    button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: 'text-blue-500',
    button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  },
};

const sizeStyles = {
  sm: {
    container: 'p-3',
    icon: 'w-4 h-4',
    title: 'text-sm font-medium',
    message: 'text-sm',
    button: 'px-2 py-1 text-xs',
  },
  md: {
    container: 'p-4',
    icon: 'w-5 h-5',
    title: 'text-base font-medium',
    message: 'text-sm',
    button: 'px-3 py-2 text-sm',
  },
  lg: {
    container: 'p-6',
    icon: 'w-6 h-6',
    title: 'text-lg font-medium',
    message: 'text-base',
    button: 'px-4 py-2 text-base',
  },
};

const getIcon = (variant: string) => {
  switch (variant) {
    case 'error':
      return XCircle;
    case 'warning':
      return AlertTriangle;
    case 'info':
      return AlertCircle;
    default:
      return XCircle;
  }
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  title,
  variant = 'error',
  size = 'md',
  onRetry,
  onDismiss,
  className,
  showDetails = false,
}) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'object' && error.stack;
  
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const IconComponent = getIcon(variant);

  return (
    <div
      className={cn(
        'border rounded-md',
        variantStyle.container,
        sizeStyle.container,
        className
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent 
            className={cn(sizeStyle.icon, variantStyle.icon)} 
          />
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={cn(sizeStyle.title, 'mb-1')}>
              {title}
            </h3>
          )}
          
          <p className={sizeStyle.message}>
            {errorMessage}
          </p>
          
          {showDetails && errorStack && process.env.NODE_ENV === 'development' && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs opacity-75 hover:opacity-100">
                Show technical details
              </summary>
              <pre className="mt-2 text-xs bg-black bg-opacity-10 p-2 rounded overflow-auto">
                {errorStack}
              </pre>
            </details>
          )}
          
          {(onRetry || onDismiss) && (
            <div className="mt-3 flex space-x-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={cn(
                    'inline-flex items-center rounded-md font-medium text-white transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2',
                    variantStyle.button,
                    sizeStyle.button
                  )}
                >
                  <RefreshCcw className="w-4 h-4 mr-1" />
                  Try Again
                </button>
              )}
              
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className={cn(
                    'inline-flex items-center rounded-md border border-gray-300 bg-white font-medium text-gray-700 transition-colors',
                    'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500',
                    sizeStyle.button
                  )}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
        
        {onDismiss && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onDismiss}
                className={cn(
                  'inline-flex rounded-md p-1.5 transition-colors',
                  'hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  variant === 'error' && 'focus:ring-red-500',
                  variant === 'warning' && 'focus:ring-yellow-500',
                  variant === 'info' && 'focus:ring-blue-500'
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const ErrorPage: React.FC<{
  error: Error | string;
  onRetry?: () => void;
}> = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <ErrorDisplay
          error={error}
          title="Something went wrong"
          size="lg"
          onRetry={onRetry}
          showDetails
          className="shadow-lg"
        />
      </div>
    </div>
  );
};