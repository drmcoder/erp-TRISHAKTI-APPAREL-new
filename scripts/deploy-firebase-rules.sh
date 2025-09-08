#!/bin/bash

# Deploy Firebase Rules Script
# Deploys development or production rules based on environment

set -e  # Exit on any error

echo "🔥 Firebase Rules Deployment Script"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get environment parameter
ENVIRONMENT=${1:-development}

print_status "Deploying Firebase rules for environment: $ENVIRONMENT"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI not found. Please install with: npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    print_warning "Not logged into Firebase CLI. Running login..."
    firebase login
fi

# Deploy based on environment
case $ENVIRONMENT in
    "development" | "dev")
        print_status "Preparing development rules deployment..."
        
        # Backup original rules
        if [ -f "firestore.rules" ]; then
            cp firestore.rules firestore.rules.backup
            print_status "Backed up original firestore.rules"
        fi
        
        # Copy development rules
        if [ -f "firestore.rules.dev" ]; then
            cp firestore.rules.dev firestore.rules
            print_status "Using development-friendly Firestore rules"
        else
            print_error "Development rules file (firestore.rules.dev) not found"
            exit 1
        fi
        
        # Deploy Firestore rules
        print_status "Deploying Firestore rules..."
        if firebase deploy --only firestore:rules; then
            print_success "Firestore rules deployed successfully"
        else
            print_error "Failed to deploy Firestore rules"
            # Restore backup
            if [ -f "firestore.rules.backup" ]; then
                cp firestore.rules.backup firestore.rules
            fi
            exit 1
        fi
        
        # Deploy Realtime Database rules
        if [ -f "database.rules.json" ]; then
            print_status "Deploying Realtime Database rules..."
            if firebase deploy --only database; then
                print_success "Realtime Database rules deployed successfully"
            else
                print_warning "Failed to deploy Realtime Database rules"
            fi
        fi
        
        # Restore original rules file
        if [ -f "firestore.rules.backup" ]; then
            cp firestore.rules.backup firestore.rules
            rm firestore.rules.backup
            print_status "Restored original firestore.rules file"
        fi
        
        print_success "Development rules deployment completed!"
        print_warning "Remember: Development rules are permissive for testing"
        ;;
        
    "production" | "prod")
        print_status "Preparing production rules deployment..."
        
        # Verify we have production rules
        if [ ! -f "firestore.rules" ]; then
            print_error "Production rules file (firestore.rules) not found"
            exit 1
        fi
        
        # Check if rules look production-ready
        if grep -q "isDevelopment()" firestore.rules; then
            print_error "Production rules contain development flags! Please use production-ready rules."
            exit 1
        fi
        
        # Deploy Firestore rules
        print_status "Deploying production Firestore rules..."
        if firebase deploy --only firestore:rules; then
            print_success "Production Firestore rules deployed successfully"
        else
            print_error "Failed to deploy production Firestore rules"
            exit 1
        fi
        
        # Deploy Realtime Database rules (if exists)
        if [ -f "database.rules.json" ]; then
            print_status "Deploying Realtime Database rules..."
            if firebase deploy --only database; then
                print_success "Realtime Database rules deployed successfully"
            else
                print_error "Failed to deploy Realtime Database rules"
                exit 1
            fi
        fi
        
        print_success "Production rules deployment completed!"
        print_success "🔒 Production security rules are now active"
        ;;
        
    *)
        print_error "Unknown environment: $ENVIRONMENT"
        echo "Usage: $0 [development|production]"
        exit 1
        ;;
esac

# Verify deployment
print_status "Verifying rules deployment..."
if firebase firestore:rules:list &> /dev/null; then
    print_success "Rules verification completed"
else
    print_warning "Could not verify rules deployment"
fi

echo ""
print_success "🎉 Firebase rules deployment completed for $ENVIRONMENT environment!"
echo ""
echo "Next steps:"
if [ "$ENVIRONMENT" == "development" ] || [ "$ENVIRONMENT" == "dev" ]; then
    echo "1. Test your application - Firebase should now allow development access"
    echo "2. Check browser console for any remaining permission errors"
    echo "3. Remember to deploy production rules before going live"
else
    echo "1. Monitor your application for any permission issues"
    echo "2. Check Firebase console for rule evaluation logs"
    echo "3. Test all user roles and permissions"
fi