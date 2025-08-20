#!/bin/bash

# Job Portal Deployment Script
# This script handles the deployment process for the job portal application

set -e  # Exit on any error

echo "🚀 Starting Job Portal Deployment..."

# Check if required environment variables are set
check_env_vars() {
    echo "📋 Checking environment variables..."
    
    required_vars=(
        "DATABASE_URL"
        "NEXTAUTH_SECRET"
        "NEXTAUTH_URL"
        "RESEND_API_KEY"
        "AWS_ACCESS_KEY_ID"
        "AWS_SECRET_ACCESS_KEY"
        "AWS_S3_BUCKET_NAME"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            echo "❌ Error: $var is not set"
            exit 1
        fi
    done
    
    echo "✅ All required environment variables are set"
}

# Install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    npm ci --only=production
    echo "✅ Dependencies installed"
}

# Generate Prisma client
generate_prisma() {
    echo "🔧 Generating Prisma client..."
    npx prisma generate
    echo "✅ Prisma client generated"
}

# Run database migrations
run_migrations() {
    echo "🗄️ Running database migrations..."
    npx prisma migrate deploy
    echo "✅ Database migrations completed"
}

# Seed database (optional, only for fresh deployments)
seed_database() {
    if [ "$SEED_DATABASE" = "true" ]; then
        echo "🌱 Seeding database..."
        npm run db:seed
        echo "✅ Database seeded"
    else
        echo "⏭️ Skipping database seeding"
    fi
}

# Build the application
build_application() {
    echo "🏗️ Building application..."
    npm run build
    echo "✅ Application built successfully"
}

# Run tests
run_tests() {
    if [ "$SKIP_TESTS" != "true" ]; then
        echo "🧪 Running tests..."
        npm test
        echo "✅ All tests passed"
    else
        echo "⏭️ Skipping tests"
    fi
}

# Health check
health_check() {
    echo "🏥 Performing health check..."
    
    # Check if the application starts successfully
    timeout 30s npm start &
    APP_PID=$!
    
    sleep 10
    
    if kill -0 $APP_PID 2>/dev/null; then
        echo "✅ Application is running"
        kill $APP_PID
    else
        echo "❌ Application failed to start"
        exit 1
    fi
}

# Cleanup
cleanup() {
    echo "🧹 Cleaning up..."
    # Remove any temporary files or processes
    echo "✅ Cleanup completed"
}

# Main deployment process
main() {
    echo "🎯 Job Portal Deployment Started at $(date)"
    
    check_env_vars
    install_dependencies
    generate_prisma
    run_migrations
    seed_database
    run_tests
    build_application
    health_check
    cleanup
    
    echo "🎉 Deployment completed successfully at $(date)"
    echo "🌐 Application is ready to serve traffic"
}

# Handle script interruption
trap cleanup EXIT

# Run main function
main "$@"