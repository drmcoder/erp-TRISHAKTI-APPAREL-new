import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  label,
}) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 
        className={cn(
          'animate-spin text-blue-600',
          sizeMap[size],
          className
        )}
      />
      {label && (
        <span className="text-sm text-gray-600">{label}</span>
      )}
    </div>
  );
};

export const LoadingPage: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-lg text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export const LoadingOverlay: React.FC<{ 
  isVisible: boolean; 
  message?: string;
  children: React.ReactNode;
}> = ({ isVisible, message = 'Loading...', children }) => {
  return (
    <div className="relative">
      {children}
      {isVisible && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-2 text-sm text-gray-600">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const InlineLoading: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="md" label={message} />
    </div>
  );
};