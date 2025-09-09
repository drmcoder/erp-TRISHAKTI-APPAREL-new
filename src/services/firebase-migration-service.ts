// Firebase Migration Service - Remove all localStorage usage
// Systematically migrates all data operations to Firebase only

import { appCache } from './cache-service';

interface LocalStorageItem {
  key: string;
  value: any;
  migratedTo?: string;
}

class FirebaseMigrationService {
  private localStorage_keys_to_remove = [
    'tsa_operators',
    'tsa_bundles',
    'tsa_work_assignments',
    'tsa_production_data',
    'tsa_demo_data',
    'tsa_mock_operators',
    'tsa_sample_data',
    'tsaerp_trusted_devices', // Already migrated
    'tsa_cached_data',
    'tsa_temp_data'
  ];

  // Scan and identify all localStorage usage
  scanLocalStorageUsage(): LocalStorageItem[] {
    const items: LocalStorageItem[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tsa')) {
        try {
          const value = localStorage.getItem(key);
          items.push({
            key,
            value: value ? JSON.parse(value) : value
          });
        } catch (error) {
          items.push({
            key,
            value: localStorage.getItem(key)
          });
        }
      }
    }
    
    return items;
  }

  // Clean up all mock/demo localStorage data
  cleanupMockData(): { removed: string[], kept: string[] } {
    const removed: string[] = [];
    const kept: string[] = [];

    // Essential localStorage keys to keep
    const essentialKeys = [
      'tsa_auth_token',
      'tsa_user_role', 
      'tsa_username',
      'tsaerp_remembered_username',
      'tsaerp_remember_me',
      'tsa_user_preferences',
      'tsaerp_cache' // Our new cache system
    ];

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tsa')) {
        if (essentialKeys.includes(key)) {
          kept.push(key);
        } else {
          localStorage.removeItem(key);
          removed.push(key);
        }
      }
    }

    return { removed, kept };
  }

  // Validate Firebase connectivity
  async validateFirebaseConnection(): Promise<{
    firestore: boolean;
    realtimeDatabase: boolean;
    auth: boolean;
  }> {
    const result = {
      firestore: false,
      realtimeDatabase: false,
      auth: false
    };

    try {
      // Test Firestore connection
      const { operatorService } = await import('./operator-service');
      await operatorService.getAllOperators();
      result.firestore = true;
    } catch (error) {
      console.warn('Firestore connection test failed:', error);
    }

    try {
      // Test Realtime Database connection
      const { rtdb } = await import('../config/firebase');
      const { ref, onValue, off } = await import('firebase/database');
      
      const testRef = ref(rtdb, 'system_health');
      const testConnection = () => new Promise((resolve) => {
        const unsubscribe = onValue(testRef, () => {
          off(testRef);
          resolve(true);
        }, (error) => {
          resolve(false);
        });
      });
      
      result.realtimeDatabase = await testConnection() as boolean;
    } catch (error) {
      console.warn('Realtime Database connection test failed:', error);
    }

    try {
      // Test Auth connection
      const { auth } = await import('../config/firebase');
      result.auth = auth != null;
    } catch (error) {
      console.warn('Auth connection test failed:', error);
    }

    return result;
  }

  // Replace localStorage with Firebase operations
  async migrateToFirebaseOnly(): Promise<{
    success: boolean;
    cleaned: string[];
    errors: string[];
    firebaseStatus: any;
  }> {
    console.log('🚀 Starting Firebase-only migration...');
    
    const errors: string[] = [];
    
    try {
      // 1. Validate Firebase connectivity first
      const firebaseStatus = await this.validateFirebaseConnection();
      
      if (!firebaseStatus.firestore) {
        throw new Error('❌ Firestore connection failed - cannot proceed with migration');
      }

      // 2. Clean up mock localStorage data
      const { removed, kept } = this.cleanupMockData();
      
      console.log(`🧹 Cleaned ${removed.length} mock data keys:`, removed);
      console.log(`✅ Kept ${kept.length} essential keys:`, kept);

      // 3. Clear old cache data and initialize new cache system
      appCache.clear();
      console.log('🔄 Cache system reset for Firebase operations');

      // 4. Validate that no mock data services are being used
      this.validateNoMockDataUsage();

      console.log('✅ Firebase-only migration completed successfully');
      
      return {
        success: true,
        cleaned: removed,
        errors,
        firebaseStatus
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);
      console.error('❌ Firebase migration failed:', error);
      
      return {
        success: false,
        cleaned: [],
        errors,
        firebaseStatus: await this.validateFirebaseConnection()
      };
    }
  }

  // Validate that no mock data services are being imported
  private validateNoMockDataUsage(): void {
    // This would ideally be done at build time, but we can check at runtime
    const suspiciousGlobals = [
      'mockOperators',
      'demoData', 
      'sampleData',
      'mockBundles'
    ];

    suspiciousGlobals.forEach(global => {
      if ((window as any)[global]) {
        console.warn(`⚠️ Found suspicious mock data global: ${global}`);
      }
    });
  }

  // Create a fallback data loader that only uses Firebase
  createFirebaseOnlyLoader() {
    return {
      loadOperators: async () => {
        const { operatorService } = await import('./operator-service');
        return operatorService.getAllOperators();
      },
      
      loadBundles: async () => {
        // TODO: Implement when bundle service is fully migrated
        console.warn('Bundle service not yet fully migrated to Firebase');
        return { success: false, error: 'Bundle service migration pending' };
      },
      
      loadWorkAssignments: async () => {
        // TODO: Implement when work assignment service is fully migrated
        console.warn('Work assignment service not yet fully migrated to Firebase');
        return { success: false, error: 'Work assignment service migration pending' };
      }
    };
  }

  // Get migration status report
  async getMigrationReport(): Promise<{
    localStorageKeys: LocalStorageItem[];
    firebaseStatus: any;
    cacheStatus: any;
    recommendations: string[];
  }> {
    const localStorageKeys = this.scanLocalStorageUsage();
    const firebaseStatus = await this.validateFirebaseConnection();
    const cacheStatus = appCache.getStats();
    
    const recommendations: string[] = [];
    
    if (localStorageKeys.length > 10) {
      recommendations.push('Consider cleaning up unused localStorage keys');
    }
    
    if (!firebaseStatus.firestore) {
      recommendations.push('Fix Firestore connection issues');
    }
    
    if (cacheStatus.hitRate < 70) {
      recommendations.push('Optimize cache performance for better Firebase data access');
    }

    return {
      localStorageKeys,
      firebaseStatus,
      cacheStatus,
      recommendations
    };
  }
}

// Create singleton instance
export const firebaseMigrationService = new FirebaseMigrationService();

export default firebaseMigrationService;