// Operator Module Configuration
// All configuration constants and settings for the operator management system

export const OPERATOR_CONFIG = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.tsa-erp.com/v1',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Real-time Configuration
  realtime: {
    statusUpdateInterval: 30000, // 30 seconds
    connectionRetryDelay: 5000, // 5 seconds
    maxReconnectAttempts: 5,
    heartbeatInterval: 60000, // 1 minute
  },

  // Pagination Configuration
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
    allowedLimits: [10, 20, 50, 100],
  },

  // Validation Configuration
  validation: {
    username: {
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_-]+$/,
    },
    name: {
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
    },
    employeeId: {
      pattern: /^TSA-\d{4}$/,
      prefix: 'TSA-',
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      domains: ['@tsa.com', '@contractor.tsa.com'],
    },
    phone: {
      pattern: /^\+?[1-9]\d{1,14}$/,
    },
    maxConcurrentWork: {
      min: 1,
      max: 10,
      skillLevelLimits: {
        beginner: 2,
        intermediate: 4,
        advanced: 6,
        expert: 8,
      },
    },
  },

  // Business Rules Configuration
  businessRules: {
    // Experience requirements for skill levels (in months)
    skillLevelRequirements: {
      intermediate: 6,
      advanced: 18,
      expert: 36,
    },

    // Performance thresholds
    performance: {
      efficiency: {
        excellent: 0.9,
        good: 0.8,
        average: 0.7,
        needsImprovement: 0.6,
      },
      quality: {
        excellent: 0.95,
        good: 0.85,
        average: 0.75,
        needsImprovement: 0.65,
      },
    },

    // Leave policies (in days)
    leave: {
      sick: 15,
      annual: 21,
      emergency: 7,
      maternity: 98,
      advanceNotice: {
        annual: 7,
        emergency: 0,
      },
    },

    // Shift restrictions
    shifts: {
      nightShift: {
        minExperienceMonths: 6,
      },
      weekendWork: {
        beginnerSupervisionRequired: true,
      },
    },

    // Promotion requirements
    promotion: {
      minBundlesCompleted: {
        intermediate: 50,
        advanced: 200,
        expert: 500,
      },
      minEfficiency: 0.8,
      minQuality: 0.85,
    },
  },

  // UI Configuration
  ui: {
    // Card and list display settings
    cardDisplay: {
      showAvatar: true,
      showStatus: true,
      showEfficiency: true,
      showQuality: true,
    },

    // Filter options
    filters: {
      enableSearch: true,
      enableStatusFilter: true,
      enableMachineFilter: true,
      enableSkillFilter: true,
      enableShiftFilter: true,
    },

    // Avatar configuration
    avatar: {
      defaultSize: 48,
      allowedTypes: ['emoji', 'initials', 'photo'],
      colors: [
        '#3B82F6', // blue
        '#10B981', // green
        '#F59E0B', // yellow
        '#EF4444', // red
        '#8B5CF6', // purple
        '#F97316', // orange
        '#06B6D4', // cyan
        '#84CC16', // lime
      ],
      emojiOptions: [
        '👨‍💼', '👩‍💼', '👨‍🔧', '👩‍🔧', 
        '👨‍🏭', '👩‍🏭', '🧑‍💻', '👨‍💻', 
        '👩‍💻', '🥷', '👤', '🔧'
      ],
    },

    // Table and list settings
    table: {
      defaultSortBy: 'name',
      defaultSortOrder: 'asc',
      stickyHeader: true,
      showPagination: true,
    },

    // Form settings
    form: {
      autoSave: false,
      showValidationOnChange: true,
      requiredFieldMarker: '*',
    },

    // Modal and dialog settings
    modals: {
      confirmDeletion: true,
      autoCloseDelay: 3000, // 3 seconds
    },
  },

  // Cache Configuration
  cache: {
    // React Query cache times
    staleTime: {
      operators: 5 * 60 * 1000, // 5 minutes
      operatorDetail: 2 * 60 * 1000, // 2 minutes
      operatorStatus: 30 * 1000, // 30 seconds
    },
    gcTime: {
      operators: 10 * 60 * 1000, // 10 minutes
      operatorDetail: 5 * 60 * 1000, // 5 minutes
      operatorStatus: 2 * 60 * 1000, // 2 minutes
    },
  },

  // Feature Flags
  features: {
    realTimeStatus: true,
    bulkOperations: true,
    exportData: true,
    importData: true,
    advancedFilters: true,
    performanceAnalytics: true,
    workAssignment: true,
    leaveManagement: true,
    trainingTracking: true,
    promotionWorkflow: true,
  },

  // Localization
  localization: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'ne'],
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    currency: 'NPR',
    currencySymbol: '₹',
  },

  // Security Configuration
  security: {
    permissions: {
      viewOperators: 'view_operators',
      viewOperatorDetails: 'view_operator_details',
      createOperator: 'create_operator',
      editOperator: 'edit_operator',
      deleteOperator: 'delete_operator',
      manageOperatorStatus: 'manage_operator_status',
      assignWork: 'assign_work',
      viewPerformance: 'view_performance',
      manageLeave: 'manage_leave',
      promoteOperator: 'promote_operator',
    },
    
    // Data access levels
    accessLevels: {
      public: ['name', 'employeeId', 'primaryMachine', 'skillLevel'],
      internal: ['email', 'phone', 'address', 'salary'],
      restricted: ['performanceReviews', 'disciplinaryActions'],
    },

    // Rate limiting (requests per time period)
    rateLimits: {
      statusUpdates: {
        requests: 100,
        period: 60 * 1000, // per minute
      },
      dataExport: {
        requests: 10,
        period: 60 * 60 * 1000, // per hour
      },
    },
  },

  // Performance Configuration
  performance: {
    // Optimization settings
    virtualization: {
      enableForLargeLists: true,
      threshold: 100, // items
    },
    
    // Batch processing
    batchOperations: {
      maxBatchSize: 50,
      processingDelay: 100, // ms between batches
    },
    
    // Image optimization
    images: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      thumbnailSize: 200, // pixels
    },
  },

  // Error Handling
  errorHandling: {
    // Retry configuration
    retries: {
      maxAttempts: 3,
      backoffMultiplier: 2,
      initialDelay: 1000,
    },
    
    // Error display
    showStackTrace: process.env.NODE_ENV === 'development',
    logToConsole: process.env.NODE_ENV === 'development',
    logToService: process.env.NODE_ENV === 'production',
  },

  // Monitoring and Analytics
  monitoring: {
    // Performance tracking
    trackUserActions: true,
    trackPerformance: true,
    trackErrors: true,
    
    // Analytics events
    events: {
      operatorCreated: 'operator_created',
      operatorUpdated: 'operator_updated',
      statusChanged: 'operator_status_changed',
      workAssigned: 'work_assigned',
      performanceViewed: 'performance_viewed',
    },
  },

  // Development Configuration
  development: {
    // Debug settings
    enableDebugLogs: process.env.NODE_ENV === 'development',
    showQueryDevtools: process.env.NODE_ENV === 'development',
    
    // Mock data
    useMockData: process.env.REACT_APP_USE_MOCK_DATA === 'true',
    mockDelay: 1000, // ms
    
    // Hot reloading
    enableHotReload: true,
  },
} as const;

