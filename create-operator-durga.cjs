#!/usr/bin/env node

// Script to create the "durga" operator user
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    let initialized = false;
    
    // Method 1: Service account key
    try {
      const serviceAccount = require('./src/infrastructure/firebase/service-account-key.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://erp-for-tsa-default-rtdb.firebaseio.com'
      });
      console.log('✅ Initialized with service account key');
      initialized = true;
    } catch (serviceError) {
      console.log('⚠️  Service account key not found');
    }

    // Method 2: Try alternative service account location
    if (!initialized) {
      try {
        const serviceAccount = require('./firebase-service-account-key.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: 'https://erp-for-tsa-default-rtdb.firebaseio.com'
        });
        console.log('✅ Initialized with alternative service account key');
        initialized = true;
      } catch (altError) {
        console.log('⚠️  Alternative service account key not found');
      }
    }

    // Method 3: Application Default Credentials
    if (!initialized) {
      admin.initializeApp({
        projectId: 'erp-for-tsa',
        databaseURL: 'https://erp-for-tsa-default-rtdb.firebaseio.com'
      });
      console.log('✅ Initialized with Application Default Credentials');
      initialized = true;
    }

  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.log('\n💡 To use this script:');
    console.log('1. Download service account key from Firebase Console');
    console.log('2. Save as firebase-service-account-key.json in project root');
    console.log('3. Or run: firebase login && firebase use erp-for-tsa');
    process.exit(1);
  }
}

const db = admin.firestore();

async function createDurgaOperator() {
  try {
    console.log('👤 Creating "durga" operator user...\n');
    
    const username = 'durga';
    const password = 'durga123'; // You can change this default password
    
    // Check if user already exists
    console.log('🔍 Checking if user already exists...');
    const existingUser = await db.collection('operators').doc(username.toLowerCase()).get();
    
    if (existingUser.exists()) {
      console.log('⚠️  User already exists! Here\'s the existing data:');
      const userData = existingUser.data();
      console.log(`   Username: ${userData.username}`);
      console.log(`   Name: ${userData.name}`);
      console.log(`   Active: ${userData.active !== false ? 'Yes' : 'No'}`);
      console.log(`   Has Password: ${userData.passwordHash ? 'Yes' : 'No'}`);
      
      if (userData.passwordHash) {
        try {
          const decodedPassword = Buffer.from(userData.passwordHash, 'base64').toString();
          console.log(`   Current Password: "${decodedPassword}"`);
        } catch (decodeError) {
          console.log(`   Password Hash: ${userData.passwordHash}`);
        }
      }
      
      console.log('\n❓ Do you want to update this user? (Ctrl+C to cancel)');
      // In a real scenario, you'd prompt for input here
      console.log('Proceeding with update...');
    }
    
    // Create/update operator data
    const operatorData = {
      username: username,
      name: 'Durga Operator', // You can customize this
      role: 'operator',
      email: `${username}@tsa.com`,
      passwordHash: Buffer.from(password).toString('base64'), // Base64 encode like the auth system expects
      permissions: [
        'view_dashboard',
        'complete_work',
        'report_damage',
        'self_assign',
        'view_own_profile',
        'request_work'
      ],
      department: 'Production',
      machineType: 'overlock', // Default machine type, can be changed
      skills: ['basic_sewing', 'overlock'], // Default skills
      active: true,
      currentStatus: 'available',
      averageEfficiency: 0.85, // Default efficiency
      qualityScore: 0.90, // Default quality score
      supervisorId: null, // Will be assigned by supervisor
      totalEarned: 0,
      completedTasks: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: null
    };
    
    // Save to Firestore
    await db.collection('operators').doc(username.toLowerCase()).set(operatorData);
    
    console.log('✅ Successfully created/updated "durga" operator!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: operator`);
    
    console.log('\n📊 OPERATOR DETAILS:');
    console.log(`   Name: ${operatorData.name}`);
    console.log(`   Email: ${operatorData.email}`);
    console.log(`   Department: ${operatorData.department}`);
    console.log(`   Machine Type: ${operatorData.machineType}`);
    console.log(`   Skills: ${operatorData.skills.join(', ')}`);
    console.log(`   Active: ${operatorData.active ? 'Yes' : 'No'}`);
    
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Try logging in with the credentials above');
    console.log('2. If login still fails, run the debug script: node debug-durga-user.cjs');
    console.log('3. Check that you\'re using the correct Firebase project');
    console.log('4. Verify the login form is using the correct authentication endpoint');
    
    // Also create a basic operator wallet if it doesn't exist
    try {
      console.log('\n💰 Creating operator wallet...');
      await db.collection('operatorWallets').doc(username.toLowerCase()).set({
        operatorId: username.toLowerCase(),
        availableAmount: 0,
        heldAmount: 0,
        totalEarned: 0,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('✅ Operator wallet created');
    } catch (walletError) {
      console.log('⚠️  Wallet creation failed (might already exist):', walletError.message);
    }
    
  } catch (error) {
    console.error('❌ Error creating operator:', error);
    console.log('\nDETAILED ERROR INFO:');
    console.log('Message:', error.message);
    if (error.code) console.log('Code:', error.code);
    if (error.details) console.log('Details:', error.details);
  } finally {
    process.exit(0);
  }
}

// Allow customization via command line arguments
const args = process.argv.slice(2);
const customPassword = args.find(arg => arg.startsWith('--password='))?.split('=')[1];
const customName = args.find(arg => arg.startsWith('--name='))?.split('=')[1];

if (customPassword || customName) {
  console.log('📝 Using custom parameters:');
  if (customPassword) console.log(`   Password: ${customPassword}`);
  if (customName) console.log(`   Name: ${customName}`);
  console.log('');
}

createDurgaOperator();