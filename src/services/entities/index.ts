// src/services/entities/index.ts
// Enhanced Firebase Service Classes for ERP System

// Import and export base service
import { EnhancedBaseFirebaseService } from '../../infrastructure/firebase/base-service';
export { EnhancedBaseFirebaseService };

// Export specific service classes
export { OperatorService } from './operator-service';
export { SupervisorService } from './supervisor-service';
export { WorkItemService } from './work-item-service';
export { BundleService } from './bundle-service';
export { NotificationService } from './notification-service';

// Service instances with default configurations
import { OperatorService } from './operator-service';
import { SupervisorService } from './supervisor-service';
import { WorkItemService } from './work-item-service';
import { BundleService } from './bundle-service';
import { NotificationService } from './notification-service';

// Create optimized service instances with custom configurations
export const operatorService = new OperatorService({
  cache: {
    enabled: true,
    ttl: 10 * 60 * 1000, // 10 minutes for operator data
    maxSize: 500,
    strategy: 'lru',
    invalidateOnUpdate: true,
  },
  retry: {
    enabled: true,
    maxAttempts: 3,
    backoffStrategy: 'exponential',
    baseDelay: 1000,
    maxDelay: 10000,
  },
  performance: {
    enabled: true,
    trackLatency: true,
    trackThroughput: true,
    trackErrors: true,
    sampleRate: 1.0,
  },
});

export const supervisorService = new SupervisorService({
  cache: {
    enabled: true,
    ttl: 15 * 60 * 1000, // 15 minutes for supervisor data
    maxSize: 200,
    strategy: 'lru',
    invalidateOnUpdate: true,
  },
});

export const workItemService = new WorkItemService({
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutes for work items (more dynamic)
    maxSize: 1000,
    strategy: 'lru',
    invalidateOnUpdate: true,
  },
  retry: {
    enabled: true,
    maxAttempts: 5, // More retries for critical work item operations
    backoffStrategy: 'exponential',
    baseDelay: 500,
    maxDelay: 5000,
  },
});

export const bundleService = new BundleService({
  cache: {
    enabled: true,
    ttl: 30 * 60 * 1000, // 30 minutes for bundle data (less frequent changes)
    maxSize: 1000,
    strategy: 'lru',
    invalidateOnUpdate: true,
  },
});

export const notificationService = new NotificationService({
  cache: {
    enabled: true,
    ttl: 2 * 60 * 1000, // 2 minutes for notifications (very dynamic)
    maxSize: 500,
    strategy: 'lru',
    invalidateOnUpdate: false, // Don't invalidate on updates for notifications
  },
  offlineSync: false, // Notifications are not critical for offline sync
});

// Additional service classes that would be implemented similarly
// These are placeholders for the remaining services mentioned in the requirements

// Management Service (for management users)
export class ManagementService extends EnhancedBaseFirebaseService<any> {
  constructor(config?: any) {
    super('management', config);
  }
  
  protected validate(data: any) {
    return { valid: true, errors: [] };
  }
}

// Work Assignment Service
export class WorkAssignmentService extends EnhancedBaseFirebaseService<any> {
  constructor(config?: any) {
    super('workAssignments', config);
  }
  
  protected validate(data: any) {
    return { valid: true, errors: [] };
  }
}

// Production Stats Service
export class ProductionStatsService extends EnhancedBaseFirebaseService<any> {
  constructor(config?: any) {
    super('productionStats', config);
  }
  
  protected validate(data: any) {
    return { valid: true, errors: [] };
  }
}

// Quality Issue Service
export class QualityIssueService extends EnhancedBaseFirebaseService<any> {
  constructor(config?: any) {
    super('qualityIssues', config);
  }
  
  protected validate(data: any) {
    return { valid: true, errors: [] };
  }
}

// System Settings Service
export class SystemSettingsService extends EnhancedBaseFirebaseService<any> {
  constructor(config?: any) {
    super('systemSettings', config);
  }
  
  protected validate(data: any) {
    return { valid: true, errors: [] };
  }
}

// Create instances for additional services
export const managementService = new ManagementService();
export const workAssignmentService = new WorkAssignmentService();
export const productionStatsService = new ProductionStatsService();
export const qualityIssueService = new QualityIssueService();
export const systemSettingsService = new SystemSettingsService();

// Service registry for dynamic access
export const serviceRegistry = {
  operators: operatorService,
  supervisors: supervisorService,
  workItems: workItemService,
  bundles: bundleService,
  notifications: notificationService,
  management: managementService,
  workAssignments: workAssignmentService,
  productionStats: productionStatsService,
  qualityIssues: qualityIssueService,
  systemSettings: systemSettingsService,
} as const;

// Helper function to get service by name
export function getService<T extends keyof typeof serviceRegistry>(serviceName: T) {
  return serviceRegistry[serviceName];
}

// Service health check
export async function checkServiceHealth(): Promise<{
  healthy: boolean;
  services: Record<string, { healthy: boolean; latency?: number; error?: string }>;
}> {
  const results: Record<string, { healthy: boolean; latency?: number; error?: string }> = {};
  
  for (const [name, service] of Object.entries(serviceRegistry)) {
    try {
      const startTime = Date.now();
      const healthCheck = await service.getMetrics();
      const latency = Date.now() - startTime;
      
      results[name] = {
        healthy: true,
        latency,
      };
    } catch (error) {
      results[name] = {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  const allHealthy = Object.values(results).every(result => result.healthy);
  
  return {
    healthy: allHealthy,
    services: results,
  };
}

// Cleanup all services
export function cleanupAllServices(): void {
  Object.values(serviceRegistry).forEach(service => {
    if (typeof service.cleanup === 'function') {
      service.cleanup();
    }
  });
}

// Export types for external use
export type ServiceName = keyof typeof serviceRegistry;
export type ServiceInstance<T extends ServiceName> = typeof serviceRegistry[T];

// Global service configuration
export const GLOBAL_SERVICE_CONFIG = {
  timeout: 30000,
  compression: false,
  offlineSync: true,
  performance: {
    enabled: true,
    trackLatency: true,
    trackThroughput: true,
    trackErrors: true,
    sampleRate: 1.0,
  },
};