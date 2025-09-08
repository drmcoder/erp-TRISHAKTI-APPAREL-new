// Node.js script to setup Firebase users
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyB8Z4GdoLZsBW6bfmAh_BSTftpTRUXPZMw',
  authDomain: 'erp-for-tsa.firebaseapp.com',
  databaseURL: 'https://erp-for-tsa-default-rtdb.firebaseio.com',
  projectId: 'erp-for-tsa',
  storageBucket: 'erp-for-tsa.firebasestorage.app',
  messagingSenderId: '271232983905',
  appId: '1:271232983905:web:7d06c8f5ec269824759b20',
  measurementId: 'G-6CYWPS4N0G',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collections
const COLLECTIONS = {
  SUPERVISORS: 'supervisors',
  MANAGEMENT: 'management',
};

// Users to create
const USERS_TO_CREATE = [
  {
    username: 'sup',
    password: 'sup',
    name: 'Supervisor User',
    role: 'supervisor',
    email: 'supervisor@tsa.com',
    permissions: [
      'view_dashboard',
      'manage_operators',
      'assign_work',
      'view_analytics',
      'manage_bundles',
      'view_quality',
      'create_wip_entry',
      'manage_templates',
      'view_live_dashboard'
    ]
  },
  {
    username: 'admin',
    password: 'admin',
    name: 'Administrator',
    role: 'admin',
    email: 'admin@tsa.com',
    permissions: [
      'view_dashboard',
      'manage_operators',
      'assign_work', 
      'view_analytics',
      'manage_bundles',
      'view_quality',
      'create_wip_entry',
      'manage_templates',
      'view_live_dashboard',
      'manage_users',
      'system_settings',
      'full_access'
    ]
  }
];

async function setupFirebaseUsers() {
  console.log('🚀 Setting up Firebase users...');
  
  try {
    for (const userData of USERS_TO_CREATE) {
      console.log(`Creating user: ${userData.username} (${userData.role})`);
      
      // Determine collection based on role
      const collection = userData.role === 'supervisor' 
        ? COLLECTIONS.SUPERVISORS 
        : COLLECTIONS.MANAGEMENT;
      
      // Create user document
      const userDoc = {
        username: userData.username,
        name: userData.name,
        role: userData.role,
        email: userData.email,
        permissions: userData.permissions,
        active: true,
        // Store password hash (base64 for demo - NOT secure for production)
        passwordHash: Buffer.from(userData.password).toString('base64'),
        department: userData.role === 'supervisor' ? 'Production' : 'Administration',
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add role-specific fields
      if (userData.role === 'supervisor') {
        Object.assign(userDoc, {
          teamMembers: [],
          responsibleLines: ['Line 1', 'Line 2'],
          supervisorLevel: 'senior',
          managedOperatorCount: 0
        });
      } else if (userData.role === 'admin') {
        Object.assign(userDoc, {
          accessLevel: 'director',
          managedDepartments: ['Production', 'Quality', 'Management'],
          reportingTo: null
        });
      }
      
      // Save to Firestore
      await setDoc(doc(db, collection, userData.username), userDoc);
      
      console.log(`✅ Created ${userData.role} user: ${userData.username}`);
    }
    
    console.log('\n🎉 All users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Supervisor: sup / sup');
    console.log('Admin: admin / admin');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error setting up users:', error);
    process.exit(1);
  }
}

// Run the setup
setupFirebaseUsers();