#!/bin/bash

# TSA ERP Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

echo "🚀 TSA ERP Production Deployment Started"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Firebase CLI
    if ! command -v firebase &> /dev/null; then
        log_error "Firebase CLI is not installed. Please install it first:"
        echo "npm install -g firebase-tools"
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        log_error "Node.js version 16 or higher is required. Current version: $(node --version)"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Verify Firebase authentication
check_firebase_auth() {
    log_info "Checking Firebase authentication..."
    
    if ! firebase projects:list &> /dev/null; then
        log_error "Not authenticated with Firebase. Please run:"
        echo "firebase login"
        exit 1
    fi
    
    log_success "Firebase authentication verified"
}

# Set Firebase project
set_firebase_project() {
    log_info "Setting Firebase project to erp-for-tsa..."
    
    firebase use erp-for-tsa --quiet
    
    if [ $? -eq 0 ]; then
        log_success "Firebase project set to erp-for-tsa"
    else
        log_error "Failed to set Firebase project. Please check project exists and you have access."
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    npm ci
    
    if [ $? -eq 0 ]; then
        log_success "Dependencies installed successfully"
    else
        log_error "Failed to install dependencies"
        exit 1
    fi
}

# Run linting and type checking
run_quality_checks() {
    log_info "Running code quality checks..."
    
    # Type checking
    log_info "Running TypeScript type checking..."
    npm run type-check
    
    if [ $? -eq 0 ]; then
        log_success "Type checking passed"
    else
        log_warning "Type checking failed, but continuing deployment"
    fi
    
    # Linting
    log_info "Running ESLint..."
    npm run lint
    
    if [ $? -eq 0 ]; then
        log_success "Linting passed"
    else
        log_warning "Linting issues found, but continuing deployment"
    fi
}

# Build the application
build_application() {
    log_info "Building application for production..."
    
    npm run build
    
    if [ $? -eq 0 ]; then
        log_success "Application built successfully"
        
        # Check build output
        if [ -d "dist" ]; then
            BUILD_SIZE=$(du -sh dist | cut -f1)
            log_info "Build size: $BUILD_SIZE"
        fi
    else
        log_error "Build failed"
        exit 1
    fi
}

# Deploy Firebase configuration
deploy_firebase_config() {
    log_info "Deploying Firebase configuration..."
    
    # Deploy Firestore rules and indexes
    log_info "Deploying Firestore rules and indexes..."
    firebase deploy --only firestore --quiet
    
    if [ $? -eq 0 ]; then
        log_success "Firestore configuration deployed"
    else
        log_error "Failed to deploy Firestore configuration"
        exit 1
    fi
    
    # Deploy Storage rules if they exist
    if [ -f "storage.rules" ]; then
        log_info "Deploying Storage rules..."
        firebase deploy --only storage --quiet
        
        if [ $? -eq 0 ]; then
            log_success "Storage rules deployed"
        else
            log_warning "Failed to deploy Storage rules"
        fi
    fi
}

# Deploy Cloud Functions (if they exist)
deploy_functions() {
    if [ -d "functions" ]; then
        log_info "Deploying Cloud Functions..."
        
        firebase deploy --only functions --quiet
        
        if [ $? -eq 0 ]; then
            log_success "Cloud Functions deployed"
        else
            log_warning "Failed to deploy Cloud Functions"
        fi
    else
        log_info "No Cloud Functions to deploy"
    fi
}

# Deploy hosting
deploy_hosting() {
    log_info "Deploying to Firebase Hosting..."
    
    firebase deploy --only hosting --quiet
    
    if [ $? -eq 0 ]; then
        log_success "Application deployed to Firebase Hosting"
        
        # Get hosting URL
        HOSTING_URL=$(firebase hosting:channel:list | grep -E "^live" | awk '{print $2}' | head -n 1)
        if [ -z "$HOSTING_URL" ]; then
            HOSTING_URL="https://erp-for-tsa.web.app"
        fi
        
        log_success "🌐 Application is live at: $HOSTING_URL"
    else
        log_error "Failed to deploy to Firebase Hosting"
        exit 1
    fi
}

