import React, { useState } from 'react';
import { 
  Menu, X, Search, Bell, Settings, User, Moon, Sun, Monitor,
  ChevronDown, LogOut, UserCircle, HelpCircle, Globe
} from 'lucide-react';
import { 
  Button, Flex, Text, Badge, NotificationBadge, 
  Dropdown, DropdownOption, Input, PermissionGate 
} from '@/shared/components/ui';
import { useAuthStore, useUser } from '@/app/store/auth-store';
import { usePermissions } from '@/app/hooks/usePermissions';
import { useThemeStore } from '@/app/store/theme-store';
import { LanguageSwitcherCompact } from '@/components/common/language-switcher';
import { SimpleNotificationCenter } from '@/components/notifications/simple-notification-center';
import { cn } from '@/shared/utils';

interface HeaderProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuToggle,
  isMenuOpen = false,
  className
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  
  const user = useUser();
  const permissions = usePermissions();
  const logout = useAuthStore(state => state.logout);
  const { theme, setTheme, toggleTheme, isDark } = useThemeStore();

  const themeOptions: DropdownOption[] = [
    { 
      value: 'light', 
      label: 'Light', 
      icon: <Sun className="w-4 h-4" /> 
    },
    { 
      value: 'dark', 
      label: 'Dark', 
      icon: <Moon className="w-4 h-4" /> 
    },
    { 
      value: 'system', 
      label: 'System', 
      icon: <Monitor className="w-4 h-4" /> 
    },
  ];

  // Build user menu options based on permissions
  const buildUserMenuOptions = (): DropdownOption[] => {
    const options: DropdownOption[] = [
      { 
        value: 'profile', 
        label: 'Profile', 
        icon: <UserCircle className="w-4 h-4" /> 
      },
    ];

    // Settings - only show if user has system access
    if (permissions.hasAnyPermission(['system:settings', 'user:update'])) {
      options.push({ 
        value: 'settings', 
        label: 'Settings', 
        icon: <Settings className="w-4 h-4" /> 
      });
    }

    options.push(
      { 
        value: 'help', 
        label: 'Help & Support', 
        icon: <HelpCircle className="w-4 h-4" /> 
      },
      { 
        value: 'logout', 
        label: 'Sign Out', 
        icon: <LogOut className="w-4 h-4" /> 
      }
    );

    return options;
  };

  const userMenuOptions = buildUserMenuOptions();

  const handleUserMenuSelect = (value: string) => {
    switch (value) {
      case 'logout':
        logout();
        break;
      case 'profile':
        // Navigate to profile
        break;
      case 'settings':
        // Navigate to settings
        break;
      case 'help':
        // Navigate to help
        break;
    }
  };

  const handleThemeSelect = (value: string) => {
    setTheme(value as 'light' | 'dark' | 'system');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Perform search
      console.log('Searching for:', searchQuery);
    }
  };

  return (
    <header className={cn(
      'bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-700',
      'sticky top-0 z-40 w-full backdrop-blur supports-[backdrop-filter]:bg-white/95 dark:supports-[backdrop-filter]:bg-secondary-900/95',
      className
    )}>
      <div className="px-4 sm:px-6 lg:px-8">
        <Flex align="center" justify="between" className="h-16">
          {/* Left Section */}
          <Flex align="center" gap={4}>
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuToggle}
              className="lg:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>

            {/* Logo */}
            <Flex align="center" gap={3}>
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Text weight="bold" className="text-white text-sm">T</Text>
              </div>
              <div className="hidden sm:block">
                <Text weight="bold" size="lg" className="text-secondary-900 dark:text-secondary-100">
                  TSA ERP
                </Text>
                <Text size="xs" color="muted" className="-mt-1">
                  Production System
                </Text>
              </div>
            </Flex>
          </Flex>

          {/* Center Section - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            {showSearch ? (
              <form onSubmit={handleSearch} className="w-full">
                <Input
                  leftIcon={<Search className="w-4 h-4" />}
                  placeholder="Search products, orders, customers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => !searchQuery && setShowSearch(false)}
                  clearable
                  onClear={() => {
                    setSearchQuery('');
                    setShowSearch(false);
                  }}
                  autoFocus
                  className="w-full"
                />
              </form>
            ) : (
              <Button
                variant="ghost"
                leftIcon={<Search className="w-4 h-4" />}
                onClick={() => setShowSearch(true)}
                className="w-full justify-start text-secondary-500 hover:text-secondary-700"
              >
                Search...
              </Button>
            )}
          </div>

          {/* Right Section */}
          <Flex align="center" gap={2}>
            {/* Mobile search button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Language toggle */}
            <div className="hidden sm:block">
              <LanguageSwitcherCompact />
            </div>

            {/* Theme toggle */}
            <div className="hidden sm:block">
              <Dropdown
                options={themeOptions}
                value={theme}
                onSelectionChange={handleThemeSelect}
                placeholder="Theme"
                variant="borderless"
                size="sm"
              />
            </div>

            {/* Quick theme toggle for mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="sm:hidden"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Notifications - accessible to all users */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
              aria-label="Notifications"
            >
              <NotificationBadge count={3}>
                <Bell className="w-4 h-4" />
              </NotificationBadge>
            </Button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-3">
                {/* User info - hidden on mobile */}
                <div className="hidden lg:block text-right">
                  <Text size="sm" weight="medium" className="text-secondary-900 dark:text-secondary-100">
                    {user.name}
                  </Text>
                  <Text size="xs" color="muted" className="-mt-0.5">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Text>
                </div>

                {/* User dropdown */}
                <Dropdown
                  options={userMenuOptions}
                  onSelectionChange={handleUserMenuSelect}
                  placeholder=""
                  variant="borderless"
                  size="sm"
                  className="w-auto"
                >
                  <Button variant="ghost" size="sm" className="p-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <Text weight="bold" className="text-white text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </Text>
                    </div>
                    <ChevronDown className="w-3 h-3 ml-1 hidden sm:block" />
                  </Button>
                </Dropdown>
              </div>
            ) : (
              <Button size="sm" onClick={() => {/* Navigate to login */}}>
                Sign In
              </Button>
            )}
          </Flex>
        </Flex>

        {/* Mobile search bar */}
        {showSearch && (
          <div className="md:hidden py-3 border-t border-secondary-200 dark:border-secondary-700">
            <form onSubmit={handleSearch}>
              <Input
                leftIcon={<Search className="w-4 h-4" />}
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                clearable
                onClear={() => setSearchQuery('')}
                autoFocus
              />
            </form>
          </div>
        )}

        {/* Mobile notifications panel */}
        {showNotifications && (
          <div className="md:hidden py-3 border-t border-secondary-200 dark:border-secondary-700">
            <Text weight="medium" className="mb-3">Notifications</Text>
            <div className="space-y-2">
              <div className="p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                <Text size="sm" weight="medium">New order received</Text>
                <Text size="xs" color="muted">Order #1234 from ABC Company</Text>
              </div>
              <div className="p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                <Text size="sm" weight="medium">Production milestone reached</Text>
                <Text size="xs" color="muted">Line A completed 500 units</Text>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Center - Desktop */}
      {showNotifications && (
        <div className="hidden md:block">
          <SimpleNotificationCenter 
            open={showNotifications} 
            onClose={() => setShowNotifications(false)}
            className="fixed top-16 right-4 z-50"
          />
        </div>
      )}
    </header>
  );
};