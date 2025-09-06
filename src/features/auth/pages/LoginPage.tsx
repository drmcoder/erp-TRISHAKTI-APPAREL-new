import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useIsAuthenticated } from '@/app/store/auth-store';
import { useThemeStore } from '@/app/store/theme-store';

export const LoginPage: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const initializeTheme = useThemeStore(state => state.initializeTheme);

  // Initialize theme when login page loads
  useEffect(() => {
    const cleanup = initializeTheme();
    return cleanup;
  }, [initializeTheme]);

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginForm />;
};