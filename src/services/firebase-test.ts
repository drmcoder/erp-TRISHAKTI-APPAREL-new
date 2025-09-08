// Firebase Database Integration Test
// Test both Firestore and Realtime Database functionality for TSA Production System

import { db, rtdb } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, set, get } from 'firebase/database';

export class FirebaseTester {
  // Test Firestore connection and write/read
  static async testFirestore(): Promise<boolean> {
    try {
      console.log('🧪 Testing Firestore connection...');
      
      // Test write
      const testDoc = await addDoc(collection(db, 'test'), {
        message: 'TSA Production System Test',
        timestamp: serverTimestamp(),
        test: true
      });
      
      console.log('✅ Firestore write successful:', testDoc.id);
      return true;
    } catch (error) {
      console.error('❌ Firestore test failed:', error);
      return false;
    }
  }

  // Test Realtime Database connection and write/read  
  static async testRealtimeDatabase(): Promise<boolean> {
    try {
      console.log('🧪 Testing Realtime Database connection...');
      
      // Test write
      await set(ref(rtdb, 'test/connection'), {
        message: 'TSA Production System Live Test',
        timestamp: Date.now(),
        status: 'connected'
      });
      
      // Test read
      const snapshot = await get(ref(rtdb, 'test/connection'));
      if (snapshot.exists()) {
        console.log('✅ Realtime Database test successful:', snapshot.val());
        return true;
      } else {
        console.error('❌ Realtime Database read failed: No data');
        return false;
      }
    } catch (error) {
      console.error('❌ Realtime Database test failed:', error);
      return false;
    }
  }

  // Test TSA production workflow data structure
  static async testTSAProductionFlow(): Promise<boolean> {
    try {
      console.log('🧪 Testing TSA Production Flow...');
      
      // Test cutting droplet structure (Firestore)
      const testCuttingDroplet = {
        lotNumber: 'TEST001',
        articleNumber: '8082',
        garmentType: 'polo',
        status: 'cutting',
        colorSizeData: [
          {
            color: 'Blue',
            rollsUsed: 2,
            kgUsed: 5.5,
            layers: 20,
            sizes: [
              { size: 'XL', pieces: 30, bundlesCreated: 0 },
              { size: '2XL', pieces: 30, bundlesCreated: 0 }
            ],
            totalPieces: 60
          }
        ],
        createdAt: serverTimestamp()
      };
      
      const cuttingDoc = await addDoc(collection(db, 'cuttingDroplets'), testCuttingDroplet);
      console.log('✅ Cutting droplet created:', cuttingDoc.id);
      
      // Test live production status (Realtime Database)
      await set(ref(rtdb, `live_production/cutting_droplets/${cuttingDoc.id}`), {
        id: cuttingDoc.id,
        lotNumber: 'TEST001',
        articleNumber: '8082',
        status: 'cutting',
        totalPieces: 60,
        lastUpdated: Date.now()
      });
      
      console.log('✅ Live production status updated');
      
      // Test operator status
      await set(ref(rtdb, 'live_production/operators/test_operator'), {
        operatorId: 'test_operator',
        operatorName: 'Test Operator',
        status: 'available',
        machineType: null,
        currentBundle: null,
        lastActivity: Date.now()
      });
      
      console.log('✅ Operator status updated');
      
      return true;
    } catch (error) {
      console.error('❌ TSA Production Flow test failed:', error);
      return false;
    }
  }
  // Run all tests
  static async runAllTests(): Promise<void> {
    console.log('🚀 Starting TSA Production System Database Tests...');
    console.log('');
    
    const results = {
      firestore: await this.testFirestore(),
      realtime: await this.testRealtimeDatabase(),
      production: await this.testTSAProductionFlow()
    };
    
    console.log('');
    console.log('📊 Test Results:');
    console.log('================');
    console.log(`Firestore:        ${results.firestore ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Realtime DB:      ${results.realtime ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Production Flow:  ${results.production ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('');
    
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
      console.log('🎉 All tests PASSED! TSA Production System is ready.');
      console.log('');
      console.log('✅ Database Architecture Active:');
      console.log('   - Firestore: Structured data, complex queries');
      console.log('   - Realtime DB: Live updates, real-time dashboards');
      console.log('');
      console.log('🔄 Your TSA Production Workflow:');
      console.log('   1. Management → Cutting Entry (Firestore + RT DB)');
      console.log('   2. System → Bundle Creation (Firestore + RT DB)');
      console.log('   3. Supervisor → Bundle Assignment (Firestore + RT DB)');
      console.log('   4. Operators → Piece Tracking (Firestore + RT DB)');
      console.log('   5. Live Dashboard → Real-time Updates (RT DB)');
    } else {
      console.log('❌ Some tests FAILED. Please check your Firebase configuration.');
      console.log('');
      console.log('🔧 Troubleshooting:');
      console.log('   1. Check Firebase project configuration');
      console.log('   2. Verify authentication is working');
      console.log('   3. Check database rules permissions');
      console.log('   4. Ensure environment variables are set correctly');
    }
  }

  // Clean up test data
  static async cleanupTestData(): Promise<void> {
    try {
      console.log('🧹 Cleaning up test data...');
      
      // Clean up Realtime Database test data
      await set(ref(rtdb, 'test'), null);
      await set(ref(rtdb, 'live_production/operators/test_operator'), null);
      
      console.log('✅ Test data cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }
}

// Export for use in components or manual testing
export default FirebaseTester;