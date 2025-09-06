// Work Assignment Module Configuration
// Comprehensive configuration for the work assignment system

export const WORK_ASSIGNMENT_CONFIG = {
  // API Configuration
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'https://api.tsa-erp.com/v1/work-assignments',
    timeout: 45000, // 45 seconds for complex operations
    retryAttempts: 3,
    retryDelay: 2000, // 2 seconds
    batchSize: 50, // Maximum items per batch operation
  },

  // Real-time Configuration
  realtime: {
    statusUpdateInterval: 15000, // 15 seconds (frequent updates for active work)
    assignmentSyncInterval: 30000, // 30 seconds
    queueProcessingInterval: 10000, // 10 seconds
    connectionRetryDelay: 5000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000, // 30 seconds
  },

  // AI Recommendation Configuration
  ai: {
    confidenceThreshold: 50, // Minimum confidence score for recommendations
    autoAssignThreshold: 80, // Auto-assign if confidence > 80%
    maxRecommendations: 5,
    learningDataRetention: 100, // Keep last 100 assignments per operator
    retrainInterval: 24 * 60 * 60 * 1000, // 24 hours
    
    // Weighting factors for recommendations
    weights: {
      skillMatch: 0.25,
      efficiency: 0.20,
      quality: 0.20,
      availability: 0.15,
      workload: 0.10,
      experience: 0.10
    },

    // Performance thresholds
    thresholds: {
      efficiency: {
        excellent: 0.9,
        good: 0.8,
        acceptable: 0.7,
        poor: 0.6
      },
      quality: {
        excellent: 0.95,
        good: 0.85,
        acceptable: 0.75,
        poor: 0.65
      }
    }
  },

  // Assignment Queue Configuration
  queue: {
    maxConcurrentProcessing: 5,
    processingIntervalMs: 10000, // 10 seconds
    maxRetryAttempts: 3,
    retryBackoffMultiplier: 2,
    requestExpirationHours: 24,
    
    // Priority weights
    priorityWeights: {
      urgent: 100,
      high: 75,
      medium: 50,
      low: 25
    },

    // Auto-processing rules
    autoProcessing: {
      enabled: true,
      minConfidenceScore: 75,
      maxQueueSize: 100,
      processingHours: {
        start: 6, // 6 AM
        end: 22   // 10 PM
      }
    }
  },

  // Production Tracking Configuration
  production: {
    // Work session settings
    session: {
      autoSaveInterval: 30000, // 30 seconds
      idleDetectionTimeout: 300000, // 5 minutes
      maxSessionDuration: 12 * 60 * 60 * 1000, // 12 hours
      breakReminderInterval: 2 * 60 * 60 * 1000, // 2 hours
    },

    // Break management
    breaks: {
      required: {
        tea: { duration: 15, isPaid: true, requiredAfterHours: 4 },
        lunch: { duration: 60, isPaid: false, requiredAfterHours: 6 },
        afternoon: { duration: 15, isPaid: true, requiredAfterHours: 8 }
      },
      
      // Break compliance rules
      compliance: {
        maxContinuousWork: 2 * 60, // 2 hours in minutes
        minBreakInterval: 4 * 60, // 4 hours minimum between breaks
        overtimeBreakRequired: true
      }
    },

    // Performance monitoring
    performance: {
      // Real-time calculation intervals
      efficiencyUpdateInterval: 60000, // 1 minute
      qualityCheckInterval: 300000, // 5 minutes
      
      // Alert thresholds
      alerts: {
        lowEfficiency: 0.6, // Below 60%
        criticalQuality: 0.8, // Below 80%
        excessiveBreaks: 0.25, // More than 25% of time
        overtimeWarning: 0.9 // 90% of shift completed
      }
    },

    // Earnings calculation
    earnings: {
      // Bonus and penalty rates
      efficiencyBonus: {
        threshold: 0.9,
        rate: 0.05 // 5% bonus
      },
      
      qualityBonus: {
        threshold: 0.95,
        rate: 0.03 // 3% bonus
      },
      
      qualityPenalty: {
        threshold: 0.8,
        rate: 0.1 // 10% penalty
      },

      // Overtime rates
      overtime: {
        regularMultiplier: 1.0,
        overtimeMultiplier: 1.5, // 150% after 8 hours
        holidayMultiplier: 2.0   // 200% on holidays
      }
    }
  },

  // Business Rules Configuration
  businessRules: {
    // Assignment validation rules
    assignment: {
      // Skill level requirements
      skillRequirements: {
        cutting: { minimum: 'intermediate', preferred: 'advanced' },
        sewing: { minimum: 'beginner', preferred: 'intermediate' },
        embroidery: { minimum: 'advanced', preferred: 'expert' },
        finishing: { minimum: 'beginner', preferred: 'intermediate' }
      },

      // Workload limits
      workload: {
        maxConcurrentAssignments: {
          beginner: 2,
          intermediate: 4,
          advanced: 6,
          expert: 8
        },
        
        // Quality-based limits
        qualityBasedLimits: {
          excellent: 1.2, // 20% more assignments allowed
          good: 1.0,      // Standard limit
          poor: 0.8       // 20% fewer assignments
        }
      },

      // Machine compatibility
      machineRules: {
        primaryMachineBonus: 0.1, // 10% efficiency bonus
        crossTrainingRequired: ['cutting', 'sewing'], // Required for these operations
        exclusiveOperations: ['embroidery'] // Only primary machine operators
      }
    },

    // Quality control rules
    quality: {
      inspectionRules: {
        randomInspectionRate: 0.1, // 10% of completed work
        newOperatorInspectionRate: 0.3, // 30% for new operators
        qualityIssueInspectionRate: 0.5 // 50% after quality issues
      },

      defectLimits: {
        minor: { maxPercentage: 0.05, action: 'warning' },
        major: { maxPercentage: 0.02, action: 'retraining' },
        critical: { maxPercentage: 0.001, action: 'immediate_stop' }
      }
    },

    // Time and attendance rules
    timeRules: {
      // Shift timing
      shifts: {
        morning: { start: '06:00', end: '14:00' },
        afternoon: { start: '14:00', end: '22:00' },
        night: { start: '22:00', end: '06:00' }
      },

      // Overtime rules
      overtime: {
        dailyLimit: 4, // 4 hours per day
        weeklyLimit: 20, // 20 hours per week
        approvalRequired: 2 // Approval required for more than 2 hours
      },

      // Leave and absence
      leave: {
        advanceNoticeRequired: 24, // 24 hours for planned leave
        casualLeaveLimit: 12, // 12 days per year
        sickLeaveLimit: 15 // 15 days per year
      }
    }
  },

  // UI Configuration
  ui: {
    // Dashboard settings
    dashboard: {
      refreshInterval: 30000, // 30 seconds
      showRealTimeMetrics: true,
      autoHideCompletedAfterHours: 8,
      maxVisibleAssignments: 10
    },

    // Kanban board settings
    kanban: {
      columns: ['pending', 'assigned', 'started', 'paused', 'completed'],
      enableDragDrop: true,
      autoRefresh: true,
      showAssignmentDetails: true,
      maxCardsPerColumn: 50
    },

    // Assignment interface
    assignment: {
      showAIRecommendations: true,
      highlightCompatibilityIssues: true,
      showPerformancePredictions: true,
      enableBulkOperations: true
    },

    // Work tracking interface
    workTracking: {
      showRealTimeTimer: true,
      enableBreakReminders: true,
      showEfficiencyAlerts: true,
      autoSaveProgress: true,
      showEarningsEstimate: true
    }
  },

  // Security Configuration
  security: {
    // Permission levels
    permissions: {
      // Operator permissions
      operator: [
        'view_own_assignments',
        'start_work_session',
        'update_work_progress',
        'request_assignment',
        'take_breaks'
      ],

      // Supervisor permissions
      supervisor: [
        'view_all_assignments',
        'assign_work',
        'approve_requests',
        'modify_assignments',
        'view_team_performance',
        'manage_breaks'
      ],

      // Manager permissions
      manager: [
        'bulk_assign_work',
        'override_business_rules',
        'access_analytics',
        'export_reports',
        'configure_system'
      ],

      // Admin permissions
      admin: [
        'all_permissions',
        'manage_users',
        'system_configuration',
        'data_management'
      ]
    },

    // Data access controls
    dataAccess: {
      operatorData: {
        own: ['read', 'write'],
        team: ['read'],
        all: []
      },
      
      performanceData: {
        own: ['read'],
        direct_reports: ['read'],
        all: ['manager', 'admin']
      },

      financialData: {
        own: ['read'],
        all: ['manager', 'admin']
      }
    },

    // Audit logging
    audit: {
      logAssignments: true,
      logStatusChanges: true,
      logPerformanceData: true,
      logConfigChanges: true,
      retentionDays: 365
    }
  },

  // Performance Configuration
  performance: {
    // Caching strategy
    cache: {
      assignments: {
        staleTime: 30 * 1000, // 30 seconds
        gcTime: 5 * 60 * 1000 // 5 minutes
      },
      
      recommendations: {
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000 // 10 minutes
      },

      statistics: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 15 * 60 * 1000 // 15 minutes
      }
    },

    // Optimization settings
    optimization: {
      enableVirtualization: true,
      virtualizationThreshold: 100,
      lazyLoadImages: true,
      debounceSearchMs: 300,
      throttleScrollMs: 100
    },

    // Memory management
    memory: {
      maxCachedAssignments: 1000,
      maxHistoryEntries: 500,
      gcThreshold: 0.8 // Trigger cleanup at 80% capacity
    }
  },

  // Integration Configuration
  integrations: {
    // External systems
    erp: {
      enabled: true,
      syncInterval: 15 * 60 * 1000, // 15 minutes
      endpoints: {
        orders: '/api/orders',
        materials: '/api/materials',
        schedules: '/api/schedules'
      }
    },

    // Notification systems
    notifications: {
      email: {
        enabled: true,
        templates: {
          assignmentCreated: 'assignment-created',
          workCompleted: 'work-completed',
          qualityIssue: 'quality-issue'
        }
      },

      push: {
        enabled: true,
        categories: ['urgent', 'assignment', 'break', 'completion']
      },

      sms: {
        enabled: false, // Disabled by default
        urgentOnly: true
      }
    },

    // Analytics integration
    analytics: {
      enabled: true,
      trackUserActions: true,
      trackPerformanceMetrics: true,
      exportToDataWarehouse: true
    }
  },

  // Development Configuration
  development: {
    // Debug settings
    enableDebugLogs: process.env.NODE_ENV === 'development',
    showPerformanceMetrics: process.env.NODE_ENV === 'development',
    mockDataEnabled: process.env.REACT_APP_USE_MOCK_DATA === 'true',

    // Testing configuration
    testing: {
      enableTestData: process.env.NODE_ENV === 'test',
      resetDataAfterTests: true,
      mockAIRecommendations: true
    },

    // Feature flags
    featureFlags: {
      aiRecommendations: true,
      realTimeTracking: true,
      advancedAnalytics: true,
      bulkOperations: true,
      qualityControlIntegration: true
    }
  }
} as const;

