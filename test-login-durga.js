// Test script to check durga user login using same method as web app
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

// Firebase config (using environment variables)
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

const COLLECTIONS = {
  OPERATORS: 'operators',
  SUPERVISORS: 'supervisors', 
  MANAGEMENT: 'management'
};

async function testUserLogin(username, password) {
  try {
    console.log(`🔍 Testing login for user: ${username}`);
    console.log(`🔍 Testing with password: ${password}`);
    
    const normalizedUsername = username.toLowerCase();
    const originalUsername = username;
    const providedPasswordHash = btoa(password);
    
    console.log(`📝 Normalized username: ${normalizedUsername}`);
    console.log(`📝 Expected password hash: ${providedPasswordHash}`);
    
    // Helper function to check both document ID and username field in a collection
    const checkCollection = async (collectionName) => {
      console.log(`\n📂 Checking ${collectionName} collection:`);
      
      // Method 1: Try document ID lookup (for older users where document ID = username)
      let snapshot = await getDoc(doc(db, collectionName, normalizedUsername));
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() };
        console.log(`   ✅ Found user with lowercase ID: ${normalizedUsername}`);
        console.log(`   📄 User data:`, JSON.stringify(data, null, 2));
        return data;
      } else {
        console.log(`   ❌ No user found with lowercase ID: ${normalizedUsername}`);
      }
      
      // Fallback to original case for backward compatibility (only if different)
      if (originalUsername !== normalizedUsername) {
        snapshot = await getDoc(doc(db, collectionName, originalUsername));
        if (snapshot.exists()) {
          const data = { id: snapshot.id, ...snapshot.data() };
          console.log(`   ✅ Found user with original case ID: ${originalUsername}`);
          console.log(`   📄 User data:`, JSON.stringify(data, null, 2));
          return data;
        } else {
          console.log(`   ❌ No user found with original case ID: ${originalUsername}`);
        }
      }
      
      // Method 2: Query by username field (for newer users with auto-generated document IDs)
      console.log(`   🔍 Querying by username field: ${normalizedUsername}`);
      const usernameQuery = query(
        collection(db, collectionName),
        where('username', '==', normalizedUsername),
        limit(1)
      );
      
      const querySnapshot = await getDocs(usernameQuery);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const data = { id: userDoc.id, ...userDoc.data() };
        console.log(`   ✅ Found user via username query: ${normalizedUsername}`);
        console.log(`   📄 Document ID: ${userDoc.id}`);
        console.log(`   📄 User data:`, JSON.stringify(data, null, 2));
        return data;
      } else {
        console.log(`   ❌ No user found via username query: ${normalizedUsername}`);
      }
      
      // Fallback: try original case in username field
      if (originalUsername !== normalizedUsername) {
        console.log(`   🔍 Querying by original username field: ${originalUsername}`);
        const originalQuery = query(
          collection(db, collectionName),
          where('username', '==', originalUsername),
          limit(1)
        );
        
        const originalQuerySnapshot = await getDocs(originalQuery);
        if (!originalQuerySnapshot.empty) {
          const userDoc = originalQuerySnapshot.docs[0];
          const data = { id: userDoc.id, ...userDoc.data() };
          console.log(`   ✅ Found user via original username query: ${originalUsername}`);
          console.log(`   📄 Document ID: ${userDoc.id}`);
          console.log(`   📄 User data:`, JSON.stringify(data, null, 2));
          return data;
        } else {
          console.log(`   ❌ No user found via original username query: ${originalUsername}`);
        }
      }
      
      return null;
    };

    // Check operators collection
    let user = await checkCollection(COLLECTIONS.OPERATORS);
    if (user) {
      console.log(`\n🎯 User found in OPERATORS collection`);
      
      // Validate authentication
      const storedPasswordHash = user.passwordHash;
      console.log(`🔐 Stored password hash: ${storedPasswordHash}`);
      console.log(`🔐 Provided password hash: ${providedPasswordHash}`);
      
      if (storedPasswordHash && storedPasswordHash === providedPasswordHash) {
        console.log(`✅ Password matches! Login should succeed.`);
      } else {
        console.log(`❌ Password mismatch! This is why login fails.`);
        if (storedPasswordHash) {
          try {
            const storedPassword = atob(storedPasswordHash);
            console.log(`🔓 Stored password decoded: "${storedPassword}"`);
          } catch (e) {
            console.log(`🔓 Could not decode stored password hash`);
          }
        } else {
          console.log(`🔓 No password hash stored for this user`);
        }
      }
      
      if (!user.active) {
        console.log(`⚠️ User account is deactivated (active: false)`);
      } else {
        console.log(`✅ User account is active`);
      }
      
      return;
    }

    // Check supervisors collection
    user = await checkCollection(COLLECTIONS.SUPERVISORS);
    if (user) {
      console.log(`\n🎯 User found in SUPERVISORS collection`);
      // Same validation logic as above
      return;
    }

    // Check management collection
    user = await checkCollection(COLLECTIONS.MANAGEMENT);
    if (user) {
      console.log(`\n🎯 User found in MANAGEMENT collection`);
      // Same validation logic as above
      return;
    }

    console.log(`\n❌ User "${username}" not found in any collection`);
    
  } catch (error) {
    console.error('❌ Error testing login:', error);
  }
}

// Test both users
async function main() {
  console.log('🧪 Testing user authentication...\n');
  
  await testUserLogin('durga', 'password');
  console.log('\n' + '='.repeat(60) + '\n');
  await testUserLogin('ram', 'password');
  
  process.exit(0);
}

main().catch(console.error);