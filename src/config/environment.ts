// Environment Configuration Service
// Centralized configuration management for development and production

export interface EnvironmentConfig {
  environment: 'development' | 'production' | 'testing';
  isDevelopment: boolean;
  isProduction: boolean;
  isTesting: boolean;
  firebase: {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
  };
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  app: {
    name: string;
    version: string;
    enableMockData: boolean;
    autoRefreshInterval: number;
  };
  features: {
    enableDevTools: boolean;
    enablePWA: boolean;
    enableAnalytics: boolean;
    enableOfflineMode: boolean;
    enablePushNotifications: boolean;
    enableErrorReporting: boolean;
    enablePerformanceMonitoring: boolean;
    enableHotReload: boolean;
    useFirebaseEmulators: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    debugMode: boolean;
  };
  build: {
    legacySupport: boolean;
    sourcemap: boolean;
  };
}

// Get environment configuration
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const env = import.meta.env.VITE_ENVIRONMENT || import.meta.env.NODE_ENV || 'development';
  
  const isDevelopment = env === 'development';
  const isProduction = env === 'production';
  const isTesting = env === 'testing';

  return {
    environment: env as 'development' | 'production' | 'testing',
    isDevelopment,
    isProduction,
    isTesting,
    
    firebase: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
    },
    
    api: {
      baseUrl: import.meta.env.VITE_API_BASE_URL || (isDevelopment ? 'http://localhost:3002/api' : 'https://api.tsa-erp.com/v1'),
      timeout: 30000,
      retries: isProduction ? 3 : 1,
    },
    
    app: {
      name: import.meta.env.VITE_APP_NAME || `TSA Production ERP ${isDevelopment ? '(Dev)' : ''}`,
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true' || isDevelopment,
      autoRefreshInterval: parseInt(import.meta.env.VITE_AUTO_REFRESH_INTERVAL || '30000'),
    },
    
    features: {
      enableDevTools: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true' || isDevelopment,
      enablePWA: import.meta.env.VITE_ENABLE_PWA === 'true' || true,
      enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true' || true,
      enableOfflineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true' || true,
      enablePushNotifications: import.meta.env.VITE_ENABLE_PUSH_NOTIFICATIONS === 'true' || true,
      enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true' || true,
      enablePerformanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true' || true,
      enableHotReload: import.meta.env.VITE_ENABLE_HOT_RELOAD === 'true' || isDevelopment,
      useFirebaseEmulators: import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true' && isDevelopment,
    },
    
    logging: {
      level: (import.meta.env.VITE_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || (isDevelopment ? 'info' : 'error'),
      debugMode: import.meta.env.VITE_DEBUG_MODE === 'true' || isDevelopment,
    },
    
    build: {
      legacySupport: import.meta.env.VITE_LEGACY_SUPPORT === 'true' || isProduction,
      sourcemap: import.meta.env.VITE_BUILD_SOURCEMAP === 'true' || isDevelopment,
    },
  };
};

// Export singleton instance
export const ENV_CONFIG = getEnvironmentConfig();

// Helper functions
export const isDevelopment = () => ENV_CONFIG.isDevelopment;
export const isProduction = () => ENV_CONFIG.isProduction;
export const isTesting = () => ENV_CONFIG.isTesting;

// Validation function
export const validateEnvironmentConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const config = ENV_CONFIG;

  // Validate required Firebase config
  if (!config.firebase.apiKey) errors.push('Firebase API Key is required');
  if (!config.firebase.authDomain) errors.push('Firebase Auth Domain is required');
  if (!config.firebase.projectId) errors.push('Firebase Project ID is required');

  // Validate API configuration
  if (!config.api.baseUrl) errors.push('API Base URL is required');

  // Production-specific validations
  if (config.isProduction) {
    if (config.app.enableMockData) errors.push('Mock data should be disabled in production');
    if (config.features.enableDevTools) errors.push('Dev tools should be disabled in production');
    if (!config.features.enableErrorReporting) errors.push('Error reporting should be enabled in production');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

// Log configuration on startup
if (ENV_CONFIG.logging.debugMode) {
  console.log('🔧 Environment Configuration:', {
    environment: ENV_CONFIG.environment,
    features: ENV_CONFIG.features,
    validation: validateEnvironmentConfig(),
  });
}

export default ENV_CONFIG;