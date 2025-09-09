// Mobile-Friendly Layout Component
// Responsive design with touch-optimized navigation

import React, { useState, useEffect } from 'react';
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  BellIcon,
  UserCircleIcon,
  QrCodeIcon,
  TvIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  PlayIcon,
  TagIcon,
  WrenchIcon,
  AdjustmentsHorizontalIcon,
  DocumentChartBarIcon,
  UserIcon,
  HandRaisedIcon,
  RectangleStackIcon,
  EyeIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

interface MobileFriendlyLayoutProps {
  children: React.ReactNode;
  currentUser?: {
    name: string;
    role: 'operator' | 'supervisor' | 'management' | 'admin';
    avatar?: string;
  };
  currentView?: string;
  onViewChange?: (view: string) => void;
  onLogout?: () => void;
}

const navigationItems = {
  operator: [
    { icon: HomeIcon, label: 'Dashboard', href: '/operator', id: 'dashboard' },
    { icon: PlayIcon, label: 'My Work', href: '/operator/my-work', id: 'my-work' },
    { icon: UserIcon, label: 'Pick Work', href: '/operator/self-assign', id: 'self-assign' },
    { icon: PlayIcon, label: 'Production Timer', href: '/operator/timer', id: 'timer' },
    { icon: QrCodeIcon, label: 'Barcode Scanner', href: '/operator/scanner', id: 'barcode-scanner' },
    { icon: ChartBarIcon, label: 'My Earnings', href: '/operator/earnings', id: 'earnings' },
    { icon: UserCircleIcon, label: 'Profile', href: '/operator/profile', id: 'profile' }
  ],
  supervisor: [
    { icon: HomeIcon, label: 'Dashboard', href: '/supervisor', id: 'dashboard' },
    { icon: DocumentTextIcon, label: '3-Step WIP Entry', href: '/supervisor/complete-wip', id: 'complete-wip-entry' },
    
    // ASSIGNMENT SYSTEMS
    { icon: AdjustmentsHorizontalIcon, label: '🧠 Smart Assignment', href: '/supervisor/smart', id: 'smart-assignment' },
    { icon: HandRaisedIcon, label: '🤏 Drag & Drop', href: '/supervisor/drag-drop', id: 'drag-drop-assignment' },
    { icon: RectangleStackIcon, label: '📋 Kanban Assign', href: '/supervisor/kanban', id: 'kanban-assignment' },
    { icon: ArrowsUpDownIcon, label: '🔄 Sequential Workflow', href: '/supervisor/workflow', id: 'sequential-workflow' },
    { icon: EyeIcon, label: '👥 Operator Buckets', href: '/supervisor/buckets', id: 'operator-buckets' },
    { icon: UserIcon, label: '👤 Operator Profile', href: '/supervisor/profile', id: 'operator-profile' },
    
    // EXISTING FEATURES
    { icon: CubeIcon, label: 'Bundle Assignments', href: '/supervisor/bundle-assignments', id: 'bundle-assignments' },
    { icon: UserGroupIcon, label: 'Work Assignment', href: '/supervisor/assignments', id: 'work-assignment' },
    { icon: WrenchIcon, label: 'Parts Issues', href: '/supervisor/parts-issues', id: 'parts-issues' },
    { icon: CubeIcon, label: 'Bundle Management', href: '/supervisor/bundles', id: 'bundles' },
    { icon: UserGroupIcon, label: 'Operator Management', href: '/supervisor/operators', id: 'operators' },
    { icon: ComputerDesktopIcon, label: 'Live Dashboard', href: '/supervisor/live', id: 'live-dashboard' },
    { icon: QrCodeIcon, label: 'Barcode Scanner', href: '/supervisor/scanner', id: 'barcode-scanner' },
    { icon: TagIcon, label: 'Label Generator', href: '/supervisor/labels', id: 'label-generator' },
    { icon: DocumentTextIcon, label: 'Sewing Templates', href: '/supervisor/sewing-templates', id: 'sewing-templates' },
    { icon: DocumentChartBarIcon, label: 'Bundle Analytics', href: '/supervisor/bundle-analytics', id: 'bundle-analytics' },
    { icon: ChartBarIcon, label: 'Analytics', href: '/supervisor/analytics', id: 'analytics' },
    { icon: CogIcon, label: 'Quality Control', href: '/supervisor/quality', id: 'quality' }
  ],
  management: [
    { icon: HomeIcon, label: 'Dashboard', href: '/management', id: 'dashboard' },
    { icon: DocumentTextIcon, label: '3-Step WIP Entry', href: '/management/complete-wip', id: 'complete-wip-entry' },
    { icon: DocumentChartBarIcon, label: 'Bundle Analytics', href: '/management/bundle-analytics', id: 'bundle-analytics' },
    { icon: CubeIcon, label: 'Production Lots', href: '/management/production-lots', id: 'production-lots' },
    { icon: CubeIcon, label: 'Cutting Droplet', href: '/management/cutting', id: 'cutting-droplet' },
    { icon: CogIcon, label: 'Pricing Manager', href: '/management/pricing', id: 'pricing-manager' },
    { icon: ComputerDesktopIcon, label: 'Live Dashboard', href: '/management/live', id: 'live-dashboard' },
    { icon: TvIcon, label: 'TV Dashboard', href: '/management/tv', id: 'tv-dashboard' },
    { icon: ChartBarIcon, label: 'Analytics', href: '/management/analytics', id: 'analytics' },
    { icon: UserGroupIcon, label: 'Users', href: '/management/users', id: 'operators' }
  ],
  admin: [
    { icon: HomeIcon, label: 'Dashboard', href: '/admin', id: 'dashboard' },
    { icon: DocumentTextIcon, label: '3-Step WIP Entry', href: '/admin/complete-wip', id: 'complete-wip-entry' },
    { icon: AdjustmentsHorizontalIcon, label: 'Smart Assignment', href: '/admin/multi-assignment', id: 'multi-assignment' },
    { icon: CubeIcon, label: 'Bundle Assignments', href: '/admin/bundle-assignments', id: 'bundle-assignments' },
    { icon: WrenchIcon, label: 'Parts Issues', href: '/admin/parts-issues', id: 'parts-issues' },
    { icon: DocumentChartBarIcon, label: 'Bundle Analytics', href: '/admin/bundle-analytics', id: 'bundle-analytics' },
    { icon: CubeIcon, label: 'Enhanced Operator', href: '/admin/enhanced-operator', id: 'enhanced-operator' },
    { icon: UserCircleIcon, label: 'Piece Tracker', href: '/admin/piece-tracker', id: 'piece-tracker' },
    { icon: CubeIcon, label: 'Bundle Assignment', href: '/admin/bundle-assignment', id: 'bundle-assignment' },
    { icon: ComputerDesktopIcon, label: 'Live Dashboard', href: '/admin/live', id: 'live-dashboard' },
    { icon: TvIcon, label: 'TV Dashboard', href: '/admin/tv', id: 'tv-dashboard' },
    { icon: QrCodeIcon, label: 'Barcode Scanner', href: '/admin/scanner', id: 'barcode-scanner' },
    { icon: TagIcon, label: 'Label Generator', href: '/admin/labels', id: 'label-generator' },
    { icon: DocumentTextIcon, label: 'Sewing Templates', href: '/admin/sewing-templates', id: 'sewing-templates' },
    { icon: ChartBarIcon, label: 'Analytics', href: '/admin/analytics', id: 'analytics' },
    { icon: UserGroupIcon, label: 'Users', href: '/admin/users', id: 'operators' },
    { icon: CogIcon, label: 'Settings', href: '/admin/settings', id: 'settings' }
  ]
};

