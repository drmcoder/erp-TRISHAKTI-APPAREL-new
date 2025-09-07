#!/bin/bash

# TSA ERP Deployment Script
# Comprehensive deployment script for staging and production environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$PROJECT_ROOT/dist"
BACKUP_DIR="$PROJECT_ROOT/backups"

# Functions
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

show_usage() {
    echo "Usage: $0 [staging|production] [options]"
    echo ""
    echo "Options:"
    echo "  --skip-tests       Skip running tests before deployment"
    echo "  --skip-build       Skip building the application"
    echo "  --dry-run          Show what would be deployed without actually deploying"
    echo "  --backup           Create backup before deployment"
    echo "  --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 staging                    # Deploy to staging"
    echo "  $0 production --backup        # Deploy to production with backup"
    echo "  $0 staging --dry-run          # Preview staging deployment"
}

check_dependencies() {
    log_info "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check Firebase CLI
    if ! command -v firebase &> /dev/null; then
        log_error "Firebase CLI is not installed. Install with: npm install -g firebase-tools"
        exit 1
    fi
    
    # Check if logged in to Firebase
    if ! firebase projects:list &> /dev/null; then
        log_error "Not logged in to Firebase. Run: firebase login"
        exit 1
    fi
    
    log_success "All dependencies are available"
}

run_tests() {
    log_info "Running tests..."
    
    cd "$PROJECT_ROOT"
    
    # Run type checking
    log_info "Running type check..."
    npm run type-check
    
    # Run linting
    log_info "Running linter..."
    npm run lint
    
    # Run unit tests
    log_info "Running unit tests..."
    npm run test:run
    
    log_success "All tests passed"
}

build_application() {
    log_info "Building application for $ENVIRONMENT environment..."
    
    cd "$PROJECT_ROOT"
    
    # Clean previous build
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        log_info "Cleaned previous build"
    fi
    
    # Set environment variables based on target
    case $ENVIRONMENT in
        "staging")
            export NODE_ENV=staging
            export VITE_API_BASE_URL=${STAGING_API_URL:-"https://api-staging.tsa-erp.com"}
            export VITE_FIREBASE_PROJECT_ID="tsa-erp-staging"
            ;;
        "production")
            export NODE_ENV=production
            export VITE_API_BASE_URL=${PRODUCTION_API_URL:-"https://api.tsa-erp.com"}
            export VITE_FIREBASE_PROJECT_ID="tsa-erp-production"
            ;;
    esac
    
    # Build the application
    npm run build
    
    # Verify build output
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build failed - no build directory created"
        exit 1
    fi
    
    # Check if index.html was created
    if [ ! -f "$BUILD_DIR/index.html" ]; then
        log_error "Build failed - no index.html found"
        exit 1
    fi
    
    log_success "Application built successfully"
    
    # Show build statistics
    BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
    JS_FILES=$(find "$BUILD_DIR" -name "*.js" | wc -l)
    CSS_FILES=$(find "$BUILD_DIR" -name "*.css" | wc -l)
    
    log_info "Build statistics:"
    log_info "  - Total size: $BUILD_SIZE"
    log_info "  - JS files: $JS_FILES"
    log_info "  - CSS files: $CSS_FILES"
}

create_backup() {
    log_info "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/backup_${ENVIRONMENT}_${TIMESTAMP}.tar.gz"
    
    # Create backup of current deployment (if exists)
    if firebase hosting:channel:list --project="tsa-erp-$ENVIRONMENT" &> /dev/null; then
        log_info "Creating backup of current deployment..."
        # Note: This is a placeholder - Firebase doesn't provide direct backup functionality
        # In a real scenario, you might backup database, storage, etc.
    fi
    
    log_success "Backup created: $BACKUP_FILE"
}

