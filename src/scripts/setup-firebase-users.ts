// Script to create Firebase users with proper credentials
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';
import type { User } from '../types/entities';

interface UserSetupData {
  username: string;
  password: string;
  name: string;
  role: 'supervisor' | 'admin';
  email?: string;
  permissions: string[];
}

// User accounts to create
const USERS_TO_CREATE: UserSetupData[] = [
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

export async function setupFirebaseUsers() {
  console.log('🚀 Setting up Firebase users...');
  
  try {
    for (const userData of USERS_TO_CREATE) {
      console.log(`Creating user: ${userData.username} (${userData.role})`);
      
      // Determine collection based on role
      const collection = userData.role === 'supervisor' 
        ? COLLECTIONS.SUPERVISORS 
        : COLLECTIONS.MANAGEMENT;
      
      // Create user document
      const userDoc: Partial<User> = {
        username: userData.username,
        name: userData.name,
        role: userData.role as any,
        email: userData.email,
        permissions: userData.permissions,
        active: true,
        createdAt: new Date(),
        // Store password hash in real implementation
        // For demo purposes, we'll use a simple method
        passwordHash: btoa(userData.password), // Base64 encode (NOT secure for production)
        department: userData.role === 'supervisor' ? 'Production' : 'Administration',
        lastLogin: null
      };
      
      // Add role-specific fields
      if (userData.role === 'supervisor') {
        Object.assign(userDoc, {
          teamMembers: [],
          responsibleLines: ['Line 1', 'Line 2'],
          supervisorLevel: 'senior' as const,
          managedOperatorCount: 0
        });
      } else if (userData.role === 'admin') {
        Object.assign(userDoc, {
          accessLevel: 'director' as const,
          managedDepartments: ['Production', 'Quality', 'Management'],
          reportingTo: null
        });
      }
      
      // Save to Firestore with normalized username as document ID
      await setDoc(doc(db, collection, userData.username.toLowerCase()), {
        ...userDoc,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Created ${userData.role} user: ${userData.username}`);
    }
    
    console.log('🎉 All users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Supervisor: sup / sup');
    console.log('Admin: admin / admin');
    
  } catch (error) {
    console.error('❌ Error setting up users:', error);
    throw error;
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  setupFirebaseUsers()
    .then(() => {
      console.log('Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}