import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useIsMobile } from '@/shared/components/ui';
import { useThemeStore } from '@/app/store/theme-store';
import { cn } from '@/shared/utils';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const initializeTheme = useThemeStore(state => state.initializeTheme);

  // Initialize theme on mount
  useEffect(() => {
    const cleanup = initializeTheme();
    return cleanup;
  }, [initializeTheme]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen || !isMobile}
        onClose={handleSidebarClose}
      />

      {/* Main content area */}
      <div className={cn(
        'flex-1 flex flex-col min-h-screen',
        'lg:ml-64', // Account for sidebar width on desktop
        'transition-all duration-300 ease-in-out'
      )}>
        {/* Header */}
        <Header 
          onMenuToggle={handleSidebarToggle}
          isMenuOpen={sidebarOpen}
        />

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="h-full">
            {children || <Outlet />}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};