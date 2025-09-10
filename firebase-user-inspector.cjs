#!/usr/bin/env node

// Comprehensive Firebase user inspection and management tool
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    let initialized = false;
    
    // Method 1: Service account key in infrastructure folder
    try {
      const serviceAccount = require('./src/infrastructure/firebase/service-account-key.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: 'https://erp-for-tsa-default-rtdb.firebaseio.com'
      });
      console.log('✅ Initialized with service account key (infrastructure)');
      initialized = true;
    } catch (serviceError) {
      // Try alternative location
    }

    // Method 2: Service account key in root
    if (!initialized) {
      try {
        const serviceAccount = require('./firebase-service-account-key.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: 'https://erp-for-tsa-default-rtdb.firebaseio.com'
        });
        console.log('✅ Initialized with service account key (root)');
        initialized = true;
      } catch (altError) {
        // Try ADC
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
    console.log('\n💡 AUTHENTICATION SETUP:');
    console.log('Choose one of these methods:');
    console.log('1. Download service account key from Firebase Console');
    console.log('   → Save as firebase-service-account-key.json in project root');
    console.log('2. Use Firebase CLI: firebase login && firebase use erp-for-tsa');
    console.log('3. Set GOOGLE_APPLICATION_CREDENTIALS environment variable');
    process.exit(1);
  }
}

const db = admin.firestore();

async function inspectAllUsers() {
  console.log('🔍 COMPREHENSIVE FIREBASE USER INSPECTION\n');
  console.log('=' * 60);
  
  const collections = ['operators', 'supervisors', 'management'];
  let totalUsers = 0;
  let usersWithIssues = 0;
  const allUsers = [];
  
  for (const collection of collections) {
    try {
      console.log(`\n📂 ${collection.toUpperCase()} COLLECTION:`);
      console.log('-' * 40);
      
      const snapshot = await db.collection(collection).get();
      
      if (snapshot.empty) {
        console.log('   (empty collection)');
        continue;
      }
      
      console.log(`   Found ${snapshot.size} user(s)\n`);
      
      let collectionIndex = 1;
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const user = {
          collection,
          documentId: doc.id,
          ...data
        };
        allUsers.push(user);
        totalUsers++;
        
        console.log(`   ${collectionIndex}. Document ID: "${doc.id}"`);
        console.log(`      Username: "${data.username || 'N/A'}"`);
        console.log(`      Name: "${data.name || 'N/A'}"`);
        console.log(`      Role: "${data.role || 'N/A'}"`);
        console.log(`      Email: "${data.email || 'N/A'}"`);
        console.log(`      Active: ${data.active !== false ? '✅ Yes' : '❌ No'}`);
        console.log(`      Has Password: ${data.passwordHash ? '✅ Yes' : '❌ No'}`);
        
        // Show decoded password if available
        if (data.passwordHash) {
          try {
            const decodedPassword = Buffer.from(data.passwordHash, 'base64').toString();
            console.log(`      Password: "${decodedPassword}"`);
          } catch (decodeError) {
            console.log(`      Password Hash: ${data.passwordHash.substring(0, 20)}...`);
          }
        }
        
        console.log(`      Created: ${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString() : 'N/A'}`);
        console.log(`      Last Login: ${data.lastLogin ? new Date(data.lastLogin.toDate()).toLocaleString() : 'Never'}`);
        
        // Check for issues
        const issues = [];
        if (!data.passwordHash) issues.push('Missing password hash');
        if (data.active === false) issues.push('Account deactivated');
        if (!data.username) issues.push('Missing username');
        if (!data.name) issues.push('Missing name');
        
        if (issues.length > 0) {
          usersWithIssues++;
          console.log(`      ⚠️  Issues: ${issues.join(', ')}`);
        }
        
        // Role-specific information
        if (collection === 'operators') {
          console.log(`      Machine: ${data.machineType || 'N/A'}`);
          console.log(`      Skills: ${Array.isArray(data.skills) ? data.skills.join(', ') : 'N/A'}`);
          console.log(`      Efficiency: ${data.averageEfficiency || 'N/A'}`);
        } else if (collection === 'supervisors') {
          console.log(`      Department: ${data.department || 'N/A'}`);
          console.log(`      Team Size: ${data.managedOperatorCount || data.teamSize || 'N/A'}`);
        }
        
        console.log(`      Permissions: ${Array.isArray(data.permissions) ? data.permissions.join(', ') : 'N/A'}`);
        console.log('');
        
        collectionIndex++;
      }
      
    } catch (error) {
      console.error(`   ❌ Error reading ${collection}:`, error.message);
    }
  }
  
  // Summary
  console.log('\n' + '=' * 60);
  console.log('📊 INSPECTION SUMMARY:');
  console.log('=' * 60);
  console.log(`Total users found: ${totalUsers}`);
  console.log(`Users with issues: ${usersWithIssues}`);
  console.log(`Collections checked: ${collections.join(', ')}`);
  
  // Search for "durga" specifically
  console.log('\n🎯 DURGA USER SEARCH:');
  console.log('-' * 30);
  const durgaUsers = allUsers.filter(user => 
    user.username?.toLowerCase().includes('durga') || 
    user.documentId?.toLowerCase().includes('durga') ||
    user.name?.toLowerCase().includes('durga')
  );
  
  if (durgaUsers.length === 0) {
    console.log('❌ No "durga" user found in any collection');
    console.log('\n🔧 TO CREATE DURGA USER:');
    console.log('   node create-operator-durga.cjs');
  } else {
    console.log(`✅ Found ${durgaUsers.length} user(s) matching "durga":`);
    durgaUsers.forEach((user, index) => {
      console.log(`\n   ${index + 1}. Collection: ${user.collection}`);
      console.log(`      Document ID: ${user.documentId}`);
      console.log(`      Username: ${user.username}`);
      console.log(`      Name: ${user.name}`);
      console.log(`      Can Login: ${user.passwordHash && user.active !== false ? '✅ Yes' : '❌ No'}`);
    });
  }
  
  // Show users with login issues
  if (usersWithIssues > 0) {
    console.log('\n⚠️  USERS WITH LOGIN ISSUES:');
    console.log('-' * 35);
    const problematicUsers = allUsers.filter(user => 
      !user.passwordHash || user.active === false
    );
    
    problematicUsers.forEach(user => {
      console.log(`• ${user.username || user.documentId} (${user.collection})`);
      const issues = [];
      if (!user.passwordHash) issues.push('No password');
      if (user.active === false) issues.push('Deactivated');
      console.log(`  Issues: ${issues.join(', ')}`);
    });
    
    console.log('\n🔧 TO FIX PASSWORD ISSUES:');
    console.log('   node fix-all-operators.cjs');
  }
  
  return allUsers;
}

