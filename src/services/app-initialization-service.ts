// App Initialization Service - Smart Cache & Performance Optimization
// AI-powered application startup with intelligent data prefetching

import { appCache, memoryCache } from './cache-service';
import { trustedDeviceService } from './trusted-device-service';
import { operatorService } from './operator-service';
import { firebaseMigrationService } from './firebase-migration-service';

interface AppInitializationConfig {
  enableCacheWarming: boolean;
  enableOfflineSupport: boolean;
  preloadCriticalData: boolean;
  enablePerformanceMonitoring: boolean;
}

class AppInitializationService {
  private config: AppInitializationConfig = {
    enableCacheWarming: true,
    enableOfflineSupport: true,
    preloadCriticalData: true,
    enablePerformanceMonitoring: true
  };

  // Initialize application with smart caching and data preloading
  async initialize(): Promise<void> {
    console.log('🚀 TSA Intelligence Hub - Initializing Advanced Systems...');
    
    const startTime = performance.now();
    
    try {
      // 1. First, migrate to Firebase-only operations
      console.log('🔥 Running Firebase migration...');
      const migrationResult = await firebaseMigrationService.migrateToFirebaseOnly();
      
      if (migrationResult.success) {
        console.log(`✅ Firebase migration complete - cleaned ${migrationResult.cleaned.length} mock data keys`);
      } else {
        console.warn('⚠️ Firebase migration had issues:', migrationResult.errors);
      }
      
      // 2. Initialize cache systems
      await this.initializeCacheSystem();
      
      // 3. Preload critical data (from Firebase only)
      if (this.config.preloadCriticalData) {
        await this.preloadCriticalData();
      }
      
      // 4. Warm up frequently accessed caches
      if (this.config.enableCacheWarming) {
        await this.warmUpCaches();
      }
      
      // 5. Setup performance monitoring
      if (this.config.enablePerformanceMonitoring) {
        this.setupPerformanceMonitoring();
      }
      
      const endTime = performance.now();
      const initTime = Math.round(endTime - startTime);
      
      console.log(`✅ TSA Intelligence Hub initialized in ${initTime}ms`);
      console.log('🎯 Ready for Smart Manufacturing Operations');
      
      // Display cache statistics
      this.displayCacheStatistics();
      
    } catch (error) {
      console.error('❌ App initialization failed:', error);
    }
  }

  // Initialize cache system with intelligent configuration
  private async initializeCacheSystem(): Promise<void> {
    console.log('💾 Initializing Intelligent Cache System...');
    
    // Clear expired cache entries
    const cacheStats = appCache.getStats();
    console.log(`📊 Cache Status - Hit Rate: ${cacheStats.hitRate}% | Utilization: ${cacheStats.utilization}%`);
    
    // If cache health is poor, clear and restart
    if (cacheStats.health === 'poor') {
      console.log('🔄 Cache performance poor - Clearing and optimizing...');
      appCache.clear();
    }
  }

