// Firebase Data Initialization Script
import { collection, addDoc, Timestamp, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';
import EnhancedBundleService from '../services/enhanced-bundle-service';

/**
 * Initialize Firebase with sample data for development
 */
export async function initializeFirebaseData() {
  try {
    console.log('🔄 Checking if data already exists...');
    
    // Check if operations already exist
    const operationsRef = collection(db, COLLECTIONS.BUNDLE_OPERATIONS);
    const existingOps = await getDocs(operationsRef);
    
    if (existingOps.docs.length > 0) {
      console.log('✅ Data already exists. Skipping initialization.');
      return { success: true, message: 'Data already exists' };
    }
    
    console.log('🔧 Initializing Firebase with sample data...');
    
    // Create sample data using the service
    const result = await EnhancedBundleService.createSampleData();
    
    if (result.success) {
      console.log('🎉 Firebase initialized successfully!');
      return { success: true, message: 'Firebase initialized with sample data' };
    } else {
      throw new Error(result.error || 'Failed to create sample data');
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Auto-run in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // Run after a short delay to ensure Firebase is ready
  setTimeout(() => {
    initializeFirebaseData().catch(console.error);
  }, 2000);
}