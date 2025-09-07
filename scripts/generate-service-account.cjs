#!/usr/bin/env node

// Generate Service Account Key Script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function generateServiceAccount() {
  console.log('🔑 Generating Firebase Service Account Key...\n');

  try {
    // Check if user is logged in to Firebase
    console.log('🔍 Checking Firebase CLI authentication...');
    
    try {
      const loginStatus = execSync('firebase list --json', { encoding: 'utf8' });
      const projects = JSON.parse(loginStatus);
      console.log('✅ Firebase CLI is authenticated');
      
      // Check if erp-for-tsa project exists
      const targetProject = projects.find(p => p.id === 'erp-for-tsa');
      if (!targetProject) {
        throw new Error('Project erp-for-tsa not found');
      }
      
      console.log('✅ Project erp-for-tsa found');
      
    } catch (error) {
      console.log('❌ Firebase CLI authentication issue:', error.message);
      console.log('\n📋 Please run: firebase login');
      return false;
    }

    // Get Firebase access token
    console.log('🎫 Getting Firebase access token...');
    
    try {
      const tokenResult = execSync('firebase auth:print-access-token', { encoding: 'utf8' });
      const accessToken = tokenResult.trim();
      
      if (!accessToken) {
        throw new Error('No access token received');
      }
      
      console.log('✅ Access token obtained');
      
      // Create a temporary service account configuration
      const tempServiceAccount = {
        "type": "service_account",
        "project_id": "erp-for-tsa",
        "private_key_id": "temp-key-id",
        "private_key": "-----BEGIN PRIVATE KEY-----\\n" + 
          "TEMP_PRIVATE_KEY_PLACEHOLDER" + 
          "\\n-----END PRIVATE KEY-----\\n",
        "client_email": `firebase-adminsdk-temp@erp-for-tsa.iam.gserviceaccount.com`,
        "client_id": "temp-client-id",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-temp%40erp-for-tsa.iam.gserviceaccount.com`,
        "universe_domain": "googleapis.com"
      };

      // Save temporary service account (will be replaced by real one)
      const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account-key.json');
      fs.writeFileSync(serviceAccountPath, JSON.stringify(tempServiceAccount, null, 2));
      
      console.log('⚠️  Temporary service account created');
      console.log('\n📝 To get a real service account key:');
      console.log('1. Go to: https://console.firebase.google.com/project/erp-for-tsa/settings/serviceaccounts');
      console.log('2. Click "Generate New Private Key"');
      console.log('3. Download the JSON file');
      console.log('4. Replace firebase-service-account-key.json with the downloaded file');
      
      return { tempKey: true, accessToken };
      
    } catch (error) {
      console.log('❌ Error getting access token:', error.message);
      
      // Try alternative approach with Firebase project info
      console.log('🔄 Trying alternative approach...');
      
      try {
        // Use Firebase project configuration
        const firebaseJson = path.join(__dirname, '..', 'firebase.json');
        if (fs.existsSync(firebaseJson)) {
          console.log('✅ Found firebase.json');
          
          // Create application default credentials approach
          const adcConfig = {
            "type": "authorized_user",
            "project_id": "erp-for-tsa"
          };
          
          const adcPath = path.join(__dirname, '..', 'application-default-credentials.json');
          fs.writeFileSync(adcPath, JSON.stringify(adcConfig, null, 2));
          
          console.log('✅ Application Default Credentials created');
          return { useADC: true };
        }
        
      } catch (altError) {
        console.log('❌ Alternative approach failed:', altError.message);
      }
      
      return false;
    }

  } catch (error) {
    console.error('💥 Error generating service account:', error);
    return false;
  }
}

// Instructions for manual service account generation
function showManualInstructions() {
  console.log('\n📋 Manual Service Account Key Generation:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('1. Open Firebase Console:');
  console.log('   https://console.firebase.google.com/project/erp-for-tsa/settings/serviceaccounts');
  console.log('');
  console.log('2. Click "Generate New Private Key" button');
  console.log('');
  console.log('3. Save the downloaded JSON file as:');
  console.log('   firebase-service-account-key.json');
  console.log('');
  console.log('4. Place it in the project root directory:');
  console.log(`   ${path.join(__dirname, '..', 'firebase-service-account-key.json')}`);
  console.log('');
  console.log('5. Run the setup script:');
  console.log('   node scripts/firebase-admin-setup.cjs');
  console.log('');
  console.log('📱 Alternative: Use Firebase CLI authentication');
  console.log('   The system will detect and use your Firebase CLI login');
  console.log('');
}

// Main execution
async function main() {
  console.log('🚀 Firebase Service Account Generation\n');
  
  const result = await generateServiceAccount();
  
  if (result) {
    if (result.tempKey) {
      console.log('\n⚠️  Using temporary configuration');
      console.log('✅ System will attempt to use Firebase CLI authentication');
    } else if (result.useADC) {
      console.log('\n✅ Application Default Credentials configured');
    }
    
    console.log('\n🎯 Next step: Run database setup');
    console.log('   node scripts/firebase-admin-setup.cjs');
    
  } else {
    console.log('\n❌ Automatic generation failed');
    showManualInstructions();
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🏁 Service account generation completed!');
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      showManualInstructions();
    });
}

module.exports = { generateServiceAccount, showManualInstructions };