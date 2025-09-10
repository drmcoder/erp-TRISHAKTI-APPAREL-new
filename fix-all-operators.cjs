// Script to fix all operators with missing password hashes
const admin = require('firebase-admin');

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

// Default passwords for common operators
const DEFAULT_PASSWORDS = {
  'ram': 'password',
  'siru': 'siru',
  'test': 'password',
  'operator1': 'password',
  'operator2': 'password',
  // Add more as needed
};

async function fixAllOperators() {
  try {
    console.log('🔧 Fixing all operators with missing password hashes...');
    
    // Get all operators
    const operatorsSnapshot = await db.collection('operators').get();
    
    if (operatorsSnapshot.empty) {
      console.log('❌ No operators found in operators collection');
      return;
    }

    let fixedCount = 0;
    let skippedCount = 0;

    for (const operatorDoc of operatorsSnapshot.docs) {
      const operatorId = operatorDoc.id;
      const operatorData = operatorDoc.data();
      
      console.log(`\n📝 Checking operator: ${operatorId}`);
      console.log(`   Username: ${operatorData.username || 'N/A'}`);
      console.log(`   Name: ${operatorData.name || 'N/A'}`);
      console.log(`   Has passwordHash: ${operatorData.passwordHash ? 'Yes' : 'No'}`);
      
      // Skip if already has password hash
      if (operatorData.passwordHash) {
        console.log(`   ✅ Already has password hash, skipping`);
        skippedCount++;
        continue;
      }

      // Determine password to use
      let password = DEFAULT_PASSWORDS[operatorId] || 
                     DEFAULT_PASSWORDS[operatorData.username] || 
                     'password'; // default fallback

      // Create password hash (Base64 encoding like the auth system expects)
      const passwordHash = Buffer.from(password).toString('base64');
      
      // Update the operator with password hash
      await operatorDoc.ref.update({
        passwordHash: passwordHash,
        active: true, // Ensure operator is active
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`   ✅ Fixed operator "${operatorId}" with password: "${password}"`);
      console.log(`   📝 Password hash: ${passwordHash}`);
      fixedCount++;
    }
    
    console.log(`\n🎉 Fix completed!`);
    console.log(`   Fixed: ${fixedCount} operators`);
    console.log(`   Skipped: ${skippedCount} operators (already had password hash)`);
    
    if (fixedCount > 0) {
      console.log('\n📋 Login Credentials:');
      for (const [id, password] of Object.entries(DEFAULT_PASSWORDS)) {
        console.log(`   ${id}: ${password}`);
      }
      console.log(`   Others: password (default)`);
    }
    
  } catch (error) {
    console.error('❌ Error fixing operators:', error);
  } finally {
    process.exit(0);
  }
}

fixAllOperators();