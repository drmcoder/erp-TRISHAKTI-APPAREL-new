# Firebase User Authentication Debugging Guide

## Problem: "Invalid username or password" for user "durga"

This guide provides comprehensive tools and steps to debug and resolve login issues for the "durga" user account.

## Quick Diagnosis

Run this command first to inspect the "durga" user:

```bash
node debug-durga-user.cjs
```

## Available Debugging Tools

### 1. **debug-durga-user.cjs** 
Specifically searches for the "durga" user across all collections and case variations.

**Usage:**
```bash
node debug-durga-user.cjs
```

**What it does:**
- Searches operators, supervisors, and management collections
- Checks different case variations (durga, Durga, DURGA, etc.)
- Shows password hash and login status
- Simulates the auth logic to identify issues

### 2. **firebase-user-inspector.cjs**
Comprehensive user inspection tool for all Firebase users.

**Usage:**
```bash
# Inspect all users
node firebase-user-inspector.cjs

# Search for specific user
node firebase-user-inspector.cjs --search durga

# Test authentication
node firebase-user-inspector.cjs --test durga password123
```

**What it provides:**
- Complete database user overview
- Login issue identification
- Password hash verification
- User permissions audit

### 3. **create-operator-durga.cjs**
Creates the "durga" operator user if it doesn't exist.

**Usage:**
```bash
# Create with default password
node create-operator-durga.cjs

# Create with custom password
node create-operator-durga.cjs --password=custom123

# Create with custom name
node create-operator-durga.cjs --name="Durga Singh"
```

## Authentication System Overview

Based on the codebase analysis, the authentication system works as follows:

### User Storage Collections:
- **operators** - Regular factory workers
- **supervisors** - Floor supervisors  
- **management** - Admin and management users

### Document ID Format:
- New format: `username.toLowerCase()` (e.g., "durga")
- Backward compatibility: Original case (e.g., "Durga")

### Password Storage:
- Passwords are Base64 encoded (NOT hashed for security)
- Format: `btoa(password)` or `Buffer.from(password).toString('base64')`

### Authentication Flow:
1. Normalize username to lowercase
2. Search operators → supervisors → management collections  
3. Try lowercase document ID first, then original case
4. Verify user is active (`active: true`)
5. Compare Base64 encoded passwords

## Common Issues and Solutions

### Issue 1: User doesn't exist
**Symptoms:** "Invalid username or password"
**Solution:** 
```bash
node create-operator-durga.cjs
```

### Issue 2: User exists but missing password hash
**Symptoms:** Login fails, user found but no passwordHash field
**Solution:**
```bash
node fix-all-operators.cjs
```

### Issue 3: User exists but account deactivated
**Symptoms:** "Account is deactivated"
**Solution:** Manually activate in Firebase Console or update via script

### Issue 4: Case sensitivity issues
**Symptoms:** User exists but username case doesn't match
**Solution:** The system handles this automatically, but verify with:
```bash
node firebase-user-inspector.cjs --search durga
```

### Issue 5: Wrong password
**Symptoms:** User found, active, has password, but login fails
**Solution:** Check actual stored password:
```bash
node firebase-user-inspector.cjs --test durga [actual_password]
```

## Firebase Setup Requirements

The debugging scripts require Firebase Admin SDK access. Choose one method:

### Method 1: Service Account Key (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/project/erp-for-tsa/settings/serviceaccounts)
2. Click "Generate New Private Key"
3. Save as `firebase-service-account-key.json` in project root

### Method 2: Firebase CLI Authentication  
```bash
firebase login
firebase use erp-for-tsa
```

### Method 3: Application Default Credentials
Set environment variable:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"
```

## Step-by-Step Troubleshooting

### Step 1: Verify User Exists
```bash
node debug-durga-user.cjs
```

### Step 2: If User Not Found
```bash
node create-operator-durga.cjs
```

### Step 3: If User Exists But Can't Login
```bash
# Check all user details
node firebase-user-inspector.cjs --search durga

# Test with suspected password
node firebase-user-inspector.cjs --test durga [password]
```

### Step 4: Fix Common Issues
```bash
# Fix missing passwords for all operators
node fix-all-operators.cjs

# Full system inspection
node firebase-user-inspector.cjs
```

## Login Credentials from Setup Scripts

From the existing setup scripts, these are the default test users:

**From firebase-admin-setup.cjs:**
- Username: `sup` | Password: `sup` (Supervisor)
- Username: `operator` | Password: `password` (Operator)  
- Username: `manager` | Password: `password` (Manager)

**From setup-firebase-users.ts:**
- Username: `sup` | Password: `sup` (Supervisor)
- Username: `admin` | Password: `admin` (Admin)

**From create-supervisor.js:**
- Username: `supervisor` | Password: `password` (Supervisor)

## Next Steps After Debugging

1. **If user exists and should work:** 
   - Verify you're accessing the correct Firebase project
   - Check network connectivity
   - Review browser console for JavaScript errors

2. **If user doesn't exist:**
   - Create using the provided script
   - Verify the user was created in the intended project

3. **If authentication logic issues:**
   - Check the frontend login form is sending correct data
   - Verify the AuthService.login() method is being called properly
   - Check for any middleware interfering with authentication

## Security Note

⚠️ **Important:** The current system uses Base64 encoding for passwords, which is NOT secure for production. Consider implementing proper password hashing (bcrypt, scrypt, etc.) for production use.

## Files Created by This Debug Session

- `/debug-durga-user.cjs` - Durga-specific user debugging
- `/create-operator-durga.cjs` - Create durga operator user
- `/firebase-user-inspector.cjs` - Comprehensive user inspection tool
- `/USER-DEBUG-GUIDE.md` - This documentation

All scripts are executable and ready to use!