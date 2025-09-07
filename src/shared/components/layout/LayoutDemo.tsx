import React, { useState } from 'react';
import { 
  Container, Stack, Grid, Card, CardHeader, CardBody, 
  H1, H2, H3, Text, Button, Badge, Flex, Code
} from '@/shared/components/ui';
import { useThemeStore } from '@/app/store/theme-store';
import { useAuthStore } from '@/app/store/auth-store';
import { Sun, Moon, Monitor, User, Settings, LogOut } from 'lucide-react';

export const LayoutDemo: React.FC = () => {
  const { theme, isDark, setTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const [demoRole, setDemoRole] = useState<'operator' | 'supervisor' | 'management' | 'admin'>('operator');

  const mockLogin = (role: 'operator' | 'supervisor' | 'management' | 'admin') => {
    const mockUsers = {
      operator: {
        id: 'demo-operator',
        username: 'demo.operator',
        name: 'Demo Operator',
        role: 'operator' as const,
        email: 'operator@tsa-erp.com',
        permissions: ['read_work', 'update_work'],
        active: true,
        createdAt: new Date(),
      },
      supervisor: {
        id: 'demo-supervisor',
        username: 'demo.supervisor',
        name: 'Demo Supervisor',
        role: 'supervisor' as const,
        email: 'supervisor@tsa-erp.com',
        permissions: ['read_all', 'assign_work', 'quality_control'],
        active: true,
        createdAt: new Date(),
      },
      management: {
        id: 'demo-management',
        username: 'demo.manager',
        name: 'Demo Manager',
        role: 'management' as const,
        email: 'manager@tsa-erp.com',
        permissions: ['read_all', 'manage_orders', 'view_reports'],
        active: true,
        createdAt: new Date(),
      },
      admin: {
        id: 'demo-admin',
        username: 'demo.admin',
        name: 'Demo Administrator',
        role: 'admin' as const,
        email: 'admin@tsa-erp.com',
        permissions: ['read_all', 'write_all', 'admin_access'],
        active: true,
        createdAt: new Date(),
      },
    };

    // Mock login by setting user in store
    useAuthStore.setState({
      user: mockUsers[role],
      isAuthenticated: true,
      isLoading: false,
      error: null,
      sessionExpiry: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    });

    setDemoRole(role);
  };

  const features = [
    {
      title: 'Responsive Design',
      description: 'Mobile-first layout that adapts to all screen sizes',
      status: 'completed',
    },
    {
      title: 'Role-Based Navigation',
      description: 'Dynamic navigation menu based on user role and permissions',
      status: 'completed',
    },
    {
      title: 'Dark/Light Mode',
      description: 'Full theme support with system preference detection',
      status: 'completed',
    },
    {
      title: 'Protected Routes',
      description: 'Route-level authentication and authorization',
      status: 'completed',
    },
    {
      title: 'Mobile Navigation',
      description: 'Collapsible sidebar with mobile-optimized UX',
      status: 'completed',
    },
    {
      title: 'Search Integration',
      description: 'Global search with responsive behavior',
      status: 'completed',
    },
  ];

  const navigationStructure = [
    {
      section: 'Operator',
      items: ['Dashboard', 'My Work (Assigned, History)', 'Earnings', 'Schedule'],
      roles: ['operator'],
    },
    {
      section: 'Supervisor',
      items: ['Dashboard', 'Production (Assignment, Progress, Quality)', 'Schedule'],
      roles: ['supervisor'],
    },
    {
      section: 'Management',
      items: ['Dashboard', 'Production', 'Orders', 'Inventory', 'Reports', 'Schedule'],
      roles: ['management'],
    },
    {
      section: 'Admin',
      items: ['All sections', 'User Management', 'System Settings', 'Machine Config'],
      roles: ['admin'],
    },
  ];

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
      <Container size="2xl" className="py-8">
        <Stack spacing={8}>
          {/* Header */}
          <div className="text-center">
            <H1 className="mb-4">TSA ERP Navigation & Layout System</H1>
            <Text size="xl" color="muted" className="mb-8">
              Comprehensive layout system with responsive navigation and theme support
            </Text>
          </div>

          {/* Theme Controls */}
          <Card>
            <CardHeader>
              <H3>Theme Controls</H3>
              <Text color="muted">
                Test the dark/light mode functionality
              </Text>
            </CardHeader>
            <CardBody>
              <Flex gap={4} wrap>
                <Button
                  variant={theme === 'light' ? 'primary' : 'outline'}
                  leftIcon={<Sun className="w-4 h-4" />}
                  onClick={() => setTheme('light')}
                >
                  Light
                </Button>
                <Button
                  variant={theme === 'dark' ? 'primary' : 'outline'}
                  leftIcon={<Moon className="w-4 h-4" />}
                  onClick={() => setTheme('dark')}
                >
                  Dark
                </Button>
                <Button
                  variant={theme === 'system' ? 'primary' : 'outline'}
                  leftIcon={<Monitor className="w-4 h-4" />}
                  onClick={() => setTheme('system')}
                >
                  System
                </Button>
              </Flex>
              <div className="mt-4 p-4 bg-secondary-100 dark:bg-secondary-800 rounded-lg">
                <Text size="sm">
                  Current theme: <Code>{theme}</Code> | 
                  Applied mode: <Code>{isDark ? 'dark' : 'light'}</Code>
                </Text>
              </div>
            </CardBody>
          </Card>

          {/* Role-Based Navigation Demo */}
          <Card>
            <CardHeader>
              <H3>Role-Based Navigation Demo</H3>
              <Text color="muted">
                Switch between different user roles to see how navigation adapts
              </Text>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                {/* Current User */}
                {user ? (
                  <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <Flex align="center" gap={4}>
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <Text weight="bold" className="text-white">
                          {user.name.charAt(0)}
                        </Text>
                      </div>
                      <div>
                        <Text weight="semibold">{user.name}</Text>
                        <Text size="sm" color="muted">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)} • {user.email}
                        </Text>
                      </div>
                      <Button size="sm" variant="outline" onClick={logout}>
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </Flex>
                  </div>
                ) : (
                  <div className="p-4 bg-secondary-100 dark:bg-secondary-800 rounded-lg">
                    <Text>No user logged in. Select a role below to demo the navigation.</Text>
                  </div>
                )}

                {/* Role Buttons */}
                <div>
                  <Text weight="medium" className="mb-3">Switch Role:</Text>
                  <Flex gap={3} wrap>
                    <Button
                      variant={demoRole === 'operator' ? 'primary' : 'outline'}
                      onClick={() => mockLogin('operator')}
                      leftIcon={<User className="w-4 h-4" />}
                    >
                      Operator
                    </Button>
                    <Button
                      variant={demoRole === 'supervisor' ? 'primary' : 'outline'}
                      onClick={() => mockLogin('supervisor')}
                      leftIcon={<Settings className="w-4 h-4" />}
                    >
                      Supervisor
                    </Button>
                    <Button
                      variant={demoRole === 'management' ? 'primary' : 'outline'}
                      onClick={() => mockLogin('management')}
                      leftIcon={<User className="w-4 h-4" />}
                    >
                      Management
                    </Button>
                    <Button
                      variant={demoRole === 'admin' ? 'primary' : 'outline'}
                      onClick={() => mockLogin('admin')}
                      leftIcon={<Settings className="w-4 h-4" />}
                    >
                      Admin
                    </Button>
                  </Flex>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Navigation Structure */}
          <Card>
            <CardHeader>
              <H3>Navigation Structure by Role</H3>
              <Text color="muted">
                Each role sees different navigation items based on their permissions
              </Text>
            </CardHeader>
            <CardBody>
              <Grid cols={1} colsMd={2} gap={6}>
                {navigationStructure.map((nav) => (
                  <div key={nav.section} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <H4>{nav.section}</H4>
                      <Badge size="sm" variant="secondary">
                        {nav.section.toLowerCase()}
                      </Badge>
                    </div>
                    <ul className="space-y-2">
                      {nav.items.map((item, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                          <Text size="sm">{item}</Text>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </Grid>
            </CardBody>
          </Card>

          {/* Features Overview */}
          <Card>
            <CardHeader>
              <H3>Layout System Features</H3>
              <Text color="muted">
                Comprehensive navigation and layout features
              </Text>
            </CardHeader>
            <CardBody>
              <Grid cols={1} colsMd={2} colsLg={3} gap={4}>
                {features.map((feature) => (
                  <Card key={feature.title} variant="outlined" size="sm">
                    <CardHeader>
                      <Flex align="center" justify="between">
                        <H4 size="sm">{feature.title}</H4>
                        <Badge size="sm" variant="success">
                          ✓
                        </Badge>
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      <Text size="sm" color="muted">
                        {feature.description}
                      </Text>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </CardBody>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <H3>Technical Implementation</H3>
              <Text color="muted">
                Key technical aspects of the navigation system
              </Text>
            </CardHeader>
            <CardBody>
              <Grid cols={1} colsLg={2} gap={8}>
                <div>
                  <H4 className="mb-4">Routing & Protection</H4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <Code>React Router</Code>
                      <Text size="sm">Modern routing with nested routes</Text>
                    </li>
                    <li className="flex items-start gap-3">
                      <Code>ProtectedRoute</Code>
                      <Text size="sm">Route-level authentication</Text>
                    </li>
                    <li className="flex items-start gap-3">
                      <Code>Role Guards</Code>
                      <Text size="sm">Permission-based access control</Text>
                    </li>
                    <li className="flex items-start gap-3">
                      <Code>Lazy Loading</Code>
                      <Text size="sm">Code splitting for performance</Text>
                    </li>
                  </ul>
                </div>

                <div>
                  <H4 className="mb-4">State Management</H4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <Code>Zustand</Code>
                      <Text size="sm">Lightweight state management</Text>
                    </li>
                    <li className="flex items-start gap-3">
                      <Code>Theme Store</Code>
                      <Text size="sm">Persistent theme preferences</Text>
                    </li>
                    <li className="flex items-start gap-3">
                      <Code>Auth Store</Code>
                      <Text size="sm">Session management</Text>
                    </li>
                    <li className="flex items-start gap-3">
                      <Code>UI Store</Code>
                      <Text size="sm">Global UI state</Text>
                    </li>
                  </ul>
                </div>
              </Grid>
            </CardBody>
          </Card>

          {/* Instructions */}
          <Card variant="filled">
            <CardBody>
              <H4 className="mb-4">How to Test</H4>
              <ol className="space-y-2 list-decimal list-inside">
                <li><Text size="sm">Switch between different user roles using the buttons above</Text></li>
                <li><Text size="sm">Observe how the sidebar navigation changes based on role</Text></li>
                <li><Text size="sm">Test theme switching (Light/Dark/System)</Text></li>
                <li><Text size="sm">Resize your browser to test responsive behavior</Text></li>
                <li><Text size="sm">On mobile, use the hamburger menu to toggle sidebar</Text></li>
                <li><Text size="sm">Try accessing different routes to see protection in action</Text></li>
              </ol>
            </CardBody>
          </Card>
        </Stack>
      </Container>
    </div>
  );
};