// Type-safe configuration access
export type OperatorConfigType = typeof OPERATOR_CONFIG;

// Helper functions for configuration access
export const getOperatorConfig = () => OPERATOR_CONFIG;

export const getApiConfig = () => OPERATOR_CONFIG.api;

export const getValidationConfig = () => OPERATOR_CONFIG.validation;

export const getBusinessRulesConfig = () => OPERATOR_CONFIG.businessRules;

export const getUIConfig = () => OPERATOR_CONFIG.ui;

export const getCacheConfig = () => OPERATOR_CONFIG.cache;

export const getFeatureFlags = () => OPERATOR_CONFIG.features;

export const getSecurityConfig = () => OPERATOR_CONFIG.security;

export const isFeatureEnabled = (feature: keyof typeof OPERATOR_CONFIG.features): boolean => {
  return OPERATOR_CONFIG.features[feature];
};

export const hasPermission = (permission: string): boolean => {
  // This would integrate with your authentication/authorization system
  // For now, return true for development
  return process.env.NODE_ENV === 'development' || 
         Object.values(OPERATOR_CONFIG.security.permissions).includes(permission);
};

export const getEnvironmentConfig = () => ({
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  apiUrl: process.env.REACT_APP_API_BASE_URL,
  firebaseConfig: {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  },
});

// Export default configuration
export default OPERATOR_CONFIG;