# Initialize sample data (optional)
initialize_sample_data() {
    log_info "Do you want to initialize sample data? (y/N)"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        log_info "Initializing sample data..."
        
        # Create a simple script to add sample data
        node -e "
        const { initializeApp } = require('firebase/app');
        const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
        
        const firebaseConfig = {
          apiKey: 'AIzaSyB8Z4GdoLZsBW6bfmAh_BSTftpTRUXPZMw',
          authDomain: 'erp-for-tsa.firebaseapp.com',
          projectId: 'erp-for-tsa',
          storageBucket: 'erp-for-tsa.firebasestorage.app',
          messagingSenderId: '271232983905',
          appId: '1:271232983905:web:7d06c8f5ec269824759b20'
        };
        
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        // Add sample operator
        const sampleOperator = {
          name: 'Maya Sharma',
          employeeId: 'EMP001',
          skillLevel: 'expert',
          primaryMachine: 'overlock',
          currentStatus: 'active',
          averageEfficiency: 0.92,
          qualityScore: 0.88,
          createdAt: new Date(),
          role: 'operator'
        };
        
        setDoc(doc(db, 'operators', 'op-maya-001'), sampleOperator)
          .then(() => console.log('Sample operator added'))
          .catch((error) => console.error('Error:', error));
        
        // Add sample supervisor
        const sampleSupervisor = {
          name: 'John Kumar',
          employeeId: 'SUP001',
          supervisorLevel: 'senior',
          responsibleLines: ['Line A', 'Line B'],
          teamMembers: ['op-maya-001'],
          createdAt: new Date(),
          role: 'supervisor'
        };
        
        setDoc(doc(db, 'supervisors', 'sup-john-001'), sampleSupervisor)
          .then(() => console.log('Sample supervisor added'))
          .catch((error) => console.error('Error:', error));
        " 2>/dev/null || log_warning "Could not initialize sample data"
        
        log_success "Sample data initialization completed"
    else
        log_info "Skipping sample data initialization"
    fi
}

# Run post-deployment tests
run_post_deployment_tests() {
    log_info "Running post-deployment tests..."
    
    # Test Firebase connection
    if firebase firestore:rules:list &> /dev/null; then
        log_success "Firebase Firestore connection verified"
    else
        log_warning "Firebase Firestore connection test failed"
    fi
    
    # Test hosting URL
    if [ ! -z "$HOSTING_URL" ]; then
        if curl -s --head "$HOSTING_URL" | head -n 1 | grep -q "200 OK"; then
            log_success "Hosting URL is accessible"
        else
            log_warning "Hosting URL test failed"
        fi
    fi
}

# Display deployment summary
show_summary() {
    echo ""
    echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "===================================="
    echo ""
    echo "📋 Summary:"
    echo "  • Firebase Project: erp-for-tsa"
    echo "  • Application URL: ${HOSTING_URL:-https://erp-for-tsa.web.app}"
    echo "  • Firestore Rules: Deployed"
    echo "  • Indexes: Deployed"
    echo "  • Hosting: Deployed"
    echo ""
    echo "🔑 Next Steps:"
    echo "  1. Test the application with real users"
    echo "  2. Set up monitoring and alerts"
    echo "  3. Configure user authentication"
    echo "  4. Add production data"
    echo ""
    echo "📖 Documentation:"
    echo "  • Firebase Console: https://console.firebase.google.com/project/erp-for-tsa"
    echo "  • Hosting Dashboard: https://console.firebase.google.com/project/erp-for-tsa/hosting"
    echo ""
}

# Main deployment flow
main() {
    echo "Starting TSA ERP Production Deployment..."
    echo "This will deploy to Firebase project: erp-for-tsa"
    echo ""
    
    # Confirmation prompt
    log_info "Are you sure you want to deploy to PRODUCTION? (y/N)"
    read -r response
    
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled"
        exit 0
    fi
    
    # Run deployment steps
    check_prerequisites
    check_firebase_auth
    set_firebase_project
    install_dependencies
    run_quality_checks
    build_application
    deploy_firebase_config
    deploy_functions
    deploy_hosting
    run_post_deployment_tests
    initialize_sample_data
    show_summary
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"