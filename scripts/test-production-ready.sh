#!/bin/bash

# Test Production Readiness Script for TSA ERP
# Comprehensive testing before production deployment

set -e  # Exit on any error

echo "🧪 Testing TSA ERP Production Readiness..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_WARNED=0

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((TESTS_PASSED++))
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((TESTS_WARNED++))
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((TESTS_FAILED++))
}

# Test 1: Environment Variables
print_status "Testing environment variables..."
if [ -f ".env.production" ]; then
    print_success "Production environment file exists"
else
    print_error "Production environment file (.env.production) not found"
fi

if [ -f ".env.development" ]; then
    print_success "Development environment file exists"
else
    print_error "Development environment file (.env.development) not found"
fi

# Test 2: Firebase Configuration
print_status "Testing Firebase configuration..."
if grep -q "VITE_FIREBASE_API_KEY" .env.development; then
    print_success "Firebase API key configured in development"
else
    print_error "Firebase API key not found in development config"
fi

if grep -q "VITE_FIREBASE_PROJECT_ID" .env.development; then
    print_success "Firebase Project ID configured"
else
    print_error "Firebase Project ID not found"
fi

# Test 3: Dependencies
print_status "Testing dependencies..."
if [ -d "node_modules" ]; then
    print_success "Node modules installed"
else
    print_error "Node modules not found - run 'npm install'"
fi

# Check for critical dependencies
if npm list firebase > /dev/null 2>&1; then
    print_success "Firebase SDK installed"
else
    print_error "Firebase SDK not installed"
fi

if npm list react > /dev/null 2>&1; then
    print_success "React installed"
else
    print_error "React not installed"
fi

# Test 4: TypeScript Compilation
print_status "Testing TypeScript compilation..."
if npx tsc --noEmit --skipLibCheck > /dev/null 2>&1; then
    print_success "TypeScript compilation successful"
else
    print_warning "TypeScript compilation has warnings/errors"
fi

# Test 5: Build Process
print_status "Testing production build..."
print_status "Building application for production..."

# Set production environment
export NODE_ENV=production
export VITE_ENVIRONMENT=production

if npm run build > build.log 2>&1; then
    print_success "Production build successful"
    
    # Check build output
    if [ -d "dist" ]; then
        print_success "Build output directory created"
        
        # Check for essential files
        if [ -f "dist/index.html" ]; then
            print_success "Index.html generated"
        else
            print_error "Index.html not found in build output"
        fi
        
        if [ -d "dist/assets" ]; then
            print_success "Assets directory generated"
        else
            print_error "Assets directory not found"
        fi
        
        # Check build size
        BUILD_SIZE=$(du -sh dist | cut -f1)
        print_status "Build size: $BUILD_SIZE"
        
        # Warning if build is too large
        BUILD_SIZE_BYTES=$(du -s dist | cut -f1)
        if [ "$BUILD_SIZE_BYTES" -gt 51200 ]; then  # 50MB in KB
            print_warning "Build size is quite large: $BUILD_SIZE"
        else
            print_success "Build size is reasonable: $BUILD_SIZE"
        fi
        
    else
        print_error "Build output directory not created"
    fi
else
    print_error "Production build failed"
    echo "Build log:"
    cat build.log
fi

# Test 6: Firebase Rules
print_status "Testing Firebase security rules..."
if [ -f "firestore.rules" ]; then
    print_success "Firestore security rules file exists"
    
    # Check if rules have basic security
    if grep -q "authenticated" firestore.rules; then
        print_success "Security rules include authentication checks"
    else
        print_warning "Security rules may not include authentication checks"
    fi
else
    print_error "Firestore security rules file not found"
fi

