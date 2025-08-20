#!/bin/bash

# Job Portal Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

echo "🚀 Job Portal - Production Deployment"
echo "======================================"

# Colors for output
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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Validate environment variables
print_status "Validating environment variables..."
if ! npx tsx scripts/validate-env.ts --production; then
    print_error "Environment validation failed. Please fix the issues above."
    exit 1
fi
print_success "Environment validation passed"

# Install dependencies
print_status "Installing production dependencies..."
npm ci --only=production
print_success "Dependencies installed"

# Type checking
print_status "Running type checks..."
npm run type-check
print_success "Type checking passed"

# Linting
print_status "Running linter..."
npm run lint
print_success "Linting passed"

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate
print_success "Prisma client generated"

# Run tests
if [ "$SKIP_TESTS" != "true" ]; then
    print_status "Running tests..."
    npm run test:ci
    print_success "All tests passed"
else
    print_warning "Skipping tests (SKIP_TESTS=true)"
fi

# Database migration
print_status "Running database migrations..."
npx prisma migrate deploy
print_success "Database migrations completed"

# Build the application
print_status "Building application..."
npm run build
print_success "Application built successfully"

# Health check
print_status "Running health check..."
if npm run health-check; then
    print_success "Health check passed"
else
    print_warning "Health check failed, but continuing deployment"
fi

# Deployment platform specific commands
if [ "$DEPLOY_PLATFORM" = "vercel" ]; then
    print_status "Deploying to Vercel..."
    npm run deploy:vercel
    print_success "Deployed to Vercel"
elif [ "$DEPLOY_PLATFORM" = "railway" ]; then
    print_status "Deploying to Railway..."
    npm run deploy:railway
    print_success "Deployed to Railway"
else
    print_status "Build completed. Ready for manual deployment."
fi

# Post-deployment tasks
print_status "Running post-deployment tasks..."

# Warm up the application
if [ -n "$NEXTAUTH_URL" ]; then
    print_status "Warming up application..."
    curl -f "$NEXTAUTH_URL/api/health" > /dev/null 2>&1 || print_warning "Could not warm up application"
fi

print_success "Deployment completed successfully!"
echo ""
echo "🎉 Your Job Portal is now live!"
echo "📱 Application URL: ${NEXTAUTH_URL:-'Not set'}"
echo "🔍 Health Check: ${NEXTAUTH_URL:-'Not set'}/api/health"
echo ""
echo "📊 Next Steps:"
echo "1. Test all major features"
echo "2. Monitor application logs"
echo "3. Set up monitoring alerts"
echo "4. Configure backup schedules"
echo ""
echo "🆘 If you encounter issues:"
echo "1. Check application logs"
echo "2. Verify environment variables"
echo "3. Test database connectivity"
echo "4. Review deployment platform status"