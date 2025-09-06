import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Card, CardBody, CardHeader, Button, Input, 
  Text, H2, Flex, Divider, Badge, Link
} from '@/shared/components/ui';
import { useAuthStore } from '@/app/store/auth-store';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';
import { useLoadingState } from '@/shared/hooks/useLoadingState';
import { User, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/utils';

interface LoginFormProps {
  className?: string;
  redirectTo?: string;
}

const demoUsers = [
  {
    username: 'demo.operator',
    role: 'Operator',
    description: 'Production line worker',
    badge: 'operator',
  },
  {
    username: 'demo.supervisor',
    role: 'Supervisor',
    description: 'Production supervisor',
    badge: 'supervisor',
  },
  {
    username: 'demo.manager',
    role: 'Manager',
    description: 'Production manager',
    badge: 'management',
  },
  {
    username: 'demo.admin',
    role: 'Administrator',
    description: 'System administrator',
    badge: 'admin',
  },
];

export const LoginForm: React.FC<LoginFormProps> = ({ 
  className, 
  redirectTo 
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(state => state.login);
  const clearError = useAuthStore(state => state.clearError);
  const authError = useAuthStore(state => state.error);
  const { handleError } = useErrorHandler();
  const { isLoading, withLoading } = useLoadingState();

  // Clear any existing auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = withLoading(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      handleError('Please enter your username');
      return;
    }

    if (!password) {
      handleError('Please enter your password');
      return;
    }

    try {
      await login({ 
        username: username.trim(), 
        password, 
        rememberMe 
      });
      
      // Redirect after successful login
      const from = (location.state as any)?.from?.pathname || redirectTo || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by the auth store and error handler
      console.error('Login failed:', error);
    }
  });

  const handleDemoLogin = (demoUsername: string) => {
    setUsername(demoUsername);
    setPassword('password123');
  };

  const handleQuickLogin = withLoading(async (demoUsername: string) => {
    try {
      await login({ 
        username: demoUsername, 
        password: 'password123', 
        rememberMe: false 
      });
      
      const from = (location.state as any)?.from?.pathname || redirectTo || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Quick login failed:', error);
    }
  });

  return (
    <div className={cn(
      'min-h-screen flex items-center justify-center',
      'bg-gradient-to-br from-primary-50 to-secondary-100',
      'dark:from-secondary-950 dark:to-secondary-900',
      'px-4 py-12',
      className
    )}>
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6">
            <Text weight="bold" className="text-white text-2xl">T</Text>
          </div>
          <H2 className="mb-2">Welcome to TSA ERP</H2>
          <Text color="muted">
            Sign in to access your production dashboard
          </Text>
        </div>

        {/* Login Form */}
        <Card variant="elevated" className="backdrop-blur-sm">
          <CardHeader className="pb-4">
            <Text weight="semibold" className="text-center">
              Sign In
            </Text>
          </CardHeader>
          
          <CardBody className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                leftIcon={<User className="w-4 h-4" />}
                error={authError && authError.includes('username') ? authError : undefined}
                required
                autoComplete="username"
                disabled={isLoading}
              />

              {/* Password Input */}
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  leftIcon={<LogIn className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-secondary-400 hover:text-secondary-600 focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  error={authError && !authError.includes('username') ? authError : undefined}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                    disabled={isLoading}
                  />
                  <Text size="sm">Remember me</Text>
                </label>
                
                <Link href="#" className="text-sm">
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <Divider className="my-6" />

            {/* Demo Users Section */}
            <div className="space-y-4">
              <Text size="sm" weight="medium" className="text-center" color="muted">
                Demo Users - Click to try different roles
              </Text>
              
              <div className="grid grid-cols-2 gap-2">
                {demoUsers.map((demo) => (
                  <button
                    key={demo.username}
                    onClick={() => handleDemoLogin(demo.username)}
                    disabled={isLoading}
                    className={cn(
                      'p-3 text-left rounded-lg border transition-all duration-200',
                      'hover:bg-secondary-50 dark:hover:bg-secondary-800',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'border-secondary-200 dark:border-secondary-700'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Text size="sm" weight="medium">
                        {demo.role}
                      </Text>
                      <Badge 
                        size="sm" 
                        variant={demo.badge === 'admin' ? 'danger' : 
                                demo.badge === 'management' ? 'warning' :
                                demo.badge === 'supervisor' ? 'info' : 'primary'}
                      >
                        {demo.badge}
                      </Badge>
                    </div>
                    <Text size="xs" color="muted">
                      {demo.description}
                    </Text>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {demoUsers.map((demo) => (
                  <Button
                    key={`quick-${demo.username}`}
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickLogin(demo.username)}
                    disabled={isLoading}
                    className="text-xs"
                  >
                    Quick Login as {demo.role}
                  </Button>
                ))}
              </div>
            </div>

            {/* Help Text */}
            <div className="space-y-2 p-3 bg-info-50 dark:bg-info-900/20 rounded-lg">
              <Flex align="center" gap={2}>
                <AlertCircle className="w-4 h-4 text-info-600 dark:text-info-400" />
                <Text size="sm" weight="medium" color="info">
                  Demo Information
                </Text>
              </Flex>
              <Text size="xs" color="muted">
                Default password for all demo users: <code className="font-mono">password123</code>
              </Text>
              <Text size="xs" color="muted">
                Each role provides different navigation and permissions to demonstrate the system.
              </Text>
            </div>
          </CardBody>
        </Card>

        {/* Footer */}
        <Text size="xs" color="muted" align="center">
          TSA ERP System v2.0 • Secure Authentication
        </Text>
      </div>
    </div>
  );
};