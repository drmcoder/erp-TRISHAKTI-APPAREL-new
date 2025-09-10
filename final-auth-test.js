// Final authentication test using exact same logic as the web app
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

// Exact same authentication logic as AuthService
async function findUser(username) {
  try {
    const normalizedUsername = username.toLowerCase();
    const originalUsername = username;
    
    // Helper function to check both document ID and username field in a collection
    const checkCollection = async (collectionName) => {
      // Method 1: Try document ID lookup (for older users where document ID = username)
      let snapshot = await getDoc(doc(db, collectionName, normalizedUsername));
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() };
      }
      
      // Fallback to original case for backward compatibility (only if different)
      if (originalUsername !== normalizedUsername) {
        snapshot = await getDoc(doc(db, collectionName, originalUsername));
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() };
        }
      }
      
      // Method 2: Query by username field (for newer users with auto-generated document IDs)
      const usernameQuery = query(
        collection(db, collectionName),
        where('username', '==', normalizedUsername),
        limit(1)
      );
      
      const querySnapshot = await getDocs(usernameQuery);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() };
      }
      
      // Fallback: try original case in username field
      if (originalUsername !== normalizedUsername) {
        const originalQuery = query(
          collection(db, collectionName),
          where('username', '==', originalUsername),
          limit(1)
        );
        
        const originalQuerySnapshot = await getDocs(originalQuery);
        if (!originalQuerySnapshot.empty) {
          const userDoc = originalQuerySnapshot.docs[0];
          return { id: userDoc.id, ...userDoc.data() };
        }
      }
      
      return null;
    };

    // Check operators collection
    let user = await checkCollection(COLLECTIONS.OPERATORS);
    if (user) {
      return { success: true, data: user };
    }

    // Check supervisors collection
    user = await checkCollection(COLLECTIONS.SUPERVISORS);
    if (user) {
      return { success: true, data: user };
    }

    // Check management collection
    user = await checkCollection(COLLECTIONS.MANAGEMENT);
    if (user) {
      return { success: true, data: user };
    }

    return {
      success: false,
      error: 'User not found'
    };
  } catch (error) {
    console.error('Error finding user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function login(username, password) {
  try {
    console.log(`🚀 Testing login for: ${username} / ${password}`);
    
    // Find user
    const userResult = await findUser(username);
    
    if (!userResult.success || !userResult.data) {
      console.log('❌ User not found');
      return { success: false, error: 'Invalid username or password' };
    }

    const user = userResult.data;
    console.log(`✅ User found: ${user.name} (ID: ${user.id})`);

    // Check if user is active (handle both 'active' and 'isActive' fields)
    const isUserActive = user.active ?? user.isActive ?? false;
    if (!isUserActive) {
      console.log('❌ Account deactivated');
      return { success: false, error: 'Account is deactivated. Please contact administrator.' };
    }
    console.log('✅ User account is active');

    // Regular password validation
    const storedPasswordHash = user.passwordHash;
    const providedPasswordHash = btoa(password);
    
    console.log(`🔐 Stored hash: ${storedPasswordHash}`);
    console.log(`🔐 Provided hash: ${providedPasswordHash}`);
    
    if (!storedPasswordHash || storedPasswordHash !== providedPasswordHash) {
      console.log('❌ Password mismatch');
      return { success: false, error: 'Invalid username or password' };
    }

    console.log('🎉 Authentication successful!');
    return { success: true, data: user };

  } catch (error) {
    console.error('❌ Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

async function main() {
  console.log('🧪 Final Authentication Test\n');
  
  const result = await login('durga', 'password');
  
  if (result.success) {
    console.log('\n✅ LOGIN SUCCESS!');
    console.log(`Welcome, ${result.data.name}!`);
  } else {
    console.log('\n❌ LOGIN FAILED!');
    console.log(`Error: ${result.error}`);
  }
  
  process.exit(0);
}

main().catch(console.error);