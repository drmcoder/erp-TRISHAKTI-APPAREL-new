// Script to create a supervisor account for testing delete functionality
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config - these are the same values used in your app
const firebaseConfig = {
  apiKey: "AIzaSyB8Z4GdoLZsBW6bfmAh_BSTftpTRUXPZMw",
  authDomain: "erp-for-tsa.firebaseapp.com",
  databaseURL: "https://erp-for-tsa-default-rtdb.firebaseio.com",
  projectId: "erp-for-tsa",
  storageBucket: "erp-for-tsa.firebasestorage.app",
  messagingSenderId: "271232983905",
  appId: "1:271232983905:web:7d06c8f5ec269824759b20",
  measurementId: "G-6CYWPS4N0G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createSupervisor() {
  try {
    console.log('Creating supervisor account...');
    
    // Create supervisor document
    const supervisorData = {
      username: 'supervisor',
      name: 'Test Supervisor',
      role: 'supervisor',
      email: 'supervisor@tsa.com',
      passwordHash: btoa('password'), // Base64 encoded password
      permissions: ['view_operators', 'manage_operators', 'assign_work', 'view_reports'],
      department: 'Production',
      active: true,
      createdAt: serverTimestamp(),
      lastLogin: null
    };

    await setDoc(doc(db, 'supervisors', 'supervisor'), supervisorData);
    console.log('✅ Supervisor account created successfully!');
    console.log('Username: supervisor');
    console.log('Password: password');
    console.log('Role: supervisor');
    
  } catch (error) {
    console.error('❌ Error creating supervisor:', error);
  }
}

createSupervisor();