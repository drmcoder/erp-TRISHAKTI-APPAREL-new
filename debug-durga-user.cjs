#!/usr/bin/env node

// Debug script to investigate the "durga" user login issue
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Try different authentication methods
    let initialized = false;
    
    // Method 1: Service account key
    try {
      const serviceAccount = require('./src/infrastructure/firebase/service-account-key.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://erp-for-tsa-default-rtdb.firebaseio.com'
      });
      console.log('✅ Initialized with service account key');
      initialized = true;
    } catch (serviceError) {
      console.log('⚠️  Service account key not found');
    }

    // Method 2: Try alternative service account location
    if (!initialized) {
      try {
        const serviceAccount = require('./firebase-service-account-key.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: 'https://erp-for-tsa-default-rtdb.firebaseio.com'
        });
        console.log('✅ Initialized with alternative service account key');
        initialized = true;
      } catch (altError) {
        console.log('⚠️  Alternative service account key not found');
      }
    }

    // Method 3: Application Default Credentials
    if (!initialized) {
      admin.initializeApp({
        projectId: 'erp-for-tsa',
        databaseURL: 'https://erp-for-tsa-default-rtdb.firebaseio.com'
      });
      console.log('✅ Initialized with Application Default Credentials');
      initialized = true;
    }

  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    console.log('\n💡 To use this debug tool:');
    console.log('1. Download service account key from Firebase Console');
    console.log('2. Save as firebase-service-account-key.json in project root');
    console.log('3. Or run: firebase login && firebase use erp-for-tsa');
    process.exit(1);
  }
}

const db = admin.firestore();

