#!/bin/bash

# Production Build Script for TSA ERP - Netlify Deployment
set -e  # Exit on any error

echo "🚀 Starting TSA ERP Production Build..."

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

# Check if node_modules exists
print_status "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm ci
else
    print_success "Dependencies found."
fi

# Clean previous build
print_status "Cleaning previous build..."
if [ -d "dist" ]; then
    rm -rf dist
    print_success "Previous build cleaned."
fi

# Check environment variables
print_status "Checking environment configuration..."
if [ -z "$VITE_FIREBASE_API_KEY" ]; then
    print_warning "VITE_FIREBASE_API_KEY not set. Using fallback from config."
fi

if [ -z "$VITE_FIREBASE_PROJECT_ID" ]; then
    print_warning "VITE_FIREBASE_PROJECT_ID not set. Using fallback from config."
fi

# Set production environment
export NODE_ENV=production
export VITE_ENVIRONMENT=production

print_status "Building application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not created"
    exit 1
fi

print_success "Build completed successfully!"

# Optional: Run build verification
print_status "Running build verification..."

# Check if main files exist
if [ ! -f "dist/index.html" ]; then
    print_error "index.html not found in build output"
    exit 1
fi

# Check build size
BUILD_SIZE=$(du -sh dist | cut -f1)
print_status "Build size: $BUILD_SIZE"

# Check for critical files
CRITICAL_FILES=("dist/index.html" "dist/assets")
for file in "${CRITICAL_FILES[@]}"; do
    if [ ! -e "$file" ]; then
        print_error "Critical file missing: $file"
        exit 1
    fi
done

print_success "Build verification passed!"

# Optional: Generate build report
print_status "Generating build report..."
echo "Build completed at: $(date)" > dist/build-report.txt
echo "Build size: $BUILD_SIZE" >> dist/build-report.txt
echo "Node version: $(node --version)" >> dist/build-report.txt
echo "NPM version: $(npm --version)" >> dist/build-report.txt

print_success "🎉 Production build ready for deployment!"
print_status "Deploy command: netlify deploy --prod --dir=dist"

echo ""
echo "📋 Next Steps:"
echo "1. Set environment variables in Netlify dashboard"
echo "2. Deploy using: netlify deploy --prod --dir=dist"
echo "3. Configure custom domain (if needed)"
echo "4. Set up continuous deployment from Git"