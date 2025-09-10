// Test script to find and verify actual users created through supervisor dashboard
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Firebase config
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const COLLECTIONS = {
  OPERATORS: 'operators',
  SUPERVISORS: 'supervisors', 
  MANAGEMENT: 'management'
};

async function findAllUsers() {
  try {
    console.log('🔍 Searching for ALL users in database...\n');
    
    // Get all operators
    const operatorsSnapshot = await getDocs(collection(db, COLLECTIONS.OPERATORS));
    console.log('📂 OPERATORS COLLECTION:');
    if (operatorsSnapshot.empty) {
      console.log('   ❌ No operators found');
    } else {
      operatorsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   ✅ ID: ${doc.id}`);
        console.log(`      Name: ${data.name || 'N/A'}`);
        console.log(`      Username: ${data.username || 'N/A'}`);
        console.log(`      Employee ID: ${data.employeeId || 'N/A'}`);
        console.log(`      Active: ${data.active ?? data.isActive ?? 'N/A'}`);
        console.log(`      Password Hash: ${data.passwordHash ? 'EXISTS' : 'MISSING'}`);
        if (data.passwordHash) {
          try {
            const decoded = atob(data.passwordHash);
            console.log(`      Decoded Password: "${decoded}"`);
          } catch (e) {
            console.log(`      Password Hash Format: INVALID`);
          }
        }
        console.log('   ---');
      });
    }
    
    console.log('\n📂 SUPERVISORS COLLECTION:');
    const supervisorsSnapshot = await getDocs(collection(db, COLLECTIONS.SUPERVISORS));
    if (supervisorsSnapshot.empty) {
      console.log('   ❌ No supervisors found');
    } else {
      supervisorsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   ✅ ID: ${doc.id}`);
        console.log(`      Name: ${data.name || 'N/A'}`);
        console.log(`      Username: ${data.username || 'N/A'}`);
        console.log(`      Active: ${data.active ?? 'N/A'}`);
        console.log(`      Password Hash: ${data.passwordHash ? 'EXISTS' : 'MISSING'}`);
        console.log('   ---');
      });
    }
    
    console.log('\n📂 MANAGEMENT COLLECTION:');
    const managementSnapshot = await getDocs(collection(db, COLLECTIONS.MANAGEMENT));
    if (managementSnapshot.empty) {
      console.log('   ❌ No management users found');
    } else {
      managementSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`   ✅ ID: ${doc.id}`);
        console.log(`      Name: ${data.name || 'N/A'}`);
        console.log(`      Username: ${data.username || 'N/A'}`);
        console.log(`      Active: ${data.active ?? 'N/A'}`);
        console.log(`      Password Hash: ${data.passwordHash ? 'EXISTS' : 'MISSING'}`);
        console.log('   ---');
      });
    }

    // Look for users with names containing 'durga' or 'ram'
    console.log('\n🎯 SEARCHING FOR DURGA/RAM USERS BY NAME:');
    
    const collections = [COLLECTIONS.OPERATORS, COLLECTIONS.SUPERVISORS, COLLECTIONS.MANAGEMENT];
    for (const collectionName of collections) {
      const allDocs = await getDocs(collection(db, collectionName));
      allDocs.forEach(doc => {
        const data = doc.data();
        const name = (data.name || '').toLowerCase();
        const username = (data.username || '').toLowerCase();
        
        if (name.includes('durga') || username.includes('durga') || 
            name.includes('ram') || username.includes('ram')) {
          console.log(`   🎯 FOUND MATCH in ${collectionName}:`);
          console.log(`      Document ID: ${doc.id}`);
          console.log(`      Name: ${data.name}`);
          console.log(`      Username: ${data.username}`);
          console.log(`      Password Hash: ${data.passwordHash ? 'EXISTS' : 'MISSING'}`);
          if (data.passwordHash) {
            try {
              const decoded = atob(data.passwordHash);
              console.log(`      Decoded Password: "${decoded}"`);
            } catch (e) {
              console.log(`      Password Hash Format: INVALID`);
            }
          }
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error searching for users:', error);
  }
}

main().catch(console.error);

async function main() {
  await findAllUsers();
  process.exit(0);
}