# Test 7: Netlify Configuration
print_status "Testing Netlify configuration..."
if [ -f "netlify.toml" ]; then
    print_success "Netlify configuration file exists"
    
    # Check build settings
    if grep -q "npm run build" netlify.toml; then
        print_success "Build command configured in netlify.toml"
    else
        print_warning "Build command not found in netlify.toml"
    fi
    
    if grep -q "dist" netlify.toml; then
        print_success "Publish directory configured"
    else
        print_warning "Publish directory not configured in netlify.toml"
    fi
else
    print_error "Netlify configuration file not found"
fi

# Test 8: Security Checks
print_status "Testing security configuration..."

# Check for hardcoded secrets (basic check)
if grep -r "AIzaSy" src/ --exclude-dir=node_modules > /dev/null 2>&1; then
    print_warning "Possible hardcoded API keys found in source code"
else
    print_success "No hardcoded API keys detected in source"
fi

# Check for TODO/FIXME comments that might indicate incomplete security
if grep -r "TODO.*security\|FIXME.*security" src/ --exclude-dir=node_modules > /dev/null 2>&1; then
    print_warning "Security-related TODO/FIXME comments found"
else
    print_success "No pending security TODO items found"
fi

# Test 9: Essential Files
print_status "Testing essential files..."
ESSENTIAL_FILES=(
    "src/config/firebase.ts"
    "src/config/environment.ts"
    "src/services/session-manager.ts"
    "src/services/firebase-test.ts"
    "firestore.rules"
    "package.json"
    "vite.config.ts"
)

for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "Essential file exists: $file"
    else
        print_error "Essential file missing: $file"
    fi
done

# Test 10: Package.json Scripts
print_status "Testing package.json scripts..."
if jq -e '.scripts.build' package.json > /dev/null 2>&1; then
    print_success "Build script configured"
else
    print_error "Build script not found in package.json"
fi

if jq -e '.scripts.start' package.json > /dev/null 2>&1; then
    print_success "Start script configured"
else
    print_error "Start script not found in package.json"
fi

# Test 11: Preview Build (if possible)
print_status "Testing build preview..."
if [ -d "dist" ]; then
    print_status "Starting build preview server for 10 seconds..."
    
    # Start preview server in background
    npm run preview &
    PREVIEW_PID=$!
    
    sleep 10
    
    # Check if server is responding
    if curl -s http://localhost:4173 > /dev/null 2>&1; then
        print_success "Build preview server responding"
    else
        print_warning "Build preview server not responding (this may be normal)"
    fi
    
    # Kill preview server
    kill $PREVIEW_PID 2>/dev/null || true
    sleep 2
else
    print_warning "Build not available for preview testing"
fi

# Test Summary
echo ""
echo "📊 Test Summary"
echo "==============="
echo -e "✅ Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "⚠️  Tests Warned: ${YELLOW}$TESTS_WARNED${NC}"
echo -e "❌ Tests Failed: ${RED}$TESTS_FAILED${NC}"

# Overall result
if [ $TESTS_FAILED -eq 0 ]; then
    if [ $TESTS_WARNED -eq 0 ]; then
        echo -e "\n🎉 ${GREEN}ALL TESTS PASSED - READY FOR PRODUCTION!${NC}"
        echo "✅ Your application is ready for Netlify deployment"
        echo ""
        echo "Next steps:"
        echo "1. Push your code to your Git repository"
        echo "2. Connect your repository to Netlify"
        echo "3. Set environment variables in Netlify dashboard"
        echo "4. Deploy to production"
        exit 0
    else
        echo -e "\n⚠️  ${YELLOW}TESTS PASSED WITH WARNINGS${NC}"
        echo "🔧 Address warnings before production deployment for best results"
        echo ""
        echo "Your application will work in production, but addressing warnings is recommended"
        exit 1
    fi
else
    echo -e "\n❌ ${RED}TESTS FAILED - NOT READY FOR PRODUCTION${NC}"
    echo "🚨 Fix failed tests before attempting deployment"
    echo ""
    echo "Critical issues must be resolved before production deployment"
    exit 2
fi