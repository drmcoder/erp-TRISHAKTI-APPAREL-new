// Responsive Layout System
// Mobile-first responsive layout with touch-friendly interfaces and gesture support

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { 
  Menu, 
  X, 
  ChevronLeft, 
  Home,
  Users,
  Briefcase,
  BarChart3,
  Settings,
  Bell,
  Search,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useSwipeable } from 'react-swipeable';
import { UI_CONFIG, isMobile, isTablet, getResponsiveValue } from '@/config/ui-config';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  currentPath: string;
  user?: {
    name: string;
    role: string;
    avatar?: string;
  };
  onNavigate?: (path: string) => void;
  onSearch?: (query: string) => void;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
  }>;
}

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  { 
    path: '/', 
    label: 'Dashboard', 
    icon: Home 
  },
  { 
    path: '/operators', 
    label: 'Operators', 
    icon: Users,
    badge: 5
  },
  { 
    path: '/work-assignments', 
    label: 'Work Assignments', 
    icon: Briefcase,
    badge: 12
  },
  { 
    path: '/reports', 
    label: 'Reports', 
    icon: BarChart3 
  },
  { 
    path: '/settings', 
    label: 'Settings', 
    icon: Settings 
  }
];

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  currentPath,
  user,
  onNavigate,
  onSearch,
  notifications = []
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);

  // Mobile/tablet detection
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateViewportSize = () => {
      if (isMobile()) setViewportSize('mobile');
      else if (isTablet()) setViewportSize('tablet');
      else setViewportSize('desktop');
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Search shortcut
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Navigation shortcuts
      if ((e.ctrlKey || e.metaKey)) {
        switch (e.key) {
          case 'h':
            e.preventDefault();
            onNavigate?.('/');
            break;
          case 'o':
            e.preventDefault();
            onNavigate?.('/operators');
            break;
          case 'a':
            e.preventDefault();
            onNavigate?.('/work-assignments');
            break;
        }
      }

      // Close sidebar on Escape
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [sidebarOpen, onNavigate]);

  // Swipe gestures for mobile
  const swipeHandlers = useSwipeable({
    onSwipedRight: (eventData) => {
      if (viewportSize === 'mobile' && eventData.initial[0] < 50) {
        setSidebarOpen(true);
      }
    },
    onSwipedLeft: (eventData) => {
      if (viewportSize === 'mobile' && sidebarOpen) {
        setSidebarOpen(false);
      }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 50,
    preventScrollOnSwipe: false
  });

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  }, [onSearch]);

  // Handle navigation
  const handleNavigate = useCallback((path: string) => {
    onNavigate?.(path);
    if (viewportSize === 'mobile') {
      setSidebarOpen(false);
    }
  }, [onNavigate, viewportSize]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (viewportSize !== 'mobile') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && layoutRef.current && !layoutRef.current.contains(event.target as Node)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, viewportSize]);

  // Sidebar content
  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={cn(
      "flex flex-col h-full",
      mobile ? "bg-background border-r" : ""
    )}>
      {/* Logo/Brand */}
      <div className={cn(
        "flex items-center gap-3 px-6 py-4 border-b",
        mobile && "px-4"
      )}>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">T</span>
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">TSA ERP</span>
          <span className="text-xs text-muted-foreground">Work Management</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "touch-manipulation", // Optimize for touch
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                // Minimum touch target size
                "min-h-[44px]"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <Badge 
                  variant={isActive ? "secondary" : "default"} 
                  className="ml-auto text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="border-t px-3 py-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div 
      ref={layoutRef}
      className="min-h-screen bg-background flex"
      {...swipeHandlers}
    >
      {/* Desktop Sidebar */}
      {viewportSize === 'desktop' && (
        <aside className="w-72 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarContent />
        </aside>
      )}

      {/* Mobile/Tablet Sidebar */}
      {(viewportSize === 'mobile' || viewportSize === 'tablet') && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <SidebarContent mobile />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className={cn(
          "sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          getResponsiveValue({
            mobile: `h-[${UI_CONFIG.layout.header.mobileHeight}]`,
            default: `h-[${UI_CONFIG.layout.header.height}]`
          })
        )}>
          <div className="flex items-center justify-between px-4 h-full">
            {/* Left Side - Menu + Search */}
            <div className="flex items-center gap-3 flex-1">
              {(viewportSize === 'mobile' || viewportSize === 'tablet') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 min-h-[44px] min-w-[44px]"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}

              {/* Search */}
              <div className={cn(
                "relative flex-1 max-w-md",
                searchFocused && viewportSize === 'mobile' && "max-w-none"
              )}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder={getResponsiveValue({
                    mobile: "Search...",
                    default: "Search operators, work items... (Ctrl+K)"
                  })}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={cn(
                    "pl-10 pr-4 h-9",
                    "focus:ring-2 focus:ring-primary focus:ring-offset-0",
                    // Mobile optimization
                    viewportSize === 'mobile' && "text-base" // Prevent zoom on iOS
                  )}
                />
              </div>
            </div>

            {/* Right Side - Notifications + User */}
            {!searchFocused && (
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative min-h-[44px] min-w-[44px]"
                  aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>

                {/* User Avatar */}
                {user && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="min-h-[44px] px-2"
                  >
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                      <User className="w-3 h-3" />
                    </div>
                    {viewportSize === 'desktop' && (
                      <span className="ml-2 text-sm font-medium">{user.name}</span>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className={cn(
            "h-full",
            getResponsiveValue({
              mobile: `p-${UI_CONFIG.layout.content.mobilePadding}`,
              default: `p-${UI_CONFIG.layout.content.padding}`
            })
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay when sidebar is open */}
      {sidebarOpen && viewportSize === 'mobile' && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};