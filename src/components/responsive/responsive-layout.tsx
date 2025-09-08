// Responsive Layout Component
// Auto-adapts layout based on device type and optimization settings

import React from 'react';
import { useDeviceOptimization, useMobileOptimization, useTabletOptimization, useTVOptimization } from '../../hooks/useDeviceOptimization';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';
import { 
  Bars3Icon, 
  XMarkIcon,
  ChevronLeftIcon,
  HomeIcon,
  CogIcon 
} from '@heroicons/react/24/outline';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  navigation?: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
  enableSidebar?: boolean;
  enableHeader?: boolean;
  enableFooter?: boolean;
}

// Mobile Layout Component
const MobileLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  navigation, 
  header, 
  className = '' 
}) => {
  const { mobileSpecificClasses, responsiveClasses } = useMobileOptimization();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className={`${mobileSpecificClasses.fullScreen} ${responsiveClasses.container} bg-gray-50 ${className}`}>
      {/* Header */}
      {header && (
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMenuOpen(true)}
            className="p-2"
          >
            <Bars3Icon className="h-5 w-5" />
          </Button>
          {header}
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto px-4 py-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      {navigation && (
        <nav className="bg-white border-t border-gray-200 px-2 py-2">
          {navigation}
        </nav>
      )}

      {/* Slide-out Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-4 border-b">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMenuOpen(false)}
                className="p-2"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              {navigation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Tablet Layout Component
const TabletLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  navigation, 
  header, 
  sidebar, 
  className = '' 
}) => {
  const { tabletSpecificClasses, responsiveClasses, isLandscape } = useTabletOptimization();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(isLandscape);

  return (
    <div className={`${responsiveClasses.container} h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      {header && (
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          {isLandscape && sidebar && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2"
            >
              <Bars3Icon className="h-5 w-5" />
            </Button>
          )}
          {header}
        </header>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebar && isSidebarOpen && (
          <aside className="w-64 bg-white border-r border-gray-200 overflow-auto">
            <div className="p-4">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4">
          <div className={tabletSpecificClasses.splitView}>
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation for Portrait */}
      {!isLandscape && navigation && (
        <nav className="bg-white border-t border-gray-200 px-4 py-2">
          {navigation}
        </nav>
      )}
    </div>
  );
};

// Desktop Layout Component
const DesktopLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  navigation, 
  header, 
  sidebar, 
  className = '' 
}) => {
  const { responsiveClasses } = useDeviceOptimization();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  return (
    <div className={`${responsiveClasses.container} h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      {header && (
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          {sidebar && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2"
            >
              <Bars3Icon className="h-5 w-5" />
            </Button>
          )}
          {header}
        </header>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebar && (
          <aside className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 overflow-auto`}>
            <div className="p-4">
              {!isSidebarCollapsed ? sidebar : (
                <div className="space-y-4">
                  <HomeIcon className="h-6 w-6 mx-auto text-gray-600" />
                  <CogIcon className="h-6 w-6 mx-auto text-gray-600" />
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className={responsiveClasses.columns}>
            {children}
          </div>
        </main>
      </div>

      {/* Navigation in top bar for desktop */}
      {navigation && (
        <div className="absolute top-4 right-4">
          {navigation}
        </div>
      )}
    </div>
  );
};

// TV Layout Component
const TVLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  header, 
  className = '' 
}) => {
  const { tvSpecificClasses, responsiveClasses } = useTVOptimization();

  return (
    <div className={`${responsiveClasses.container} ${tvSpecificClasses.spaciousLayout} ${tvSpecificClasses.highContrast} min-h-screen bg-gray-900 text-white ${className}`}>
      {/* Header */}
      {header && (
        <header className="border-b border-gray-700 pb-6 mb-8">
          <div className={tvSpecificClasses.largeText}>
            {header}
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={tvSpecificClasses.spaciousLayout}>
        {children}
      </main>

      {/* TV-specific navigation hints */}
      <footer className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
        <p className="text-lg">Use keyboard or remote navigation</p>
      </footer>
    </div>
  );
};

// Main Responsive Layout Component
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = (props) => {
  const { deviceType } = useDeviceOptimization();

  switch (deviceType) {
    case 'mobile':
      return <MobileLayout {...props} />;
    case 'tablet':
      return <TabletLayout {...props} />;
    case 'tv':
      return <TVLayout {...props} />;
    case 'desktop':
    default:
      return <DesktopLayout {...props} />;
  }
};

// Responsive Card Component
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({ 
  children, 
  className = '', 
  title, 
  actions 
}) => {
  const { responsiveClasses, deviceType, getComponentVariant } = useDeviceOptimization();
  const variant = getComponentVariant('card');
  
  const cardClasses = {
    compact: 'p-3 space-y-2',
    comfortable: 'p-4 space-y-4',
    spacious: 'p-6 space-y-6'
  };

  return (
    <Card className={`${cardClasses[variant as keyof typeof cardClasses] || cardClasses.comfortable} ${responsiveClasses.cardPadding} ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${responsiveClasses.fontSize}`}>{title}</h3>
          {actions}
        </div>
      )}
      {children}
    </Card>
  );
};

// Responsive Button Component
interface ResponsiveButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  disabled?: boolean;
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'default', 
  className = '', 
  disabled = false 
}) => {
  const { responsiveClasses, getComponentVariant } = useDeviceOptimization();
  const buttonVariant = getComponentVariant('button');
  
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base',
    xlarge: 'px-8 py-4 text-lg'
  };

  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className={`${sizeClasses[buttonVariant as keyof typeof sizeClasses] || sizeClasses.medium} ${responsiveClasses.touchTarget} ${className}`}
    >
      {children}
    </Button>
  );
};

// Responsive Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  minItemWidth?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ 
  children, 
  className = '', 
  minItemWidth = 300 
}) => {
  const { columns, responsiveClasses } = useDeviceOptimization();
  
  return (
    <div className={`grid gap-4 ${responsiveClasses.spacing} ${className}`} 
         style={{ 
           gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}px, 1fr))` 
         }}>
      {children}
    </div>
  );
};

// Device-specific utility components
export const MobileOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isMobile } = useDeviceOptimization();
  return isMobile ? <>{children}</> : null;
};

export const TabletOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isTablet } = useDeviceOptimization();
  return isTablet ? <>{children}</> : null;
};

export const DesktopOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDesktop } = useDeviceOptimization();
  return isDesktop ? <>{children}</> : null;
};

export const TVOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isTV } = useDeviceOptimization();
  return isTV ? <>{children}</> : null;
};

export const TouchOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isTouch } = useDeviceOptimization();
  return isTouch ? <>{children}</> : null;
};

export const NonTouchOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isTouch } = useDeviceOptimization();
  return !isTouch ? <>{children}</> : null;
};

export default ResponsiveLayout;