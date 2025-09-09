import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Card, CardBody, CardHeader, Button, Input, 
  Text, H2, Flex, Divider, Badge, Link
} from '@/shared/components/ui';
import { useAuthStore } from '@/app/store/auth-store';
import { useErrorHandler } from '@/shared/hooks/useErrorHandler';
import { useLoadingState } from '@/shared/hooks/useLoadingState';
import { User, LogIn, Eye, EyeOff, AlertCircle, Shield, Clock } from 'lucide-react';
import { trustedDeviceService } from '@/services/trusted-device-service';
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
  const [deviceStats, setDeviceStats] = useState<any>(null);
  const [showTrustedLogin, setShowTrustedLogin] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(state => state.login);
  const clearError = useAuthStore(state => state.clearError);
  const authError = useAuthStore(state => state.error);
  const { handleError } = useErrorHandler();
  const { isLoading, withLoading } = useLoadingState();

  // Load saved credentials and check for trusted device
  useEffect(() => {
    clearError();
    
    const initializeTrustedDevice = async () => {
      // Load remembered credentials from localStorage
      const savedUsername = localStorage.getItem('tsaerp_remembered_username');
      const savedRememberMe = localStorage.getItem('tsaerp_remember_me') === 'true';
      
      if (savedUsername && savedRememberMe) {
        setUsername(savedUsername);
        setRememberMe(true);
        
        // Check if this device is trusted for this user
        const stats = await trustedDeviceService.getDeviceStats(savedUsername);
        setDeviceStats(stats);
        
        // If device is trusted, show quick login option
        if (stats && stats.isTrusted) {
          setShowTrustedLogin(true);
        }
      }
    };
    
    initializeTrustedDevice();
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
      
      // Record successful login attempt for trusted device tracking
      const operatorName = username.trim(); // In real app, get from user object
      await trustedDeviceService.recordLoginAttempt(username.trim(), operatorName, true);
      
      // Handle remember me persistence
      if (rememberMe) {
        localStorage.setItem('tsaerp_remembered_username', username.trim());
        localStorage.setItem('tsaerp_remember_me', 'true');
      } else {
        localStorage.removeItem('tsaerp_remembered_username');
        localStorage.removeItem('tsaerp_remember_me');
      }
      
      // Redirect after successful login
      const from = (location.state as any)?.from?.pathname || redirectTo || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      // Record failed login attempt
      await trustedDeviceService.recordLoginAttempt(username.trim(), username.trim(), false);
      // Error is handled by the auth store and error handler
      console.error('Login failed:', error);
    }
  });

  // Handle trusted device quick login
  const handleTrustedLogin = withLoading(async () => {
    if (!username) return;
    
    try {
      // Verify device is still trusted and perform auto-login
      const canAutoLogin = await trustedDeviceService.performTrustedLogin(username.trim());
      
      if (canAutoLogin) {
        // Use trusted device auto-login
        await login({ 
          username: username.trim(), 
          password: 'auto_trusted_login', // Special token for trusted devices
          rememberMe: true,
          isTrustedDevice: true
        });
        
        const from = (location.state as any)?.from?.pathname || redirectTo || '/dashboard';
        navigate(from, { replace: true });
      } else {
        // Trust expired, show regular login
        setShowTrustedLogin(false);
        handleError('🔒 Device trust has expired. Please login normally to re-establish trust.');
      }
    } catch (error) {
      // If trusted login fails, revoke trust and show regular login
      await trustedDeviceService.revokeTrust(username.trim());
      setShowTrustedLogin(false);
      handleError('⚠️ Trusted login failed. Please login normally.');
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

        {/* Trusted Device Quick Login */}
        {showTrustedLogin && deviceStats && (
          <Card variant="elevated" className="backdrop-blur-sm mb-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardBody className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Shield className="w-6 h-6 text-green-600" />
                <Text weight="bold" className="text-green-800">
                  Trusted Device Detected!
                </Text>
              </div>
              
              <div className="space-y-2">
                <Text size="sm" className="text-green-700">
                  Welcome back, <span className="font-semibold">{username}</span>!
                </Text>
                <Text size="xs" color="muted">
                  You've logged in {deviceStats.successfulLogins} times from this device
                </Text>
              </div>

              <Button
                onClick={handleTrustedLogin}
                loading={isLoading}
                disabled={isLoading}
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                leftIcon={<Shield className="w-4 h-4" />}
              >
                {isLoading ? 'Signing you in...' : 'Quick Login'}
              </Button>

              <button
                onClick={() => setShowTrustedLogin(false)}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
                disabled={isLoading}
              >
                Use regular login instead
              </button>
            </CardBody>
          </Card>
        )}

        {/* Regular Login Form */}
        <Card variant="elevated" className={cn(
          "backdrop-blur-sm",
          showTrustedLogin && "opacity-60"
        )}>
          <CardHeader className="pb-4">
            <Text weight="semibold" className="text-center">
              {showTrustedLogin ? 'Regular Sign In' : 'Sign In'}
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

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mr-2 rounded border-secondary-300 text-primary-600 focus:ring-primary-500 focus:ring-offset-0 focus:ring-2 transition-colors"
                    disabled={isLoading}
                  />
                  <Text size="sm" className="group-hover:text-primary-600 transition-colors">
                    Remember me
                  </Text>
                  <div className="ml-1 group relative">
                    <Text size="xs" color="muted" className="cursor-help">
                      ⓘ
                    </Text>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      Saves your username for next time
                    </div>
                  </div>
                </label>
                
                <Link href="#" className="text-sm text-primary-600 hover:text-primary-700 transition-colors">
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

            {/* Device Login Progress (show when user has some logins but not trusted yet) */}
            {username && !showTrustedLogin && deviceStats && !deviceStats.isTrusted && deviceStats.loginCount > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
                <Flex align="center" gap={2}>
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <Text size="sm" weight="medium" className="text-yellow-800">
                    Device Trust Progress
                  </Text>
                </Flex>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-yellow-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(deviceStats.successfulLogins / 5) * 100}%` }}
                    />
                  </div>
                  <Text size="xs" className="text-yellow-700 font-medium">
                    {deviceStats.successfulLogins}/5
                  </Text>
                </div>
                <Text size="xs" className="text-yellow-700">
                  {5 - deviceStats.successfulLogins} more logins to enable quick login
                </Text>
              </div>
            )}

            {/* Help Text */}
            <div className="space-y-2 p-3 bg-info-50 dark:bg-info-900/20 rounded-lg">
              <Flex align="center" gap={2}>
                <AlertCircle className="w-4 h-4 text-info-600 dark:text-info-400" />
                <Text size="sm" weight="medium" className="text-info-600 dark:text-info-400">
                  Demo Information
                </Text>
              </Flex>
              <Text size="xs" color="muted">
                Default password for all demo users: <code className="font-mono">password123</code>
              </Text>
              <Text size="xs" color="muted">
                Each role provides different navigation and permissions to demonstrate the system.
              </Text>
              <Text size="xs" color="muted">
                💡 Tip: Login 5+ times from same device to enable quick login
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