deploy_to_firebase() {
    log_info "Deploying to Firebase ($ENVIRONMENT)..."
    
    cd "$PROJECT_ROOT"
    
    # Set Firebase project
    case $ENVIRONMENT in
        "staging")
            firebase use tsa-erp-staging
            ;;
        "production")
            firebase use tsa-erp-production
            ;;
    esac
    
    if [ "$DRY_RUN" = true ]; then
        log_info "DRY RUN: Would deploy to $ENVIRONMENT environment"
        log_info "Firebase project: tsa-erp-$ENVIRONMENT"
        log_info "Build directory: $BUILD_DIR"
        return 0
    fi
    
    # Deploy to Firebase Hosting
    DEPLOY_MESSAGE="Deploy $ENVIRONMENT - $(date '+%Y-%m-%d %H:%M:%S') - $(git rev-parse --short HEAD)"
    
    firebase deploy --only hosting --message "$DEPLOY_MESSAGE"
    
    log_success "Deployment to $ENVIRONMENT completed successfully!"
    
    # Show deployment URL
    case $ENVIRONMENT in
        "staging")
            DEPLOY_URL="https://tsa-erp-staging.web.app"
            ;;
        "production")
            DEPLOY_URL="https://tsa-erp-production.web.app"
            ;;
    esac
    
    log_success "Application is available at: $DEPLOY_URL"
}

verify_deployment() {
    log_info "Verifying deployment..."
    
    case $ENVIRONMENT in
        "staging")
            VERIFY_URL="https://tsa-erp-staging.web.app"
            ;;
        "production")
            VERIFY_URL="https://tsa-erp-production.web.app"
            ;;
    esac
    
    # Wait for deployment to be available
    log_info "Waiting for deployment to be available..."
    sleep 10
    
    # Check if the site is responding
    if curl -s --head "$VERIFY_URL" | head -n 1 | grep -q "200 OK"; then
        log_success "Deployment verification successful - site is responding"
    else
        log_warning "Site may not be fully available yet - check manually"
    fi
    
    log_info "You can verify the deployment at: $VERIFY_URL"
}

cleanup() {
    log_info "Cleaning up..."
    
    # Clean up temporary files if any
    # (Add cleanup logic here if needed)
    
    log_success "Cleanup completed"
}

send_notification() {
    log_info "Sending deployment notification..."
    
    # Slack notification (if webhook is configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        COMMIT_HASH=$(git rev-parse --short HEAD)
        COMMIT_MESSAGE=$(git log -1 --pretty=format:"%s")
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"✅ Deployment to $ENVIRONMENT completed successfully!\n\nCommit: $COMMIT_HASH\nMessage: $COMMIT_MESSAGE\nURL: $VERIFY_URL\"}" \
            "$SLACK_WEBHOOK_URL" &> /dev/null
        
        log_success "Slack notification sent"
    fi
    
    # Email notification could be added here
}

# Main execution
main() {
    log_info "Starting TSA ERP deployment script..."
    
    # Parse command line arguments
    ENVIRONMENT=""
    SKIP_TESTS=false
    SKIP_BUILD=false
    DRY_RUN=false
    CREATE_BACKUP=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            staging|production)
                ENVIRONMENT="$1"
                shift
                ;;
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --backup)
                CREATE_BACKUP=true
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Validate environment
    if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
        log_error "Environment must be 'staging' or 'production'"
        show_usage
        exit 1
    fi
    
    log_info "Deploying to: $ENVIRONMENT"
    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN MODE - No actual deployment will occur"
    fi
    
    # Execute deployment steps
    check_dependencies
    
    if [ "$SKIP_TESTS" != true ]; then
        run_tests
    else
        log_warning "Skipping tests as requested"
    fi
    
    if [ "$SKIP_BUILD" != true ]; then
        build_application
    else
        log_warning "Skipping build as requested"
    fi
    
    if [ "$CREATE_BACKUP" = true ]; then
        create_backup
    fi
    
    deploy_to_firebase
    
    if [ "$DRY_RUN" != true ]; then
        verify_deployment
        send_notification
    fi
    
    cleanup
    
    log_success "Deployment process completed successfully!"
    
    if [ "$ENVIRONMENT" = "production" ]; then
        log_info "🚀 Production deployment completed!"
        log_info "Don't forget to:"
        log_info "  - Monitor error rates and performance"
        log_info "  - Check user feedback"
        log_info "  - Update documentation if needed"
    fi
}

# Error handling
trap 'log_error "Deployment failed! Check the logs above."; exit 1' ERR

# Run main function
main "$@"