/**
 * Initial Data Setup Script for ERP System
 * Run: node scripts/setup-initial-data.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  // Your Firebase config here
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const createInitialData = async () => {
  try {
    console.log('🚀 Starting initial data setup...');

    // Sample users
    const users = [
      {
        id: 'admin1',
        email: 'admin@garment-erp.com',
        name: 'System Admin',
        role: 'admin',
        permissions: ['*'],
        active: true,
        createdAt: serverTimestamp(),
      },
      {
        id: 'supervisor1',
        email: 'supervisor@garment-erp.com',
        name: 'Floor Supervisor',
        role: 'supervisor',
        department: 'sewing',
        permissions: ['assign_work', 'handle_damage', 'view_reports'],
        active: true,
        createdAt: serverTimestamp(),
      },
      {
        id: 'operator1',
        email: 'operator1@garment-erp.com',
        name: 'John Smith',
        role: 'operator',
        skills: ['overlock', 'single_needle', 'basic_sewing'],
        permissions: ['complete_work', 'report_damage', 'self_assign'],
        machineType: 'overlock',
        active: true,
        createdAt: serverTimestamp(),
      },
    ];

    // Create users
    for (const user of users) {
      await addDoc(collection(db, 'users'), user);
      console.log(`✅ Created user: ${user.name}`);
    }

    // Sample work items
    const workItems = [
      {
        bundleNumber: 'B001',
        articleNumber: '8085',
        articleName: 'Blue T-Shirt',
        operation: 'Sleeve Attachment',
        pieces: 20,
        rate: 15,
        totalValue: 300,
        status: 'pending',
        machineType: 'overlock',
        priority: 'normal',
        createdAt: serverTimestamp(),
      },
      {
        bundleNumber: 'B002',
        articleNumber: '8086',
        articleName: 'Red Polo Shirt',
        operation: 'Button Sewing',
        pieces: 15,
        rate: 8,
        totalValue: 120,
        status: 'pending',
        machineType: 'single_needle',
        priority: 'high',
        createdAt: serverTimestamp(),
      },
    ];

    // Create work items
    for (const workItem of workItems) {
      await addDoc(collection(db, 'workItems'), workItem);
      console.log(`✅ Created work item: ${workItem.bundleNumber}`);
    }

    console.log('🎉 Initial data setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up initial data:', error);
    process.exit(1);
  }
};

// Run the setup
createInitialData();