async function debugDurgaUser() {
  try {
    console.log('🕵️  Debugging "durga" user login issue...\n');
    
    // Test different case variations
    const usernameVariations = ['durga', 'Durga', 'DURGA', 'durgA'];
    const collections = ['operators', 'supervisors', 'management'];
    
    let foundUsers = [];
    
    console.log('🔍 Searching for "durga" user across all collections and case variations...\n');
    
    // Search across all collections and case variations
    for (const collection of collections) {
      console.log(`📂 Checking ${collection} collection:`);
      
      for (const username of usernameVariations) {
        try {
          const userDoc = await db.collection(collection).doc(username).get();
          if (userDoc.exists()) {
            const userData = userDoc.data();
            foundUsers.push({
              collection,
              documentId: userDoc.id,
              username: userData.username,
              data: userData
            });
            
            console.log(`   ✅ Found user with document ID: "${username}"`);
            console.log(`      Username field: "${userData.username || 'N/A'}"`);
            console.log(`      Name: "${userData.name || 'N/A'}"`);
            console.log(`      Role: "${userData.role || 'N/A'}"`);
            console.log(`      Active: ${userData.active !== false ? 'Yes' : 'No'}`);
            console.log(`      Has passwordHash: ${userData.passwordHash ? 'Yes' : 'No'}`);
            if (userData.passwordHash) {
              // Try to decode the hash to see the original password
              try {
                const decodedPassword = Buffer.from(userData.passwordHash, 'base64').toString();
                console.log(`      Stored password: "${decodedPassword}"`);
              } catch (decodeError) {
                console.log(`      Password hash (Base64): ${userData.passwordHash}`);
              }
            }
            console.log(`      Created: ${userData.createdAt ? new Date(userData.createdAt.toDate()).toLocaleString() : 'N/A'}`);
            console.log(`      Last Login: ${userData.lastLogin ? new Date(userData.lastLogin.toDate()).toLocaleString() : 'Never'}`);
            console.log('');
          }
        } catch (error) {
          // Silently continue if document doesn't exist
        }
      }
      
      if (foundUsers.filter(u => u.collection === collection).length === 0) {
        console.log(`   ❌ No "durga" user found in ${collection}`);
      }
    }
    
    console.log('\n📊 SUMMARY:');
    console.log(`Total users found: ${foundUsers.length}`);
    
    if (foundUsers.length === 0) {
      console.log('\n❌ NO "durga" USER FOUND!');
      console.log('This explains the "Invalid username or password" error.');
      console.log('\n🔧 SUGGESTED ACTIONS:');
      console.log('1. Check if the user was created in a different Firebase project');
      console.log('2. Verify the exact username spelling with the person who created it');
      console.log('3. Check if the user was created with a different case variation');
      console.log('4. Look for the user in Firebase Console manually');
      console.log('5. Create the user using one of the setup scripts');
      
      // Show how to create the user
      console.log('\n📝 To create a "durga" user, you can:');
      console.log('   • Run: node create-operator-durga.cjs (see example below)');
      console.log('   • Use Firebase Console to create manually');
      console.log('   • Use the existing setup scripts with modifications');
      
    } else {
      console.log('\n✅ USER(S) FOUND:');
      foundUsers.forEach((user, index) => {
        console.log(`\n${index + 1}. Collection: ${user.collection}`);
        console.log(`   Document ID: ${user.documentId}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Name: ${user.data.name}`);
        console.log(`   Active: ${user.data.active !== false ? 'Yes' : 'No'}`);
        console.log(`   Has Password: ${user.data.passwordHash ? 'Yes' : 'No'}`);
        
        // Validate login would work
        if (!user.data.passwordHash) {
          console.log('   ❌ ISSUE: Missing password hash!');
        } else if (user.data.active === false) {
          console.log('   ❌ ISSUE: User account is deactivated!');
        } else {
          console.log('   ✅ User should be able to log in');
        }
      });
      
      // Show authentication debugging steps
      console.log('\n🔧 DEBUGGING STEPS:');
      console.log('1. Try logging in with exact case as stored in username field');
      console.log('2. If password hash exists, try the decoded password shown above');
      console.log('3. Check if user account is active');
      console.log('4. Verify you\'re using the correct Firebase project');
    }
    
    // List all users in each collection for reference
    console.log('\n📋 ALL USERS IN DATABASE:');
    for (const collection of collections) {
      try {
        const snapshot = await db.collection(collection).get();
        console.log(`\n${collection.toUpperCase()} (${snapshot.size} users):`);
        if (snapshot.empty) {
          console.log('   (empty)');
        } else {
          snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`   • ID: "${doc.id}" | Username: "${data.username || 'N/A'}" | Name: "${data.name || 'N/A'}" | Active: ${data.active !== false ? 'Yes' : 'No'}`);
          });
        }
      } catch (error) {
        console.log(`   Error reading ${collection}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    process.exit(0);
  }
}

// Test authentication logic
async function testAuthLogic() {
  console.log('\n🧪 TESTING AUTH LOGIC:');
  console.log('This simulates how the AuthService.findUser() method works:\n');
  
  const testUsername = 'durga';
  console.log(`1. Normalizing username: "${testUsername}" → "${testUsername.toLowerCase()}"`);
  
  const collections = ['operators', 'supervisors', 'management'];
  for (const collection of collections) {
    console.log(`\n2. Checking ${collection} collection:`);
    
    // Try lowercase first (new format)
    try {
      const doc1 = await db.collection(collection).doc(testUsername.toLowerCase()).get();
      if (doc1.exists()) {
        console.log(`   ✅ Found with lowercase document ID`);
        return { collection, id: doc1.id, data: doc1.data() };
      } else {
        console.log(`   ❌ Not found with lowercase document ID`);
      }
    } catch (error) {
      console.log(`   ❌ Error with lowercase: ${error.message}`);
    }
    
    // Try original case (backward compatibility)
    if (testUsername !== testUsername.toLowerCase()) {
      try {
        const doc2 = await db.collection(collection).doc(testUsername).get();
        if (doc2.exists()) {
          console.log(`   ✅ Found with original case document ID`);
          return { collection, id: doc2.id, data: doc2.data() };
        } else {
          console.log(`   ❌ Not found with original case document ID`);
        }
      } catch (error) {
        console.log(`   ❌ Error with original case: ${error.message}`);
      }
    }
  }
  
  console.log('\n❌ User not found in any collection with any case variation');
  return null;
}

// Main execution
async function main() {
  await debugDurgaUser();
  await testAuthLogic();
}

main();