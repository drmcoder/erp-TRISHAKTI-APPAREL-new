// Error Reporting and Monitoring Service
// Comprehensive error tracking and performance monitoring system

import { ENV_CONFIG } from '../config/environment';

interface ErrorContext {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  contexts?: {
    [key: string]: any;
  };
  tags?: {
    [key: string]: string;
  };
  level?: 'error' | 'warning' | 'info' | 'debug';
  fingerprint?: string[];
  extra?: {
    [key: string]: any;
  };
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit?: string;
  timestamp: Date;
  tags?: { [key: string]: string };
}

interface UserAction {
  action: string;
  element?: string;
  page: string;
  timestamp: Date;
  userId?: string;
  metadata?: any;
}

class ErrorReportingService {
  private apiEndpoint = process.env.VITE_ERROR_REPORTING_ENDPOINT || '/api/errors';
  private performanceEndpoint = process.env.VITE_PERFORMANCE_ENDPOINT || '/api/performance';
  private sessionId: string;
  private userId?: string;
  private userRole?: string;
  private errorQueue: any[] = [];
  private performanceQueue: PerformanceMetric[] = [];
  private isOnline = true;
  private maxQueueSize = 100;
  private flushInterval = 10000; // 10 seconds
  private errorEndpointAvailable = true; // Track if endpoint is available
  private performanceEndpointAvailable = true; // Track if endpoint is available

  constructor() {
    this.sessionId = this.generateSessionId();
    
    // In development or when no backend is available, disable remote error reporting endpoints 
    // to avoid 404 errors when no backend API is available
    if (ENV_CONFIG.environment === 'development' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.includes('192.168')) {
      this.errorEndpointAvailable = false;
      this.performanceEndpointAvailable = false;
      if (ENV_CONFIG.logging.debugMode) {
        console.log('🔧 Local/Development mode: Error reporting endpoints disabled');
      }
    }
    
    this.setupGlobalErrorHandlers();
    this.setupPerformanceMonitoring();
    this.setupNetworkStatusListener();
    this.startPeriodicFlush();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize user context
  setUser(user: { id: string; email: string; role: string }) {
    this.userId = user.id;
    this.userRole = user.role;
  }

  // Capture JavaScript exceptions
  async captureException(error: Error, context?: ErrorContext): Promise<string> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const errorData = {
      id: errorId,
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      user: {
        id: this.userId,
        role: this.userRole,
      },
      level: context?.level || 'error',
      contexts: {
        browser: {
          name: this.getBrowserName(),
          version: this.getBrowserVersion(),
          language: navigator.language,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
        },
        os: {
          platform: navigator.platform,
        },
        device: {
          pixelRatio: window.devicePixelRatio,
          memory: (navigator as any).deviceMemory,
          cores: navigator.hardwareConcurrency,
        },
        performance: this.getPerformanceSnapshot(),
        ...context?.contexts,
      },
      tags: {
        environment: process.env.NODE_ENV,
        version: process.env.VITE_APP_VERSION || '1.0.0',
        component: 'frontend',
        ...context?.tags,
      },
      fingerprint: context?.fingerprint || [error.name, error.message],
      extra: context?.extra || {},
    };

    this.queueError(errorData);
    
    return errorId;
  }

  // Capture custom messages (warnings, info, debug)
  captureMessage(message: string, level: 'info' | 'warning' | 'debug' = 'info', context?: ErrorContext): void {
    const messageData = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      level,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      url: window.location.href,
      user: {
        id: this.userId,
        role: this.userRole,
      },
      contexts: context?.contexts || {},
      tags: {
        environment: process.env.NODE_ENV,
        version: process.env.VITE_APP_VERSION || '1.0.0',
        ...context?.tags,
      },
      extra: context?.extra || {},
    };

