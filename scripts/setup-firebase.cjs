#!/usr/bin/env node

// Firebase Setup Script for TSA ERP
// This script initializes the Firebase project with all necessary data structures

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
// Note: In production, use service account key
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://erp-for-tsa-default-rtdb.firebaseio.com"
  });
} else {
  console.log('⚠️  Service account not found. Using emulator mode.');
  // For development, you can use the emulator
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
  process.env.FIREBASE_DATABASE_EMULATOR_HOST = 'localhost:9000';
  
  admin.initializeApp({
    projectId: 'erp-for-tsa'
  });
}

const db = admin.firestore();
const rtdb = admin.database();
const auth = admin.auth();

// Collection and document structure setup
const COLLECTIONS = {
  OPERATORS: 'operators',
  SUPERVISORS: 'supervisors',
  MANAGEMENT: 'management',
  BUNDLES: 'bundles',
  WORK_ITEMS: 'workItems',
  WORK_ASSIGNMENTS: 'workAssignments',
  WORK_COMPLETIONS: 'workCompletions',
  QUALITY_ISSUES: 'qualityIssues',
  DAMAGE_REPORTS: 'damage_reports',
  OPERATOR_WALLETS: 'operatorWallets',
  NOTIFICATIONS: 'notifications',
  SYSTEM_SETTINGS: 'systemSettings',
  MACHINE_CONFIGS: 'machineConfigs',
  ARTICLE_TEMPLATES: 'articleTemplates',
  SIZE_CONFIGS: 'sizeConfigs'
};