// Function to test authentication for a specific user
async function testUserAuthentication(username, password) {
  console.log(`\n🧪 TESTING AUTHENTICATION FOR: ${username}`);
  console.log('-' * 50);
  
  const normalizedUsername = username.toLowerCase();
  const collections = ['operators', 'supervisors', 'management'];
  
  for (const collection of collections) {
    try {
      // Try lowercase first
      let userDoc = await db.collection(collection).doc(normalizedUsername).get();
      if (!userDoc.exists() && username !== normalizedUsername) {
        // Try original case
        userDoc = await db.collection(collection).doc(username).get();
      }
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log(`✅ Found user in ${collection} collection`);
        console.log(`   Document ID: ${userDoc.id}`);
        console.log(`   Username field: ${userData.username}`);
        console.log(`   Name: ${userData.name}`);
        console.log(`   Active: ${userData.active !== false ? 'Yes' : 'No'}`);
        
        if (!userData.passwordHash) {
          console.log('❌ AUTHENTICATION FAILED: No password hash stored');
          return false;
        }
        
        if (userData.active === false) {
          console.log('❌ AUTHENTICATION FAILED: Account is deactivated');
          return false;
        }
        
        // Test password
        const storedPasswordHash = userData.passwordHash;
        const providedPasswordHash = Buffer.from(password).toString('base64');
        
        console.log(`   Stored hash: ${storedPasswordHash}`);
        console.log(`   Provided hash: ${providedPasswordHash}`);
        
        if (storedPasswordHash === providedPasswordHash) {
          console.log('✅ AUTHENTICATION SUCCESS: Password matches!');
          return true;
        } else {
          console.log('❌ AUTHENTICATION FAILED: Password does not match');
          
          // Try to decode stored password for debugging
          try {
            const storedPassword = Buffer.from(storedPasswordHash, 'base64').toString();
            console.log(`   Stored password: "${storedPassword}"`);
            console.log(`   Provided password: "${password}"`);
          } catch (error) {
            console.log('   Could not decode stored password hash');
          }
          
          return false;
        }
      }
    } catch (error) {
      console.log(`❌ Error checking ${collection}:`, error.message);
    }
  }
  
  console.log('❌ AUTHENTICATION FAILED: User not found in any collection');
  return false;
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Firebase User Inspector - Debug authentication issues');
    console.log('\nUsage:');
    console.log('  node firebase-user-inspector.cjs                    # Inspect all users');
    console.log('  node firebase-user-inspector.cjs --test durga pass  # Test login');
    console.log('  node firebase-user-inspector.cjs --search durga     # Search for user');
    return;
  }
  
  if (args[0] === '--test' && args.length >= 3) {
    const username = args[1];
    const password = args[2];
    await testUserAuthentication(username, password);
    return;
  }
  
  if (args[0] === '--search' && args[1]) {
    const searchTerm = args[1].toLowerCase();
    const allUsers = await inspectAllUsers();
    const matches = allUsers.filter(user =>
      user.username?.toLowerCase().includes(searchTerm) ||
      user.documentId?.toLowerCase().includes(searchTerm) ||
      user.name?.toLowerCase().includes(searchTerm)
    );
    
    console.log(`\n🔍 SEARCH RESULTS for "${searchTerm}":`);
    if (matches.length === 0) {
      console.log('No matches found');
    } else {
      matches.forEach(user => {
        console.log(`• ${user.username || user.documentId} (${user.collection}) - ${user.name}`);
      });
    }
    return;
  }
  
  // Default: inspect all users
  await inspectAllUsers();
}

main().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});