    this.queueError(messageData);
  }

  // Track user actions and interactions
  trackUserAction(action: UserAction): void {
    const actionData = {
      ...action,
      sessionId: this.sessionId,
      userId: this.userId,
      userRole: this.userRole,
    };

    // Send user action data (could be to analytics service)
    this.sendUserAction(actionData);
  }

  // Performance monitoring
  recordPerformanceMetric(metric: PerformanceMetric): void {
    this.performanceQueue.push({
      ...metric,
      timestamp: new Date(),
      tags: {
        sessionId: this.sessionId,
        userId: this.userId || 'anonymous',
        ...metric.tags,
      },
    });

    if (this.performanceQueue.length >= this.maxQueueSize) {
      this.flushPerformanceMetrics();
    }
  }

  // Record Core Web Vitals
  recordWebVitals(): void {
    if ('web-vital' in window) return; // Prevent duplicate listeners

    // Mark that we've set up web vitals
    (window as any)['web-vital'] = true;

    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          this.recordPerformanceMetric({
            name: 'largest-contentful-paint',
            value: lastEntry.startTime,
            unit: 'ms',
            timestamp: new Date(),
            tags: { metric: 'core-web-vital' }
          });
        });

        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordPerformanceMetric({
              name: 'first-input-delay',
              value: entry.processingStart - entry.startTime,
              unit: 'ms',
              timestamp: new Date(),
              tags: { metric: 'core-web-vital' }
            });
          });
        });

        fidObserver.observe({ type: 'first-input', buffered: true });

        // Cumulative Layout Shift (CLS)
        let clsScore = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
            }
          });

          this.recordPerformanceMetric({
            name: 'cumulative-layout-shift',
            value: clsScore,
            unit: 'score',
            timestamp: new Date(),
            tags: { metric: 'core-web-vital' }
          });
        });

        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (error) {
        console.warn('Failed to set up Performance Observer:', error);
      }
    }

    // Navigation Timing metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          this.recordPerformanceMetric({
            name: 'page-load-time',
            value: navigation.loadEventEnd - navigation.loadEventStart,
            unit: 'ms',
            timestamp: new Date()
          });

          this.recordPerformanceMetric({
            name: 'dom-content-loaded',
            value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            unit: 'ms',
            timestamp: new Date()
          });

          this.recordPerformanceMetric({
            name: 'time-to-first-byte',
            value: navigation.responseStart - navigation.requestStart,
            unit: 'ms',
            timestamp: new Date()
          });
        }
      }, 0);
    });
  }

  // Network error tracking
  trackNetworkError(url: string, status: number, method: string, error?: Error): void {
    this.captureMessage(`Network Error: ${method} ${url} - ${status}`, 'warning', {
      tags: {
        type: 'network-error',
        url,
        method,
        status: status.toString(),
      },
      extra: {
        error: error?.message,
        stack: error?.stack,
      },
    });
  }

  // Setup global error handlers
  private setupGlobalErrorHandlers(): void {
    // Catch unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureException(event.error || new Error(event.message), {
        contexts: {
          error_event: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        },
        tags: {
          source: 'window.onerror',
        },
      });
    });

    // Catch unhandled Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(event.reason);
      
      this.captureException(error, {
        tags: {
          source: 'unhandled-promise-rejection',
        },
        extra: {
          reason: event.reason,
        },
      });
    });

    // Intercept fetch requests for network error monitoring
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      
      try {
        const response = await originalFetch(...args);
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Record API call performance
        this.recordPerformanceMetric({
          name: 'api-call-duration',
          value: duration,
          unit: 'ms',
          timestamp: new Date(),
          tags: {
            url: typeof args[0] === 'string' ? args[0] : (args[0] as any).url || args[0].toString(),
            method: args[1]?.method || 'GET',
            status: response.status.toString(),
          },
        });

        // Track failed requests
        if (!response.ok) {
          this.trackNetworkError(
            typeof args[0] === 'string' ? args[0] : (args[0] as any).url || args[0].toString(),
            response.status,
            args[1]?.method || 'GET'
          );
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordPerformanceMetric({
          name: 'api-call-duration',
          value: duration,
          unit: 'ms',
          timestamp: new Date(),
          tags: {
            url: typeof args[0] === 'string' ? args[0] : (args[0] as any).url || args[0].toString(),
            method: args[1]?.method || 'GET',
            status: 'error',
          },
        });

        this.trackNetworkError(
          typeof args[0] === 'string' ? args[0] : (args[0] as any).url || args[0].toString(),
          0,
          args[1]?.method || 'GET',
          error as Error
        );

        throw error;
      }
    };
  }

  private setupPerformanceMonitoring(): void {
    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.recordPerformanceMetric({
              name: 'long-task',
              value: entry.duration,
              unit: 'ms',
              timestamp: new Date(),
              tags: { type: 'performance-issue' }
            });
          });
        });

        longTaskObserver.observe({ type: 'longtask', buffered: true });
      } catch (error) {
        console.warn('Long task monitoring not supported:', error);
      }
    }

    // Record web vitals
    this.recordWebVitals();
  }

  private setupNetworkStatusListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushAllQueues();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private startPeriodicFlush(): void {
    setInterval(() => {
      if (this.isOnline) {
        this.flushAllQueues();
      }
    }, this.flushInterval);
  }

  private queueError(errorData: any): void {
    this.errorQueue.push(errorData);

    if (this.errorQueue.length >= this.maxQueueSize) {
      this.flushErrors();
    }
  }

  private async flushErrors(): Promise<void> {
    if (this.errorQueue.length === 0 || !this.isOnline || !this.errorEndpointAvailable) return;

    const errors = this.errorQueue.splice(0, this.maxQueueSize);

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ errors }),
      });

      // If endpoint doesn't exist, disable future attempts
      if (response.status === 404) {
        this.errorEndpointAvailable = false;
        if (ENV_CONFIG.logging.debugMode) {
          console.log('Error reporting endpoint not available - future attempts disabled');
        }
        return; // Don't re-queue
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Only re-queue on network errors, not 404s
      if (error instanceof TypeError || (error as any)?.message?.includes('fetch')) {
        this.errorQueue.unshift(...errors);
        console.error('Failed to send error reports (network error):', error);
      } else {
        this.errorEndpointAvailable = false;
        if (ENV_CONFIG.logging.debugMode) {
          console.log('Error reporting endpoint unavailable - future attempts disabled');
        }
      }
    }
  }

  private async flushPerformanceMetrics(): Promise<void> {
    if (this.performanceQueue.length === 0 || !this.isOnline || !this.performanceEndpointAvailable) return;

    const metrics = this.performanceQueue.splice(0, this.maxQueueSize);

    try {
      const response = await fetch(this.performanceEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metrics }),
      });

      // If endpoint doesn't exist, disable future attempts
      if (response.status === 404) {
        this.performanceEndpointAvailable = false;
        if (ENV_CONFIG.logging.debugMode) {
          console.log('Performance monitoring endpoint not available - future attempts disabled');
        }
        return; // Don't re-queue
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Only re-queue on network errors, not 404s
      if (error instanceof TypeError || (error as any)?.message?.includes('fetch')) {
        this.performanceQueue.unshift(...metrics);
        console.error('Failed to send performance metrics (network error):', error);
      } else {
        this.performanceEndpointAvailable = false;
        if (ENV_CONFIG.logging.debugMode) {
          console.log('Performance monitoring endpoint unavailable - future attempts disabled');
        }
      }
    }
  }

  private async sendUserAction(action: any): Promise<void> {
    if (!this.isOnline) return;

    try {
      const response = await fetch('/api/analytics/actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(action),
      });

      // If endpoint doesn't exist, just log locally
      if (response.status === 404 && ENV_CONFIG.logging.debugMode) {
        console.log('User action tracking endpoint not available - action logged locally');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (ENV_CONFIG.logging.debugMode) {
        console.log('User action tracking endpoint unavailable:', error);
      }
    }
  }

  private flushAllQueues(): void {
    this.flushErrors();
    this.flushPerformanceMetrics();
  }

  private getBrowserName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getBrowserVersion(): string {
    const userAgent = navigator.userAgent;
    const match = userAgent.match(/(?:Chrome|Firefox|Safari|Edge)\/(\d+)/);
    return match ? match[1] : 'Unknown';
  }

  private getPerformanceSnapshot() {
    const perf = performance as any;
    if (!perf.memory) return {};

    return {
      memory: {
        used: perf.memory.usedJSHeapSize,
        total: perf.memory.totalJSHeapSize,
        limit: perf.memory.jsHeapSizeLimit,
      },
      timing: perf.timing,
      navigation: perf.navigation,
    };
  }

  // Cleanup method
  destroy(): void {
    this.flushAllQueues();
  }
}

// Create singleton instance
export const errorReportingService = new ErrorReportingService();

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  // Set up cleanup on page unload
  window.addEventListener('beforeunload', () => {
    errorReportingService.destroy();
  });
}

export default errorReportingService;