// Sample data structures
const sampleData = {
  // System Settings
  systemSettings: {
    id: 'app_settings',
    companyName: 'Trishakti Apparel',
    workingHoursPerDay: 8,
    workingDaysPerWeek: 6,
    maxConcurrentWorkDefault: 3,
    qualityThreshold: 0.85,
    efficiencyThreshold: 0.75,
    paymentHoldThreshold: 0.1,
    autoApprovalThreshold: 0.9,
    emergencyContactEnabled: true,
    multiLanguageSupport: ['en', 'ne'],
    defaultLanguage: 'en',
    timezoneOffset: '+05:45',
    fiscalYearStart: '2024-07-16',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  },

  // Machine Configurations
  machineConfigs: [
    {
      id: 'machine_overlock_001',
      machineType: 'overlock',
      displayName: 'Overlock Machine',
      requiredSkillLevel: 'intermediate',
      maxOperators: 1,
      avgRatePerHour: 45,
      complexityFactor: 1.0,
      maintenanceRequired: false,
      lastMaintenance: null,
      specifications: {
        needleCount: 4,
        threadCount: 4,
        maxSpeed: 5000,
        brand: 'Brother'
      }
    },
    {
      id: 'machine_singleNeedle_001',
      machineType: 'singleNeedle',
      displayName: 'Single Needle Machine',
      requiredSkillLevel: 'beginner',
      maxOperators: 1,
      avgRatePerHour: 35,
      complexityFactor: 0.8,
      maintenanceRequired: false,
      lastMaintenance: null,
      specifications: {
        needleCount: 1,
        threadCount: 2,
        maxSpeed: 3000,
        brand: 'Juki'
      }
    },
    {
      id: 'machine_buttonhole_001',
      machineType: 'buttonhole',
      displayName: 'Buttonhole Machine',
      requiredSkillLevel: 'advanced',
      maxOperators: 1,
      avgRatePerHour: 25,
      complexityFactor: 1.3,
      maintenanceRequired: false,
      lastMaintenance: null,
      specifications: {
        buttonholeLength: '8-32mm',
        brand: 'Brother'
      }
    }
  ],

  // Size Configurations
  sizeConfigs: [
    {
      id: 'size_shirt_001',
      category: 'shirt',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      measurements: {
        'XS': { chest: 36, length: 26, sleeve: 24 },
        'S': { chest: 38, length: 27, sleeve: 25 },
        'M': { chest: 40, length: 28, sleeve: 26 },
        'L': { chest: 42, length: 29, sleeve: 27 },
        'XL': { chest: 44, length: 30, sleeve: 28 },
        'XXL': { chest: 46, length: 31, sleeve: 29 }
      }
    },
    {
      id: 'size_pant_001',
      category: 'pant',
      sizes: ['28', '30', '32', '34', '36', '38', '40'],
      measurements: {
        '28': { waist: 28, length: 40, inseam: 30 },
        '30': { waist: 30, length: 40, inseam: 30 },
        '32': { waist: 32, length: 42, inseam: 32 },
        '34': { waist: 34, length: 42, inseam: 32 },
        '36': { waist: 36, length: 44, inseam: 34 },
        '38': { waist: 38, length: 44, inseam: 34 },
        '40': { waist: 40, length: 44, inseam: 34 }
      }
    }
  ],

  // Article Templates
  articleTemplates: [
    {
      id: 'template_shirt_basic_001',
      articleNumber: 'TSA-SH-001',
      articleName: 'Basic Cotton Shirt',
      category: 'shirt',
      operations: [
        {
          operationId: 'op_001',
          operationName: 'Body Join',
          machineType: 'overlock',
          standardTime: 12,
          ratePerPiece: 8,
          requiredSkillLevel: 'intermediate',
          complexity: 6
        },
        {
          operationId: 'op_002',
          operationName: 'Sleeve Attach',
          machineType: 'overlock',
          standardTime: 8,
          ratePerPiece: 6,
          requiredSkillLevel: 'intermediate',
          complexity: 5
        },
        {
          operationId: 'op_003',
          operationName: 'Collar Attach',
          machineType: 'singleNeedle',
          standardTime: 15,
          ratePerPiece: 10,
          requiredSkillLevel: 'advanced',
          complexity: 8
        },
        {
          operationId: 'op_004',
          operationName: 'Button Hole',
          machineType: 'buttonhole',
          standardTime: 6,
          ratePerPiece: 4,
          requiredSkillLevel: 'advanced',
          complexity: 7
        },
        {
          operationId: 'op_005',
          operationName: 'Button Attach',
          machineType: 'buttonAttach',
          standardTime: 4,
          ratePerPiece: 3,
          requiredSkillLevel: 'beginner',
          complexity: 3
        }
      ],
      totalStandardTime: 45,
      totalRatePerPiece: 31,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],

  // Sample Operators
  sampleOperators: [
    {
      id: 'operator_maya_001',
      username: 'maya.sharma',
      employeeId: 'TSA-0001',
      name: 'Maya Sharma',
      role: 'operator',
      email: 'maya@tsa.com',
      phone: '+977-9841234567',
      machineTypes: ['overlock', 'flatlock'],
      primaryMachine: 'overlock',
      skillLevel: 'advanced',
      maxConcurrentWork: 4,
      shift: 'morning',
      hiredDate: '2023-01-15',
      currentStatus: 'idle',
      averageEfficiency: 0.89,
      qualityScore: 0.94,
      completedBundles: 245,
      totalWorkingDays: 180,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'operator_ram_001',
      username: 'ram.thapa',
      employeeId: 'TSA-0002',
      name: 'Ram Thapa',
      role: 'operator',
      email: 'ram@tsa.com',
      phone: '+977-9851234567',
      machineTypes: ['singleNeedle', 'buttonhole'],
      primaryMachine: 'singleNeedle',
      skillLevel: 'intermediate',
      maxConcurrentWork: 3,
      shift: 'morning',
      hiredDate: '2023-03-20',
      currentStatus: 'idle',
      averageEfficiency: 0.72,
      qualityScore: 0.88,
      completedBundles: 125,
      totalWorkingDays: 120,
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],

  // Sample Supervisors
  sampleSupervisors: [
    {
      id: 'supervisor_john_001',
      username: 'john.supervisor',
      employeeId: 'TSA-SUP-001',
      name: 'John Supervisor',
      role: 'supervisor',
      email: 'john@tsa.com',
      phone: '+977-9861234567',
      supervisorLevel: 'senior',
      responsibleLines: ['line_001', 'line_002'],
      teamMembers: ['operator_maya_001', 'operator_ram_001'],
      managedOperatorCount: 2,
      shift: 'morning',
      hiredDate: '2022-06-01',
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],

  // Realtime Database initial structure
  realtimeData: {
    operator_status: {
      'operator_maya_001': {
        status: 'idle',
        currentWorkItems: 0,
        lastUpdated: admin.database.ServerValue.TIMESTAMP,
        currentLocation: 'station_001',
        machineStatus: 'ready'
      },
      'operator_ram_001': {
        status: 'idle',
        currentWorkItems: 0,
        lastUpdated: admin.database.ServerValue.TIMESTAMP,
        currentLocation: 'station_002',
        machineStatus: 'ready'
      }
    },
    available_work: {},
    system_health: {
      status: 'operational',
      lastCheck: admin.database.ServerValue.TIMESTAMP,
      activeOperators: 2,
      pendingWork: 0
    }
  }
};

// Setup functions
async function setupFirestore() {
  console.log('🔧 Setting up Firestore collections and documents...');
  
  try {
    // Setup system settings
    await db.collection(COLLECTIONS.SYSTEM_SETTINGS).doc('app_settings').set(sampleData.systemSettings);
    console.log('✅ System settings configured');

    // Setup machine configurations
    for (const machine of sampleData.machineConfigs) {
      await db.collection(COLLECTIONS.MACHINE_CONFIGS).doc(machine.id).set(machine);
    }
    console.log('✅ Machine configurations added');

    // Setup size configurations
    for (const size of sampleData.sizeConfigs) {
      await db.collection(COLLECTIONS.SIZE_CONFIGS).doc(size.id).set(size);
    }
    console.log('✅ Size configurations added');

    // Setup article templates
    for (const template of sampleData.articleTemplates) {
      await db.collection(COLLECTIONS.ARTICLE_TEMPLATES).doc(template.id).set(template);
    }
    console.log('✅ Article templates added');

    // Setup sample operators
    for (const operator of sampleData.sampleOperators) {
      await db.collection(COLLECTIONS.OPERATORS).doc(operator.id).set(operator);
      
      // Create operator wallet
      await db.collection(COLLECTIONS.OPERATOR_WALLETS).doc(operator.id).set({
        operatorId: operator.id,
        availableAmount: 0,
        heldAmount: 0,
        totalEarned: 0,
        heldBundles: [],
        canWithdraw: true,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log('✅ Sample operators and wallets created');

    // Setup sample supervisors
    for (const supervisor of sampleData.sampleSupervisors) {
      await db.collection(COLLECTIONS.SUPERVISORS).doc(supervisor.id).set(supervisor);
    }
    console.log('✅ Sample supervisors created');

    console.log('🎉 Firestore setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up Firestore:', error);
    throw error;
  }
}

async function setupRealtimeDatabase() {
  console.log('🔧 Setting up Realtime Database structure...');
  
  try {
    await rtdb.ref().set(sampleData.realtimeData);
    console.log('✅ Realtime Database structure created');
    console.log('🎉 Realtime Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up Realtime Database:', error);
    throw error;
  }
}

async function setupAuthentication() {
  console.log('🔧 Setting up Authentication users...');
  
  try {
    // Create sample users
    const users = [
      {
        uid: 'operator_maya_001',
        email: 'maya@tsa.com',
        password: 'TsaMaya123!',
        displayName: 'Maya Sharma',
        customClaims: { role: 'operator' }
      },
      {
        uid: 'operator_ram_001',
        email: 'ram@tsa.com',
        password: 'TsaRam123!',
        displayName: 'Ram Thapa',
        customClaims: { role: 'operator' }
      },
      {
        uid: 'supervisor_john_001',
        email: 'john@tsa.com',
        password: 'TsaJohn123!',
        displayName: 'John Supervisor',
        customClaims: { role: 'supervisor' }
      }
    ];

    for (const user of users) {
      try {
        await auth.createUser({
          uid: user.uid,
          email: user.email,
          password: user.password,
          displayName: user.displayName
        });
        
        await auth.setCustomUserClaims(user.uid, user.customClaims);
        console.log(`✅ User created: ${user.email}`);
        
      } catch (error) {
        if (error.code === 'auth/uid-already-exists') {
          console.log(`⚠️  User already exists: ${user.email}`);
          // Update custom claims for existing user
          await auth.setCustomUserClaims(user.uid, user.customClaims);
        } else {
          console.error(`❌ Error creating user ${user.email}:`, error);
        }
      }
    }
    
    console.log('🎉 Authentication setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up Authentication:', error);
    throw error;
  }
}

async function setupIndexes() {
  console.log('📋 Firestore indexes are configured in firestore.indexes.json');
  console.log('   Run: firebase deploy --only firestore:indexes');
}

async function setupSecurityRules() {
  console.log('🔒 Firestore rules are configured in firestore.rules');
  console.log('   Run: firebase deploy --only firestore:rules');
}

// Main setup function
async function main() {
  console.log('🚀 Starting TSA ERP Firebase Setup...\n');
  
  try {
    await setupFirestore();
    console.log('');
    
    await setupRealtimeDatabase();
    console.log('');
    
    await setupAuthentication();
    console.log('');
    
    setupIndexes();
    console.log('');
    
    setupSecurityRules();
    console.log('');
    
    console.log('✨ TSA ERP Firebase setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Deploy indexes: firebase deploy --only firestore:indexes');
    console.log('2. Deploy rules: firebase deploy --only firestore:rules');
    console.log('3. Configure environment variables in your app');
    console.log('4. Test the setup with your application\n');
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  main().then(() => {
    console.log('Setup completed. Exiting...');
    process.exit(0);
  }).catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

module.exports = {
  setupFirestore,
  setupRealtimeDatabase,
  setupAuthentication,
  sampleData,
  COLLECTIONS
};