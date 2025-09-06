// src/app/providers/query-keys.ts
// Centralized query key management for consistent caching

export const queryKeys = {
  // User-related queries
  users: {
    all: ['users'] as const,
    operators: () => [...queryKeys.users.all, 'operators'] as const,
    supervisors: () => [...queryKeys.users.all, 'supervisors'] as const,
    management: () => [...queryKeys.users.all, 'management'] as const,
    byId: (id: string) => [...queryKeys.users.all, 'byId', id] as const,
    byRole: (role: string) => [...queryKeys.users.all, 'byRole', role] as const,
    profile: (userId: string) => [...queryKeys.users.all, 'profile', userId] as const,
  },

  // Work management queries
  work: {
    all: ['work'] as const,
    bundles: () => [...queryKeys.work.all, 'bundles'] as const,
    workItems: () => [...queryKeys.work.all, 'workItems'] as const,
    assignments: () => [...queryKeys.work.all, 'assignments'] as const,
    completions: () => [...queryKeys.work.all, 'completions'] as const,
    
    // Filtered queries
    bundlesByStatus: (status: string) => [...queryKeys.work.bundles(), 'status', status] as const,
    workItemsByOperator: (operatorId: string) => [...queryKeys.work.workItems(), 'operator', operatorId] as const,
    workItemsByMachine: (machineType: string) => [...queryKeys.work.workItems(), 'machine', machineType] as const,
    availableWork: () => [...queryKeys.work.workItems(), 'available'] as const,
    selfAssignedWork: () => [...queryKeys.work.workItems(), 'selfAssigned'] as const,
    
    // Individual items
    bundleById: (id: string) => [...queryKeys.work.bundles(), 'byId', id] as const,
    workItemById: (id: string) => [...queryKeys.work.workItems(), 'byId', id] as const,
  },

  // WIP (Work In Progress) queries
  wip: {
    all: ['wip'] as const,
    entries: () => [...queryKeys.wip.all, 'entries'] as const,
    rolls: () => [...queryKeys.wip.all, 'rolls'] as const,
    byArticle: (article: string) => [...queryKeys.wip.all, 'article', article] as const,
  },

  // Quality management queries
  quality: {
    all: ['quality'] as const,
    issues: () => [...queryKeys.quality.all, 'issues'] as const,
    damageReports: () => [...queryKeys.quality.all, 'damageReports'] as const,
    
    // Filtered queries
    issuesByBundle: (bundleId: string) => [...queryKeys.quality.issues(), 'bundle', bundleId] as const,
    issuesByOperator: (operatorId: string) => [...queryKeys.quality.issues(), 'operator', operatorId] as const,
    damageReportsBySupervisor: (supervisorId: string) => [...queryKeys.quality.damageReports(), 'supervisor', supervisorId] as const,
    pendingDamageReports: () => [...queryKeys.quality.damageReports(), 'pending'] as const,
  },

  // Earnings and payment queries
  earnings: {
    all: ['earnings'] as const,
    wageRecords: () => [...queryKeys.earnings.all, 'wageRecords'] as const,
    operatorWallets: () => [...queryKeys.earnings.all, 'operatorWallets'] as const,
    
    // Individual queries
    operatorEarnings: (operatorId: string) => [...queryKeys.earnings.wageRecords(), 'operator', operatorId] as const,
    walletBalance: (operatorId: string) => [...queryKeys.earnings.operatorWallets(), 'balance', operatorId] as const,
    earningsHistory: (operatorId: string, dateRange?: { from: string; to: string }) => [
      ...queryKeys.earnings.operatorEarnings(operatorId),
      'history',
      ...(dateRange ? [dateRange.from, dateRange.to] : [])
    ] as const,
  },

  // Notification queries
  notifications: {
    all: ['notifications'] as const,
    byUser: (userId: string) => [...queryKeys.notifications.all, 'user', userId] as const,
    unread: (userId: string) => [...queryKeys.notifications.byUser(userId), 'unread'] as const,
    byType: (userId: string, type: string) => [...queryKeys.notifications.byUser(userId), 'type', type] as const,
  },

  // Analytics and reporting queries
  analytics: {
    all: ['analytics'] as const,
    production: () => [...queryKeys.analytics.all, 'production'] as const,
    efficiency: () => [...queryKeys.analytics.all, 'efficiency'] as const,
    quality: () => [...queryKeys.analytics.all, 'quality'] as const,
    
    // Time-based analytics
    dailyStats: (date: string) => [...queryKeys.analytics.production(), 'daily', date] as const,
    weeklyStats: (weekStart: string) => [...queryKeys.analytics.production(), 'weekly', weekStart] as const,
    monthlyStats: (month: string) => [...queryKeys.analytics.production(), 'monthly', month] as const,
    
    // Operator-specific analytics
    operatorEfficiency: (operatorId: string, dateRange?: { from: string; to: string }) => [
      ...queryKeys.analytics.efficiency(),
      'operator',
      operatorId,
      ...(dateRange ? [dateRange.from, dateRange.to] : [])
    ] as const,
  },

  // System configuration queries
  config: {
    all: ['config'] as const,
    systemSettings: () => [...queryKeys.config.all, 'systemSettings'] as const,
    machineConfigs: () => [...queryKeys.config.all, 'machineConfigs'] as const,
    articleTemplates: () => [...queryKeys.config.all, 'articleTemplates'] as const,
    sizeConfigs: () => [...queryKeys.config.all, 'sizeConfigs'] as const,
  },

  // Real-time data queries
  realtime: {
    all: ['realtime'] as const,
    operatorStatus: () => [...queryKeys.realtime.all, 'operatorStatus'] as const,
    workProgress: () => [...queryKeys.realtime.all, 'workProgress'] as const,
    liveMetrics: () => [...queryKeys.realtime.all, 'liveMetrics'] as const,
    systemHealth: () => [...queryKeys.realtime.all, 'systemHealth'] as const,
  }
} as const;

// Query key validation utilities
export const invalidateUserQueries = (queryClient: any, userId?: string) => {
  if (userId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.byId(userId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.users.profile(userId) });
  } else {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  }
};

export const invalidateWorkQueries = (queryClient: any, operatorId?: string) => {
  if (operatorId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.work.workItemsByOperator(operatorId) });
  }
  queryClient.invalidateQueries({ queryKey: queryKeys.work.all });
};

export const invalidateEarningsQueries = (queryClient: any, operatorId: string) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.earnings.operatorEarnings(operatorId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.earnings.walletBalance(operatorId) });
};

// Cache management utilities
export const prefetchOperatorData = async (queryClient: any, operatorId: string) => {
  // Prefetch common operator data
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.work.workItemsByOperator(operatorId),
      staleTime: 2 * 60 * 1000, // 2 minutes
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.earnings.walletBalance(operatorId),
      staleTime: 1 * 60 * 1000, // 1 minute
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.notifications.unread(operatorId),
      staleTime: 30 * 1000, // 30 seconds
    })
  ]);
};