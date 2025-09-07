import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/config/i18n-config';

// Mock auth context
const mockAuthContext = {
  user: {
    uid: 'test-user',
    email: 'test@example.com',
    role: 'operator',
  },
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
};

const AuthContext = React.createContext(mockAuthContext);

// Mock notification context
const mockNotificationContext = {
  notifications: [],
  unreadCount: 0,
  markAsRead: vi.fn(),
  deleteNotification: vi.fn(),
  clearAll: vi.fn(),
};

const NotificationContext = React.createContext(mockNotificationContext);

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AuthContext.Provider value={mockAuthContext}>
          <NotificationContext.Provider value={mockNotificationContext}>
            <BrowserRouter>{children}</BrowserRouter>
          </NotificationContext.Provider>
        </AuthContext.Provider>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
