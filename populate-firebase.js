// Simple script to populate Firebase with sample data
// Run this in browser console: copy and paste this entire script

(async function populateFirebaseData() {
  console.log('🔧 Populating Firebase with sample data...');
  
  try {
    // Import Firebase modules
    const { collection, addDoc, Timestamp } = await import('firebase/firestore');
    const { db, COLLECTIONS } = await import('./src/config/firebase');
    
    // Sample bundles
    const sampleBundles = [
      {
        id: 'bundle_1',
        bundleNumber: 'BND-3233-M-001',
        articleNumber: '3233',
        articleStyle: 'Adult T-shirt',
        size: 'M',
        quantity: 50,
        priority: 'normal',
        batchNumber: 'B0001',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    // Sample operations  
    const sampleOperations = [
      {
        bundleId: 'bundle_1',
        operationId: 'shoulder_join',
        name: 'Shoulder Join',
        nameNepali: 'काँध जोड्ने',
        machineType: 'overlock',
        sequenceOrder: 1,
        pricePerPiece: 2.5,
        smvMinutes: 4.5,
        status: 'pending',
        prerequisites: [],
        isOptional: false,
        qualityCheckRequired: true,
        defectTolerance: 5,
        assignedOperatorId: null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ];

    // Add to Firebase
    const bundlesRef = collection(db, COLLECTIONS.PRODUCTION_BUNDLES);
    const operationsRef = collection(db, COLLECTIONS.BUNDLE_OPERATIONS);
    
    for (const bundle of sampleBundles) {
      await addDoc(bundlesRef, bundle);
      console.log('✅ Created bundle:', bundle.bundleNumber);
    }
    
    for (const operation of sampleOperations) {
      await addDoc(operationsRef, operation);
      console.log('✅ Created operation:', operation.name);
    }
    
    console.log('🎉 Sample data populated successfully!');
    console.log('Refresh the page to see the data.');
    
  } catch (error) {
    console.error('❌ Failed to populate data:', error);
  }
})();