export const MobileFriendlyLayout: React.FC<MobileFriendlyLayoutProps> = ({
  children,
  currentUser = { name: 'User', role: 'operator' },
  currentView = 'dashboard',
  onViewChange,
  onLogout
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(currentView);
  const [isMobile, setIsMobile] = useState(false);

  // Sync activeItem with currentView prop
  useEffect(() => {
    setActiveItem(currentView);
  }, [currentView]);

  // Check if mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && isMobile) {
        const sidebar = document.getElementById('mobile-sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, isMobile]);

  const navItems = navigationItems[currentUser.role] || navigationItems.operator;

  const getRoleColor = (role: string) => {
    const colors = {
      operator: 'bg-green-500',
      supervisor: 'bg-blue-500',
      management: 'bg-purple-500',
      admin: 'bg-red-500'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500';
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      operator: '👷‍♂️',
      supervisor: '👨‍💼', 
      management: '🏢',
      admin: '⚡'
    };
    return badges[role as keyof typeof badges] || '👤';
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        id="mobile-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:w-64"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">T</span>
            </div>
            <div>
              <h1 className="font-bold text-lg">TSA ERP</h1>
              <p className="text-xs text-blue-100">Production System</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-blue-100 hover:bg-blue-800 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white text-xl", getRoleColor(currentUser.role))}>
              {getRoleBadge(currentUser.role)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {currentUser.role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto min-h-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveItem(item.id);
                  if (onViewChange) onViewChange(item.id);
                  if (isMobile) setSidebarOpen(false);
                }}
                className={cn(
                  "group flex items-center w-full px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-6 w-6 transition-colors",
                    isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                  )}
                />
                <span className="truncate">{item.label}</span>
                
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {onLogout && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to logout?')) {
                  onLogout();
                }
              }}
              className="w-full mb-3 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              Logout
            </button>
          )}
          <div className="text-xs text-gray-500 text-center">
            TSA ERP System v2.0
            <br />
            <span className="text-green-500">● Online</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-2">
              <h1 className="font-semibold text-gray-900">TSA ERP</h1>
              <div className={cn("w-2 h-2 rounded-full", getRoleColor(currentUser.role))} />
            </div>
            
            <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors relative">
              <BellIcon className="h-6 w-6" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">3</span>
              </div>
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between w-full h-16 px-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {navItems.find(item => item.id === activeItem)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-gray-500">
                Welcome back, {currentUser.name}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Quick stats for desktop */}
              <div className="hidden xl:flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Today</p>
                  <p className="text-sm font-semibold text-green-600">₹247</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Pieces</p>
                  <p className="text-sm font-semibold text-blue-600">45</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Jobs</p>
                  <p className="text-sm font-semibold text-purple-600">3</p>
                </div>
              </div>
              
              <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors relative">
                <BellIcon className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="h-full">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <div className="lg:hidden bg-white border-t border-gray-200 px-2 py-2">
            <div className="flex items-center justify-around">
              {navItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const isActive = activeItem === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveItem(item.id);
                      if (onViewChange) onViewChange(item.id);
                    }}
                    className={cn(
                      "flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors min-w-0",
                      isActive
                        ? "text-blue-600"
                        : "text-gray-500"
                    )}
                  >
                    <Icon className={cn(
                      "h-6 w-6 flex-shrink-0",
                      isActive ? "text-blue-600" : "text-gray-400"
                    )} />
                    <span className={cn(
                      "text-xs font-medium truncate",
                      isActive ? "text-blue-600" : "text-gray-500"
                    )}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="w-1 h-1 bg-blue-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileFriendlyLayout;