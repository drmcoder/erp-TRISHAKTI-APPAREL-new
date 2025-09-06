// src/app/providers/query-provider.tsx
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Query client configuration optimized for ERP system
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time - how long data is considered fresh (5 minutes for operational data)
        staleTime: 5 * 60 * 1000, // 5 minutes
        
        // GC time - how long unused data stays in cache (10 minutes)
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        
        // Retry configuration
        retry: (failureCount, error: any) => {
          // Don't retry on 401/403 (auth errors)
          if (error?.status === 401 || error?.status === 403) {
            return false;
          }
          
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        
        // Retry delay with exponential backoff
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Refetch configuration
        refetchOnWindowFocus: true, // Refetch when user returns to tab
        refetchOnReconnect: true,   // Refetch when internet connection restored
        refetchOnMount: true,       // Refetch when component mounts
        
        // Network mode
        networkMode: 'online',      // Only run queries when online
        
        // Error handling
        throwOnError: false,        // Handle errors in components instead of throwing
      },
      
      mutations: {
        // Retry configuration for mutations
        retry: (failureCount, error: any) => {
          // Don't retry on client errors (4xx)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          
          // Retry server errors up to 2 times
          return failureCount < 2;
        },
        
        // Retry delay for mutations
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
        
        // Network mode for mutations
        networkMode: 'online',
        
        // Error handling
        throwOnError: false,
      }
    },
    
    // Global error handler
    // TODO: Integrate with error tracking service
    onError: (error) => {
      console.error('React Query Error:', error);
    },
    
    // Global mutation error handler
    onMutationError: (error, variables, context, mutation) => {
      console.error('React Query Mutation Error:', {
        error,
        variables,
        mutation: mutation.options.mutationKey
      });
    }
  });
};

// Create a single instance to avoid creating new clients on every render
let queryClient: QueryClient;

const getQueryClient = () => {
  if (!queryClient) {
    queryClient = createQueryClient();
  }
  return queryClient;
};

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const client = getQueryClient();
  
  return (
    <QueryClientProvider client={client}>
      {children}
      {/* Show devtools only in development */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
};

// Export the query client for use in utilities
export { getQueryClient };