// Type-safe configuration access
export type WorkAssignmentConfigType = typeof WORK_ASSIGNMENT_CONFIG;

// Helper functions
export const getWorkAssignmentConfig = () => WORK_ASSIGNMENT_CONFIG;

export const getAIConfig = () => WORK_ASSIGNMENT_CONFIG.ai;

export const getProductionConfig = () => WORK_ASSIGNMENT_CONFIG.production;

export const getBusinessRules = () => WORK_ASSIGNMENT_CONFIG.businessRules;

export const getUIConfig = () => WORK_ASSIGNMENT_CONFIG.ui;

export const isFeatureEnabled = (feature: string): boolean => {
  return WORK_ASSIGNMENT_CONFIG.development.featureFlags[
    feature as keyof typeof WORK_ASSIGNMENT_CONFIG.development.featureFlags
  ] || false;
};

export const hasPermission = (permission: string, userRole: string): boolean => {
  const rolePermissions = WORK_ASSIGNMENT_CONFIG.security.permissions[
    userRole as keyof typeof WORK_ASSIGNMENT_CONFIG.security.permissions
  ];
  
  return rolePermissions?.includes(permission) || 
         rolePermissions?.includes('all_permissions') || 
         false;
};

export const getPerformanceThresholds = () => WORK_ASSIGNMENT_CONFIG.ai.thresholds;

export const getBreakRequirements = () => WORK_ASSIGNMENT_CONFIG.production.breaks.required;

export const getEarningsConfig = () => WORK_ASSIGNMENT_CONFIG.production.earnings;

// Environment-specific overrides
export const getEnvironmentConfig = () => ({
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  // API endpoints
  apiUrl: process.env.REACT_APP_API_BASE_URL,
  wsUrl: process.env.REACT_APP_WS_URL,
  
  // Feature toggles
  enableRealTime: process.env.REACT_APP_ENABLE_REALTIME !== 'false',
  enableAI: process.env.REACT_APP_ENABLE_AI !== 'false',
  
  // Performance settings
  enableOptimizations: process.env.NODE_ENV === 'production',
  enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true'
});

export default WORK_ASSIGNMENT_CONFIG;