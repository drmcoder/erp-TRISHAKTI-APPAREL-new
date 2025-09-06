import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useGlobalErrors, useUIStore } from '@/app/store/ui-store';
import { ErrorDisplay } from './ErrorDisplay';

export const GlobalErrorDisplay: React.FC = () => {
  const errors = useGlobalErrors();
  const dismissError = useUIStore(state => state.dismissError);

  if (errors.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {errors.map(error => (
          <motion.div
            key={error.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative bg-white rounded-lg shadow-lg border-l-4 border-red-500 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-1">
                    <ErrorDisplay
                      error={error.message}
                      variant={error.type}
                      size="sm"
                      className="border-0 bg-transparent p-0"
                    />
                  </div>
                  
                  {error.dismissible && (
                    <button
                      onClick={() => dismissError(error.id)}
                      className="ml-2 flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                </div>
                
                {error.details && process.env.NODE_ENV === 'development' && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">
                      Debug info
                    </summary>
                    <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto max-h-32">
                      {JSON.stringify(error.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
              
              {!error.persistent && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-red-500"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 10, ease: 'linear' }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const GlobalLoadingDisplay: React.FC = () => {
  const operations = useUIStore(state => state.loadingOperations);
  const hasOperations = Object.keys(operations).length > 0;
  const progress = useUIStore(state => state.getOperationProgress());

  if (!hasOperations) return null;

  return (
    <div className="fixed top-4 left-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white rounded-lg shadow-lg border p-3 min-w-64"
      >
        <div className="space-y-2">
          {Object.values(operations).map(operation => (
            <div key={operation.id} className="flex items-center space-x-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {operation.label}
                </p>
                {operation.progress !== undefined && (
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                    <motion.div
                      className="bg-blue-600 h-1.5 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${operation.progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
              
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ))}
          
          {Object.keys(operations).length > 1 && (
            <div className="pt-2 mt-2 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Overall Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
                <motion.div
                  className="bg-blue-600 h-1 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};