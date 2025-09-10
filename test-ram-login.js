// Test RAM login specifically to debug the maya patel issue
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

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

// Test exact login for RAM
async function testRamLogin() {
  try {
    console.log('🔍 Testing RAM login specifically...\n');
    
    const username = 'ram';
    const password = 'password';
    const normalizedUsername = username.toLowerCase();
    
    console.log(`🔍 Looking for user: ${username}`);
    console.log(`🔍 Normalized: ${normalizedUsername}`);
    
    // Query by username field in operators collection
    const usernameQuery = query(
      collection(db, COLLECTIONS.OPERATORS),
      where('username', '==', normalizedUsername),
      limit(1)
    );
    
    const querySnapshot = await getDocs(usernameQuery);
    
    if (querySnapshot.empty) {
      console.log('❌ No user found with username:', normalizedUsername);
      return;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = { id: userDoc.id, ...userDoc.data() };
    
    console.log('✅ Found user document:');
    console.log(`   📄 Document ID: ${userDoc.id}`);
    console.log(`   👤 Name: ${userData.name}`);
    console.log(`   🆔 Username: ${userData.username}`);
    console.log(`   📋 Employee ID: ${userData.employeeId}`);
    console.log(`   🎯 Role: ${userData.role}`);
    console.log(`   ✅ Active: ${userData.isActive ?? userData.active}`);
    
    // Test password
    const storedHash = userData.passwordHash;
    const providedHash = btoa(password);
    
    console.log(`\n🔐 Password verification:`);
    console.log(`   Stored hash: ${storedHash}`);
    console.log(`   Provided hash: ${providedHash}`);
    console.log(`   Match: ${storedHash === providedHash ? '✅ YES' : '❌ NO'}`);
    
    // Show full user object for debugging
    console.log('\n📋 Full user object:');
    console.log(JSON.stringify(userData, null, 2));
    
    // Check for any maya-related data
    const userString = JSON.stringify(userData).toLowerCase();
    if (userString.includes('maya')) {
      console.log('\n⚠️ WARNING: Found "maya" in user data!');
    } else {
      console.log('\n✅ No "maya" found in user data');
    }
    
  } catch (error) {
    console.error('❌ Error testing RAM login:', error);
  }
}

async function main() {
  await testRamLogin();
  process.exit(0);
}

main().catch(console.error);