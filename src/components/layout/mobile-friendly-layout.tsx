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
  ArrowsUpDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';
import { LanguageSwitcherCompact } from '../common/language-switcher';
import './role-responsive.css';

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

// Smart navigation grouping for better organization
const navigationGroups = {
  supervisor: [
    {
      id: 'core',
      label: 'Core',
      icon: HomeIcon,
      items: [
        { icon: HomeIcon, label: 'Dashboard', href: '/supervisor', id: 'dashboard' },
        { icon: DocumentTextIcon, label: 'WIP Entry', href: '/supervisor/complete-wip', id: 'complete-wip-entry' },
        { icon: DocumentTextIcon, label: '📝 WIP Manager', href: '/supervisor/wip-manager', id: 'wip-manager' },
      ]
    },
    {
      id: 'assignment',
      label: 'Work Assignment',
      icon: AdjustmentsHorizontalIcon,
      items: [
        { icon: AdjustmentsHorizontalIcon, label: 'Smart Assignment', href: '/supervisor/smart', id: 'smart-assignment' },
        { icon: HandRaisedIcon, label: 'Drag & Drop', href: '/supervisor/drag-drop', id: 'drag-drop-assignment' },
        { icon: RectangleStackIcon, label: 'Kanban', href: '/supervisor/kanban', id: 'kanban-assignment' },
        { icon: ArrowsUpDownIcon, label: 'Sequential', href: '/supervisor/workflow', id: 'sequential-workflow' },
        { icon: EyeIcon, label: 'Operator Buckets', href: '/supervisor/buckets', id: 'operator-buckets' },
      ]
    },
    {
      id: 'management',
      label: 'Management',
      icon: CubeIcon,
      items: [
        { icon: CubeIcon, label: 'Bundle Assignments', href: '/supervisor/bundle-assignments', id: 'bundle-assignments' },
        { icon: UserGroupIcon, label: 'Operators', href: '/supervisor/operators', id: 'operators' },
        { icon: WrenchIcon, label: 'Parts Issues', href: '/supervisor/parts-issues', id: 'parts-issues' },
        { icon: CogIcon, label: 'Quality Control', href: '/supervisor/quality', id: 'quality' }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: ChartBarIcon,
      items: [
        { icon: ComputerDesktopIcon, label: 'Live Dashboard', href: '/supervisor/live', id: 'live-dashboard' },
        { icon: DocumentChartBarIcon, label: 'Bundle Analytics', href: '/supervisor/bundle-analytics', id: 'bundle-analytics' },
        { icon: ChartBarIcon, label: 'Analytics', href: '/supervisor/analytics', id: 'analytics' }
      ]
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: QrCodeIcon,
      items: [
        { icon: QrCodeIcon, label: 'Barcode Scanner', href: '/supervisor/scanner', id: 'barcode-scanner' },
        { icon: TagIcon, label: 'Label Generator', href: '/supervisor/labels', id: 'label-generator' },
        { icon: DocumentTextIcon, label: 'Templates', href: '/supervisor/sewing-templates', id: 'sewing-templates' }
      ]
    }
  ],
  admin: [
    {
      id: 'core',
      label: 'Core',
      icon: HomeIcon,
      items: [
        { icon: HomeIcon, label: 'Dashboard', href: '/admin', id: 'dashboard' },
      ]
    },
    {
      id: 'security',
      label: 'Security',
      icon: CogIcon,
      items: [
        { icon: UserGroupIcon, label: 'User Management', href: '/admin/user-management', id: 'user-management' },
        { icon: UserCircleIcon, label: 'Login Analytics', href: '/admin/login-analytics', id: 'login-analytics' },
        { icon: CogIcon, label: 'Trusted Devices', href: '/admin/trusted-devices', id: 'trusted-devices' },
        { icon: BellIcon, label: 'Notifications', href: '/admin/workflow-notifications', id: 'workflow-notifications' },
      ]
    },
    {
      id: 'production',
      label: 'Production',
      icon: DocumentTextIcon,
      items: [
        { icon: DocumentTextIcon, label: 'WIP Entry', href: '/admin/complete-wip', id: 'complete-wip-entry' },
        { icon: AdjustmentsHorizontalIcon, label: 'Smart Assignment', href: '/admin/multi-assignment', id: 'multi-assignment' },
        { icon: CubeIcon, label: 'Bundle Assignments', href: '/admin/bundle-assignments', id: 'bundle-assignments' },
        { icon: WrenchIcon, label: 'Parts Issues', href: '/admin/parts-issues', id: 'parts-issues' },
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: ChartBarIcon,
      items: [
        { icon: DocumentChartBarIcon, label: 'Bundle Analytics', href: '/admin/bundle-analytics', id: 'bundle-analytics' },
        { icon: ComputerDesktopIcon, label: 'Live Dashboard', href: '/admin/live', id: 'live-dashboard' },
        { icon: TvIcon, label: 'TV Dashboard', href: '/admin/tv', id: 'tv-dashboard' },
        { icon: ChartBarIcon, label: 'Analytics', href: '/admin/analytics', id: 'analytics' },
      ]
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: QrCodeIcon,
      items: [
        { icon: QrCodeIcon, label: 'Barcode Scanner', href: '/admin/scanner', id: 'barcode-scanner' },
        { icon: TagIcon, label: 'Label Generator', href: '/admin/labels', id: 'label-generator' },
        { icon: DocumentTextIcon, label: 'Templates', href: '/admin/sewing-templates', id: 'sewing-templates' },
      ]
    },
    {
      id: 'system',
      label: 'System',
      icon: UserGroupIcon,
      items: [
        { icon: UserGroupIcon, label: 'Users', href: '/admin/users', id: 'operators' },
        { icon: CogIcon, label: 'Settings', href: '/admin/settings', id: 'settings' }
      ]
    }
  ]
};

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
    { icon: DocumentTextIcon, label: '📝 WIP Manager', href: '/supervisor/wip-manager', id: 'wip-manager' },
    
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
    { icon: DocumentTextIcon, label: '📝 WIP Manager', href: '/management/wip-manager', id: 'wip-manager' },
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
    
    // SECURITY & MONITORING (TOP PRIORITY)
    { icon: UserCircleIcon, label: '🔐 Login Analytics', href: '/admin/login-analytics', id: 'login-analytics' },
    { icon: CogIcon, label: '🛡️ Trusted Devices', href: '/admin/trusted-devices', id: 'trusted-devices' },
    { icon: BellIcon, label: '🔔 Notifications', href: '/admin/workflow-notifications', id: 'workflow-notifications' },
    
    // PRODUCTION MANAGEMENT
    { icon: DocumentTextIcon, label: '3-Step WIP Entry', href: '/admin/complete-wip', id: 'complete-wip-entry' },
    { icon: DocumentTextIcon, label: '📝 WIP Manager', href: '/admin/wip-manager', id: 'wip-manager' },
    { icon: AdjustmentsHorizontalIcon, label: 'Smart Assignment', href: '/admin/multi-assignment', id: 'multi-assignment' },
    { icon: CubeIcon, label: 'Bundle Assignments', href: '/admin/bundle-assignments', id: 'bundle-assignments' },
    { icon: WrenchIcon, label: 'Parts Issues', href: '/admin/parts-issues', id: 'parts-issues' },
    { icon: DocumentChartBarIcon, label: 'Bundle Analytics', href: '/admin/bundle-analytics', id: 'bundle-analytics' },
    
    // OPERATOR TOOLS
    { icon: CubeIcon, label: 'Enhanced Operator', href: '/admin/enhanced-operator', id: 'enhanced-operator' },
    { icon: UserCircleIcon, label: 'Piece Tracker', href: '/admin/piece-tracker', id: 'piece-tracker' },
    { icon: CubeIcon, label: 'Bundle Assignment', href: '/admin/bundle-assignment', id: 'bundle-assignment' },
    
    // DASHBOARDS & MONITORING
    { icon: ComputerDesktopIcon, label: 'Live Dashboard', href: '/admin/live', id: 'live-dashboard' },
    { icon: TvIcon, label: 'TV Dashboard', href: '/admin/tv', id: 'tv-dashboard' },
    { icon: ChartBarIcon, label: 'Analytics', href: '/admin/analytics', id: 'analytics' },
    
    // TOOLS & UTILITIES
    { icon: QrCodeIcon, label: 'Barcode Scanner', href: '/admin/scanner', id: 'barcode-scanner' },
    { icon: TagIcon, label: 'Label Generator', href: '/admin/labels', id: 'label-generator' },
    { icon: DocumentTextIcon, label: 'Sewing Templates', href: '/admin/sewing-templates', id: 'sewing-templates' },
    
    // SYSTEM ADMIN
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Sync activeItem with currentView prop
  useEffect(() => {
    setActiveItem(currentView);
  }, [currentView]);

  // Enhanced device detection for role-specific optimization
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      
      // Role-specific device optimization
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width >= 768 && width <= 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);
  
  // Role-device preference matching
  const isOptimalDevice = () => {
    switch (currentUser.role) {
      case 'operator':
        return deviceType === 'mobile';
      case 'supervisor':
        return deviceType === 'tablet';
      case 'admin':
      case 'management':
        return deviceType === 'desktop';
      default:
        return true;
    }
  };

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
  const navGroups = navigationGroups[currentUser.role as keyof typeof navigationGroups];

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Auto-expand group containing active item
  useEffect(() => {
    if (navGroups) {
      const activeGroup = navGroups.find(group => 
        group.items.some(item => item.id === activeItem)
      );
      if (activeGroup && !expandedGroups.has(activeGroup.id)) {
        setExpandedGroups(prev => new Set([...prev, activeGroup.id]));
      }
    }
  }, [activeItem, navGroups]);

  // Auto-hover sidebar functionality
  const handleSidebarMouseEnter = () => {
    if (!isMobile && sidebarCollapsed) {
      if (hoverTimeout) clearTimeout(hoverTimeout);
      setIsHovering(true);
      setSidebarOpen(true);
    }
  };

  const handleSidebarMouseLeave = () => {
    if (!isMobile && sidebarCollapsed) {
      setIsHovering(false);
      const timeout = setTimeout(() => {
        if (!isHovering) {
          setSidebarOpen(false);
        }
      }, 300); // 300ms delay before closing
      setHoverTimeout(timeout);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

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

  // Get role-specific layout classes
  const getRoleSpecificLayout = () => {
    const base = "flex h-screen overflow-hidden";
    
    switch (currentUser.role) {
      case 'operator':
        // Mobile-first: Prioritize vertical space, larger touch targets
        return `${base} bg-gradient-to-br from-green-50 to-blue-50`;
      case 'supervisor':
        // Tablet-optimized: Balanced layout with medium density
        return `${base} bg-gradient-to-br from-blue-50 to-purple-50`;
      case 'admin':
      case 'management':
        // Desktop-optimized: High information density, multi-column
        return `${base} bg-gradient-to-br from-gray-50 to-slate-100`;
      default:
        return `${base} bg-gray-50`;
    }
  };

  return (
    <div className={cn(
      getRoleSpecificLayout(),
      // Role-specific CSS classes
      `role-${currentUser.role}`,
      currentUser.role === 'operator' && deviceType === 'mobile' && 'operator-mobile',
      currentUser.role === 'supervisor' && deviceType === 'tablet' && 'supervisor-tablet',
      (currentUser.role === 'admin' || currentUser.role === 'management') && deviceType === 'desktop' && 'admin-desktop'
    )}>
      {/* Device Optimization Warning */}
      {!isOptimalDevice() && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded-r-lg shadow-lg max-w-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-yellow-600 text-sm">⚠️</span>
            </div>
            <div className="ml-2">
              <p className="text-xs text-yellow-800">
                <strong>{currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}s</strong> work best on{' '}
                {currentUser.role === 'operator' ? 'mobile' : 
                 currentUser.role === 'supervisor' ? 'tablet' : 'desktop'} devices
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Desktop Hover Trigger Zone */}
      {!isMobile && sidebarCollapsed && !sidebarOpen && (
        <div
          className="fixed left-0 top-0 w-4 h-full z-30 bg-transparent"
          onMouseEnter={handleSidebarMouseEnter}
        />
      )}

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Role-Optimized Sidebar */}
      <div
        id="mobile-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col",
          sidebarOpen || (!isMobile && !sidebarCollapsed) ? "translate-x-0" : "-translate-x-full",
          // Role-specific sidebar widths
          currentUser.role === 'operator' && deviceType === 'mobile' ? "w-80" : // Wider for mobile operators
          currentUser.role === 'supervisor' && deviceType === 'tablet' ? "lg:w-72" : // Medium for tablet supervisors
          (currentUser.role === 'admin' || currentUser.role === 'management') && deviceType === 'desktop' ? "lg:w-64 xl:w-80" : // Adaptive for desktop admin
          "w-72 lg:w-64" // Default
        )}
        onMouseEnter={() => !isMobile && setIsHovering(true)}
        onMouseLeave={handleSidebarMouseLeave}
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

        {/* User Info - Compact for mobile */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-sm", getRoleColor(currentUser.role))}>
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

        {/* Role-Optimized Navigation */}
        <nav className={cn(
          "flex-1 overflow-y-auto min-h-0",
          // Role-specific spacing and density
          currentUser.role === 'operator' ? "px-3 py-4 space-y-2" : // Spacious for mobile operators
          currentUser.role === 'supervisor' ? "px-2 py-3 space-y-1.5" : // Balanced for tablet supervisors
          "px-2 py-2 space-y-1" // Dense for desktop admin/management
        )}>
          {navGroups ? (
            // Grouped navigation for admin/supervisor
            navGroups.map((group) => (
              <div key={group.id} className="space-y-1">
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center px-2 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <group.icon className="w-3 h-3 mr-2 flex-shrink-0" />
                  <span className="truncate">{group.label}</span>
                  <div className={cn(
                    "ml-auto transition-transform duration-200",
                    expandedGroups.has(group.id) ? "rotate-90" : ""
                  )}>
                    <ChevronRightIcon className="w-3 h-3" />
                  </div>
                </button>
                
                {/* Group Items */}
                {expandedGroups.has(group.id) && (
                  <div className="ml-3 space-y-0.5 border-l border-gray-200 pl-2">
                    {group.items.map((item) => {
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
                            "group flex items-center w-full rounded-md transition-all duration-200",
                            // Role-specific button sizing and spacing
                            currentUser.role === 'supervisor' ? "px-3 py-2.5 text-sm font-medium" : // Tablet-friendly
                            "px-2 py-1.5 text-xs", // Default for others
                            isActive
                              ? "bg-blue-50 text-blue-700 shadow-sm"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          )}
                        >
                          <Icon
                            className={cn(
                              "mr-2 flex-shrink-0 transition-colors",
                              // Role-specific icon sizes
                              currentUser.role === 'supervisor' ? "h-5 w-5" : // Larger for tablet
                              "h-4 w-4", // Default
                              isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                          
                          {isActive && (
                            <div className="ml-auto w-1 h-1 bg-blue-500 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          ) : (
            // Flat navigation for operator
            navItems.map((item) => {
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
                    "group flex items-center w-full rounded-lg transition-all duration-200",
                    // Role-specific operator button sizing (mobile-optimized)
                    currentUser.role === 'operator' ? "px-4 py-3 text-base font-semibold" : // Large touch targets for mobile
                    "px-3 py-2 text-sm font-medium", // Default
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "mr-2.5 flex-shrink-0 transition-colors",
                      // Role-specific icon sizes for operators
                      currentUser.role === 'operator' ? "h-6 w-6" : // Larger for mobile touch
                      "h-5 w-5", // Default
                      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  <span className={cn(
                    "truncate",
                    // Role-specific text sizes
                    currentUser.role === 'operator' ? "text-sm font-medium" : // Readable on mobile
                    "text-xs" // Default
                  )}>{item.label}</span>
                  
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  )}
                </button>
              );
            })
          )}
        </nav>

        {/* Footer - Ultra compact */}
        <div className="p-3 border-t border-gray-200">
          {onLogout && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to logout?')) {
                  onLogout();
                }
              }}
              className="w-full mb-2 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              Logout
            </button>
          )}
          <div className="text-xs text-gray-500 text-center">
            <span className="text-green-500">● Online</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header - Role-optimized for device type */}
        <header className={cn(
          "bg-white shadow-sm border-b border-gray-200 lg:hidden",
          // Role-specific header styling
          currentUser.role === 'operator' ? "bg-gradient-to-r from-green-50 to-blue-50" : 
          currentUser.role === 'supervisor' ? "bg-gradient-to-r from-blue-50 to-purple-50" : 
          "bg-white"
        )}>
          <div className={cn(
            "flex items-center justify-between px-3",
            // Role-specific header heights
            currentUser.role === 'operator' ? "h-14" : // Taller for mobile operators
            currentUser.role === 'supervisor' && deviceType === 'tablet' ? "h-16" : // Balanced for tablet supervisors
            "h-12" // Compact for others
          )}>
            <button
              onClick={() => setSidebarOpen(true)}
              className={cn(
                "rounded-md text-gray-600 hover:bg-gray-100 transition-colors",
                // Role-specific touch target sizes
                currentUser.role === 'operator' ? "p-2.5" : // Larger touch area for mobile
                currentUser.role === 'supervisor' ? "p-2" : // Medium for tablet
                "p-1.5" // Compact for others
              )}
            >
              <Bars3Icon className={cn(
                currentUser.role === 'operator' ? "h-6 w-6" : // Larger icons for mobile
                "h-5 w-5"
              )} />
            </button>
            
            <div className="flex items-center space-x-1">
              <h1 className="font-semibold text-gray-900 text-sm">TSA</h1>
              <div className={cn("w-1.5 h-1.5 rounded-full", getRoleColor(currentUser.role))} />
            </div>
            
            <div className="flex items-center space-x-1">
              {/* Language Toggle for all users */}
              <LanguageSwitcherCompact />
              
              {/* Hide notification bell for supervisor role */}
              {currentUser.role !== 'supervisor' && (
                <button className="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 transition-colors relative">
                  <BellIcon className="h-5 w-5" />
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold leading-none">3</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Desktop Header - Role-optimized for different screen sizes */}
        <header className={cn(
          "hidden lg:flex shadow-sm border-b border-gray-200",
          // Role-specific desktop header styling
          currentUser.role === 'admin' || currentUser.role === 'management' 
            ? "bg-gradient-to-r from-slate-50 to-gray-100" 
            : "bg-white"
        )}>
          <div className={cn(
            "flex items-center justify-between w-full px-6",
            // Role-specific desktop header heights
            (currentUser.role === 'admin' || currentUser.role === 'management') && deviceType === 'desktop'
              ? "h-16" // Taller for desktop admin/management with more info
              : "h-14" // Standard height
          )}>
            <div className="flex items-center space-x-4">
              <div>
                <h2 className={cn(
                  "font-semibold text-gray-900",
                  // Role-specific header text sizes
                  (currentUser.role === 'admin' || currentUser.role === 'management') && deviceType === 'desktop'
                    ? "text-xl" // Larger for desktop admin
                    : "text-lg" // Standard
                )}>
                  {navItems.find(item => item.id === activeItem)?.label || 'Dashboard'}
                </h2>
                {/* Role-specific breadcrumbs for admin/management */}
                {(currentUser.role === 'admin' || currentUser.role === 'management') && deviceType === 'desktop' && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Panel
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Role-specific dashboard stats */}
              <div className={cn(
                "items-center space-x-6",
                // Show stats based on role and device
                currentUser.role === 'operator' ? "hidden" : // Hide for operators (mobile-focused)
                currentUser.role === 'supervisor' && deviceType === 'tablet' ? "hidden md:flex" : // Show on medium+ for supervisors
                (currentUser.role === 'admin' || currentUser.role === 'management') && deviceType === 'desktop' ? "hidden lg:flex" : // Show on large+ for admin
                "hidden xl:flex" // Default
              )}>
                {currentUser.role === 'supervisor' && (
                  <>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Active Operators</p>
                      <p className="text-sm font-semibold text-blue-600">12</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Pending Tasks</p>
                      <p className="text-sm font-semibold text-orange-600">8</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Efficiency</p>
                      <p className="text-sm font-semibold text-green-600">94%</p>
                    </div>
                  </>
                )}
                {(currentUser.role === 'admin' || currentUser.role === 'management') && (
                  <>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">System Load</p>
                      <p className="text-sm font-semibold text-green-600">Normal</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Active Users</p>
                      <p className="text-sm font-semibold text-blue-600">47</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Daily Output</p>
                      <p className="text-sm font-semibold text-purple-600">₹18,450</p>
                    </div>
                  </>
                )}
                {currentUser.role === 'operator' && (
                  <>
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
                  </>
                )}
              </div>
              
              {/* Language Toggle for all users */}
              <LanguageSwitcherCompact />
              
              {/* Hide notification bell for supervisor role */}
              {currentUser.role !== 'supervisor' && (
                <button className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors relative">
                  <BellIcon className="h-5 w-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Role-Optimized Main Content Area */}
        <main className={cn(
          "flex-1 overflow-auto",
          // Role-specific content backgrounds
          currentUser.role === 'operator' ? "bg-gradient-to-br from-green-50 to-blue-50" :
          currentUser.role === 'supervisor' ? "bg-gradient-to-br from-blue-50 to-purple-50" :
          "bg-gray-50"
        )}>
          <div className={cn(
            "h-full",
            // Role-specific content padding
            currentUser.role === 'operator' ? "p-2" : // Minimal padding for mobile
            currentUser.role === 'supervisor' && deviceType === 'tablet' ? "p-4" : // Balanced for tablet
            (currentUser.role === 'admin' || currentUser.role === 'management') && deviceType === 'desktop' ? "p-6" : // Spacious for desktop
            "p-4" // Default
          )}>
            {children}
          </div>
        </main>

        {/* Role-Optimized Mobile Bottom Navigation */}
        {isMobile && (
          <div className={cn(
            "lg:hidden border-t border-gray-200",
            // Role-specific bottom nav styling and spacing
            currentUser.role === 'operator' 
              ? "bg-gradient-to-r from-green-50 to-blue-50 px-2 py-2" // More space for mobile operators
              : "bg-white px-1 py-1" // Compact for others
          )}>
            <div className={cn(
              "flex items-center",
              currentUser.role === 'operator' ? "justify-around" : "justify-around" // Consistent spacing
            )}>
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
                      "flex flex-col items-center rounded-lg transition-colors min-w-0",
                      // Role-specific bottom nav button sizing
                      currentUser.role === 'operator' 
                        ? "space-y-1 px-3 py-2.5" // Larger touch targets for operators
                        : "space-y-0.5 px-2 py-1.5", // Compact for others
                      isActive
                        ? "text-blue-600"
                        : "text-gray-500"
                    )}
                  >
                    <Icon className={cn(
                      "flex-shrink-0",
                      // Role-specific bottom nav icon sizes
                      currentUser.role === 'operator' ? "h-6 w-6" : "h-5 w-5", // Larger for operators
                      isActive ? "text-blue-600" : "text-gray-400"
                    )} />
                    <span className={cn(
                      "font-medium truncate",
                      // Role-specific bottom nav text sizes
                      currentUser.role === 'operator' ? "text-sm max-w-16" : "text-xs max-w-12", // Larger for operators
                      isActive ? "text-blue-600" : "text-gray-500"
                    )}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className={cn(
                        "bg-blue-600 rounded-full",
                        // Role-specific active indicators
                        currentUser.role === 'operator' ? "w-2 h-1" : "w-1 h-0.5" // Larger for operators
                      )} />
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