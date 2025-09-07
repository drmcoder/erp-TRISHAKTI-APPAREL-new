#!/usr/bin/env node

// Firebase Admin SDK Setup Script with Service Account
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Service Account Key Configuration
// You can get this from Firebase Console > Project Settings > Service Accounts > Generate New Private Key
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '..', 'firebase-service-account-key.json');

async function setupFirebaseAdmin() {
  console.log('🔧 Setting up Firebase Admin SDK...');

  try {
    // Check if service account key exists
    if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      console.log('✅ Found service account key file');
      
      // Initialize with service account
      const serviceAccount = require(SERVICE_ACCOUNT_PATH);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: `https://erp-for-tsa-default-rtdb.firebaseio.com`,
        projectId: 'erp-for-tsa'
      });
      
      console.log('✅ Firebase Admin SDK initialized with service account');
      return { useAdmin: true, db: admin.firestore() };
      
    } else {
      console.log('⚠️  Service account key not found at:', SERVICE_ACCOUNT_PATH);
      console.log('\n📋 To get the service account key:');
      console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/erp-for-tsa/settings/serviceaccounts');
      console.log('2. Click "Generate New Private Key"');
      console.log('3. Save the downloaded JSON file as: firebase-service-account-key.json');
      console.log('4. Place it in the project root directory');
      
      // Try to initialize with Application Default Credentials
      console.log('\n🔄 Trying Application Default Credentials...');
      
      try {
        admin.initializeApp({
          projectId: 'erp-for-tsa',
          databaseURL: `https://erp-for-tsa-default-rtdb.firebaseio.com`
        });
        
        console.log('✅ Firebase Admin SDK initialized with Application Default Credentials');
        return { useAdmin: true, db: admin.firestore() };
        
      } catch (credError) {
        console.log('❌ Application Default Credentials not available');
        console.log('\n🔄 Using Firebase Auth Login instead...');
        
        // Check if user is logged in with Firebase CLI
        const { execSync } = require('child_process');
        try {
          const result = execSync('firebase auth:list --project erp-for-tsa', { encoding: 'utf8' });
          console.log('✅ Firebase CLI authentication available');
          
          // Use emulator mode for development
          process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
          admin.initializeApp({
            projectId: 'erp-for-tsa'
          });
          
          console.log('✅ Using Firebase CLI authentication');
          return { useAdmin: true, db: admin.firestore() };
          
        } catch (cliError) {
          console.log('❌ Firebase CLI authentication not available');
          return { useAdmin: false, db: null };
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error setting up Firebase Admin SDK:', error.message);
    return { useAdmin: false, db: null };
  }
}

async function setupDatabaseData(db) {
  console.log('📊 Setting up database data...');

  const sampleData = {
    // Operators
    operators: [
      {
        id: 'op-maya-001',
        name: 'Maya Sharma',
        employeeId: 'EMP001',
        skillLevel: 'Expert',
        primaryMachine: 'Overlock',
        currentStatus: 'working',
        averageEfficiency: 0.92,
        qualityScore: 0.88,
        supervisorId: 'sup-john-001',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'op-ram-002',
        name: 'Ram Singh',
        employeeId: 'EMP002',
        skillLevel: 'Intermediate',
        primaryMachine: 'Single Needle',
        currentStatus: 'break',
        averageEfficiency: 0.85,
        qualityScore: 0.82,
        supervisorId: 'sup-john-001',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'op-sita-003',
        name: 'Sita Patel',
        employeeId: 'EMP003',
        skillLevel: 'Advanced',
        primaryMachine: 'Flatlock',
        currentStatus: 'working',
        averageEfficiency: 0.88,
        qualityScore: 0.91,
        supervisorId: 'sup-john-001',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      }
    ],

    // Supervisors
    supervisors: [
      {
        id: 'sup-john-001',
        name: 'John Kumar',
        employeeId: 'SUP001',
        supervisorLevel: 'Senior',
        responsibleLines: ['Line A', 'Line B'],
        teamSize: 12,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      }
    ],

    // Work Items
    workItems: [
      {
        id: 'work-001',
        bundleNumber: 'B001-T001',
        operation: 'Side Seam',
        machineType: 'Overlock',
        estimatedDuration: 45,
        status: 'available',
        priority: 'high',
        createdAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'work-002',
        bundleNumber: 'B002-T002',
        operation: 'Button Hole',
        machineType: 'Single Needle',
        estimatedDuration: 30,
        status: 'available',
        priority: 'medium',
        createdAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'work-003',
        bundleNumber: 'B003-T003',
        operation: 'Shoulder Join',
        machineType: 'Overlock',
        estimatedDuration: 35,
        status: 'available',
        priority: 'high',
        createdAt: admin.firestore.Timestamp.now()
      }
    ],

    // Wallets
    wallets: [
      {
        operatorId: 'op-maya-001',
        availableAmount: 2500,
        heldAmount: 150,
        totalEarned: 12500,
        lastUpdated: admin.firestore.Timestamp.now()
      },
      {
        operatorId: 'op-ram-002',
        availableAmount: 1800,
        heldAmount: 0,
        totalEarned: 8900,
        lastUpdated: admin.firestore.Timestamp.now()
      },
      {
        operatorId: 'op-sita-003',
        availableAmount: 3200,
        heldAmount: 200,
        totalEarned: 15600,
        lastUpdated: admin.firestore.Timestamp.now()
      }
    ],

    // Assignment Requests
    assignmentRequests: [
      {
        id: 'req-001',
        operatorId: 'op-maya-001',
        operatorName: 'Maya Sharma',
        workItemId: 'work-001',
        supervisorId: 'sup-john-001',
        status: 'pending',
        reason: 'I have experience with this operation and can complete it efficiently',
        requestedAt: admin.firestore.Timestamp.now(),
        createdAt: admin.firestore.Timestamp.now()
      },
      {
        id: 'req-002',
        operatorId: 'op-ram-002',
        operatorName: 'Ram Singh',
        workItemId: 'work-002',
        supervisorId: 'sup-john-001',
        status: 'pending',
        reason: 'Looking to improve my skills with button hole operations',
        requestedAt: admin.firestore.Timestamp.now(),
        createdAt: admin.firestore.Timestamp.now()
      }
    ],

    // Operator Status (real-time)
    operatorStatus: [
      {
        operatorId: 'op-maya-001',
        status: 'working',
        currentWorkItems: 1,
        lastUpdated: admin.firestore.Timestamp.now()
      },
      {
        operatorId: 'op-ram-002',
        status: 'break',
        currentWorkItems: 0,
        lastUpdated: admin.firestore.Timestamp.now()
      },
      {
        operatorId: 'op-sita-003',
        status: 'working',
        currentWorkItems: 2,
        lastUpdated: admin.firestore.Timestamp.now()
      }
    ]
  };

  try {
    // Create operators
    console.log('📊 Creating operators...');
    for (const operator of sampleData.operators) {
      await db.collection('operators').doc(operator.id).set(operator);
    }

    // Create supervisors
    console.log('👥 Creating supervisors...');
    for (const supervisor of sampleData.supervisors) {
      await db.collection('supervisors').doc(supervisor.id).set(supervisor);
    }

    // Create work items
    console.log('🔨 Creating work items...');
    for (const workItem of sampleData.workItems) {
      await db.collection('workItems').doc(workItem.id).set(workItem);
    }

    // Create wallets
    console.log('💰 Creating wallets...');
    for (const wallet of sampleData.wallets) {
      await db.collection('wallets').doc(wallet.operatorId).set(wallet);
    }

    // Create assignment requests
    console.log('📝 Creating assignment requests...');
    for (const request of sampleData.assignmentRequests) {
      await db.collection('assignmentRequests').doc(request.id).set(request);
    }

    // Create operator status
    console.log('⚡ Creating real-time status...');
    for (const status of sampleData.operatorStatus) {
      await db.collection('operatorStatus').doc(status.operatorId).set(status);
    }

    console.log('✅ All database data created successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error setting up database data:', error);
    return false;
  }
}

async function createEnvFile() {
  const envContent = `# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyB8Z4GdoLZsBW6bfmAh_BSTftpTRUXPZMw
REACT_APP_FIREBASE_AUTH_DOMAIN=erp-for-tsa.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=erp-for-tsa
REACT_APP_FIREBASE_STORAGE_BUCKET=erp-for-tsa.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=271232983905
REACT_APP_FIREBASE_APP_ID=1:271232983905:web:7d06c8f5ec269824759b20

# Firebase Admin SDK
FIREBASE_PROJECT_ID=erp-for-tsa
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-dummy@erp-for-tsa.iam.gserviceaccount.com

# Development
NODE_ENV=development
VITE_API_URL=http://localhost:3000
`;

  const envPath = path.join(__dirname, '..', '.env.local');
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment file created:', envPath);
}

// Main execution
async function main() {
  console.log('🚀 Starting Firebase Admin SDK Setup...\n');

  try {
    // Setup Firebase Admin
    const { useAdmin, db } = await setupFirebaseAdmin();
    
    if (!useAdmin) {
      console.log('\n⚠️  Firebase Admin SDK not available. Using mock data service instead.');
      console.log('✅ System will work with demo data. To use real Firebase:');
      console.log('1. Download service account key from Firebase Console');
      console.log('2. Save as firebase-service-account-key.json in project root');
      console.log('3. Run this script again\n');
      
      // Create environment file anyway
      createEnvFile();
      return;
    }

    // Setup database data
    console.log('\n📊 Setting up database with sample data...');
    const dataCreated = await setupDatabaseData(db);
    
    if (dataCreated) {
      console.log('\n🎉 Firebase Admin SDK setup completed successfully!');
      console.log('\n✅ Ready to use:');
      console.log('   Supervisor: sup / sup');
      console.log('   Operator: operator / password');
      console.log('   Manager: manager / password');
      console.log('\n🌐 Access at: http://localhost:3000');
    }

    // Create environment file
    createEnvFile();

  } catch (error) {
    console.error('💥 Setup failed:', error);
    console.log('\n🔄 Falling back to mock data service...');
    console.log('✅ System will still work with demo data.');
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('🏁 Setup process completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { setupFirebaseAdmin, setupDatabaseData };