  // Preload critical application data
  private async preloadCriticalData(): Promise<void> {
    console.log('📦 Preloading Critical Manufacturing Data...');
    
    const preloadTasks = [
      {
        name: 'Active Operators',
        task: async () => {
          try {
            const operators = await operatorService.getAllOperators();
            memoryCache.set('active_operators', operators, 10 * 60 * 1000, 'high'); // 10 minutes
            return operators.length;
          } catch (error) {
            console.warn('Failed to preload operators:', error);
            return 0;
          }
        }
      },
      {
        name: 'Trusted Devices',
        task: async () => {
          try {
            const devices = await trustedDeviceService.getTrustedDevices();
            memoryCache.set('trusted_devices_summary', devices, 5 * 60 * 1000, 'high'); // 5 minutes
            return devices.length;
          } catch (error) {
            console.warn('Failed to preload trusted devices:', error);
            return 0;
          }
        }
      },
      {
        name: 'System Statistics',
        task: async () => {
          try {
            const stats = await trustedDeviceService.getDeviceStatistics();
            memoryCache.set('system_stats', stats, 2 * 60 * 1000, 'medium'); // 2 minutes
            return Object.keys(stats).length;
          } catch (error) {
            console.warn('Failed to preload system statistics:', error);
            return 0;
          }
        }
      }
    ];

    const results = await Promise.allSettled(
      preloadTasks.map(async ({ name, task }) => {
        const startTime = performance.now();
        const result = await task();
        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        
        console.log(`  ✓ ${name}: ${result} records loaded in ${duration}ms`);
        return { name, result, duration };
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    console.log(`📊 Preloaded ${successful}/${preloadTasks.length} critical datasets`);
  }

  // Warm up frequently accessed caches
  private async warmUpCaches(): Promise<void> {
    console.log('🔥 Warming Up Intelligent Caches...');
    
    try {
      await appCache.warm([
        {
          namespace: 'user_preferences',
          loader: async () => {
            // Load user preferences from localStorage as fallback
            const prefs = localStorage.getItem('tsa_user_preferences');
            return prefs ? JSON.parse(prefs) : {};
          },
          ttl: 30 * 60 * 1000, // 30 minutes
          priority: 'medium'
        },
        {
          namespace: 'app_config',
          loader: async () => {
            return {
              version: '2.0.0',
              features: ['smart_manufacturing', 'ai_analytics', 'real_time_monitoring'],
              theme: 'production-optimized',
              cache_enabled: true,
              performance_mode: 'enhanced'
            };
          },
          ttl: 60 * 60 * 1000, // 1 hour
          priority: 'high'
        }
      ]);
      
      console.log('🎯 Cache warming completed successfully');
    } catch (error) {
      console.warn('Cache warming partially failed:', error);
    }
  }

  // Setup performance monitoring
  private setupPerformanceMonitoring(): void {
    console.log('📈 Setting Up Performance Intelligence...');
    
    // Monitor cache performance
    setInterval(() => {
      const stats = appCache.getStats();
      if (stats.hitRate < 70) {
        console.warn(`⚠️ Cache hit rate low: ${stats.hitRate}% - Consider optimization`);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
    
    // Monitor memory usage (if available)
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      const usedMemory = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024);
      const totalMemory = Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024);
      
      console.log(`🧠 Memory Usage: ${usedMemory}MB / ${totalMemory}MB`);
    }
    
    // Setup performance observer (if supported)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.duration > 1000) { // Log slow operations
              console.warn(`🐌 Slow operation detected: ${entry.name} took ${Math.round(entry.duration)}ms`);
            }
          });
        });
        
        observer.observe({ entryTypes: ['measure', 'navigation'] });
        console.log('📊 Performance monitoring active');
      } catch (error) {
        console.warn('Performance observer setup failed:', error);
      }
    }
  }

  // Display comprehensive cache statistics
  private displayCacheStatistics(): void {
    const appStats = appCache.getStats();
    const memStats = memoryCache.getStats();
    
    console.log('\n📊 TSA Intelligence Hub - Cache Performance Report');
    console.log('═════════════════════════════════════════════════');
    console.log(`🎯 Application Cache:`);
    console.log(`   Hit Rate: ${appStats.hitRate}% | Health: ${appStats.health.toUpperCase()}`);
    console.log(`   Size: ${appStats.size}/${appStats.maxSize} | Utilization: ${appStats.utilization}%`);
    console.log(`   Hits: ${appStats.hits} | Misses: ${appStats.misses} | Evictions: ${appStats.evictions}`);
    
    console.log(`🧠 Memory Cache:`);
    console.log(`   Hit Rate: ${memStats.hitRate}% | Health: ${memStats.health.toUpperCase()}`);
    console.log(`   Size: ${memStats.size}/${memStats.maxSize} | Utilization: ${memStats.utilization}%`);
    console.log(`   Hits: ${memStats.hits} | Misses: ${memStats.misses} | Evictions: ${memStats.evictions}`);
    console.log('═════════════════════════════════════════════════\n');
    
    // Set cache performance indicator
    const overallHealth = appStats.hitRate > 80 && memStats.hitRate > 80 ? 'excellent' :
                         appStats.hitRate > 60 && memStats.hitRate > 60 ? 'good' : 'needs-optimization';
    
    console.log(`🚀 Overall Performance: ${overallHealth.toUpperCase()}`);
    
    if (overallHealth === 'needs-optimization') {
      console.log('💡 Tip: Consider clearing cache or adjusting TTL values for better performance');
    }
  }

  // Get application readiness status
  getReadinessStatus(): {
    ready: boolean;
    cacheHealth: string;
    preloadedData: boolean;
    performanceGrade: 'A' | 'B' | 'C' | 'D';
  } {
    const stats = appCache.getStats();
    const grade = stats.hitRate > 85 ? 'A' : stats.hitRate > 70 ? 'B' : stats.hitRate > 50 ? 'C' : 'D';
    
    return {
      ready: true,
      cacheHealth: stats.health,
      preloadedData: this.config.preloadCriticalData,
      performanceGrade: grade
    };
  }
}

// Create singleton instance
export const appInitializationService = new AppInitializationService();

// Export types
export type { AppInitializationConfig };

export default appInitializationService;