import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { ErrorProvider } from '@/app/providers/ErrorProvider';
import { GlobalErrorDisplay, GlobalLoadingDisplay } from '@/shared/components/GlobalErrorDisplay';
import { AppRoutes } from '@/app/routes';
import { useSessionManagement } from '@/app/hooks/useSessionManagement';
import { SessionTimeout } from '@/features/auth/components/SessionTimeout';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

// Session management component
const SessionManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize session management
  useSessionManagement({
    autoRefreshInterval: 5, // Check every 5 minutes
    sessionWarningTime: 5,  // Warn 5 minutes before expiry
    enableAutoLogout: true
  });

  return (
    <>
      {children}
      <SessionTimeout />
    </>
  );
};

function App() {
  return (
    <ErrorProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <SessionManagerProvider>
            {/* Toast notifications */}
            <Toaster 
              position="top-right" 
              expand={false}
              richColors
              closeButton
              toastOptions={{
                duration: 5000,
                style: {
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #E5E7EB',
                },
              }}
            />

            {/* Global UI indicators */}
            <GlobalErrorDisplay />
            <GlobalLoadingDisplay />

            {/* Main application routes */}
            <AppRoutes />

            {/* React Query Devtools - only in development */}
            {process.env.NODE_ENV === 'development' && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </SessionManagerProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorProvider>
  );
}

export default App;
