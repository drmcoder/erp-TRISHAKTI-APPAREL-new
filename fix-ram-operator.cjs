// Script to fix operator 'ram' with correct password hash
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = require('./src/infrastructure/firebase/service-account-key.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://erp-for-tsa-default-rtdb.firebaseio.com'
    });
  } catch (error) {
    console.log('Firebase initialization error:', error.message);
    process.exit(1);
  }
}

const db = admin.firestore();

async function fixRamOperator() {
  try {
    console.log('🔧 Fixing operator "ram" with correct password hash...');
    
    const operatorRef = db.collection('operators').doc('ram');
    const operatorDoc = await operatorRef.get();
    
    if (!operatorDoc.exists) {
      console.log('❌ Operator "ram" not found in operators collection');
      console.log('📝 Creating new operator "ram"...');
      
      // Create the operator document
      await operatorRef.set({
        username: 'ram',
        name: 'Ram Operator',
        role: 'operator',
        passwordHash: 'cGFzc3dvcmQ=', // Base64 of "password"
        active: true,
        machineType: 'single_needle',
        skills: ['basic_sewing', 'single_needle'],
        department: 'Production',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: null,
        permissions: [
          'view_dashboard',
          'update_work_progress',
          'view_assignments'
        ]
      });
      
      console.log('✅ Created operator "ram" with username: ram, password: password');
    } else {
      console.log('✅ Found operator "ram", updating password hash...');
      const currentData = operatorDoc.data();
      console.log('Current passwordHash:', currentData.passwordHash);
      
      // Update the password hash
      await operatorRef.update({
        passwordHash: 'cGFzc3dvcmQ=', // Base64 of "password"
        active: true // Ensure the operator is active
      });
      
      console.log('✅ Updated operator "ram" with correct password hash');
      console.log('📝 Login credentials: username: ram, password: password');
    }
    
    console.log('🎉 Fix completed! You can now login with:');
    console.log('   Username: ram');
    console.log('   Password: password');
    
  } catch (error) {
    console.error('❌ Error fixing operator:', error);
  } finally {
    process.exit(0);
  }
}

fixRamOperator();