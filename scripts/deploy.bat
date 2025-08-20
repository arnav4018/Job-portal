@echo off
REM Job Portal Deployment Script for Windows
REM This script handles the deployment process for the job portal application

echo 🚀 Starting Job Portal Deployment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed or not in PATH
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: npm is not installed or not in PATH
    exit /b 1
)

echo ✅ Node.js and npm are available

REM Install dependencies
echo 📦 Installing dependencies...
call npm ci
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to install dependencies
    exit /b 1
)
echo ✅ Dependencies installed

REM Generate Prisma client
echo 🔧 Generating Prisma client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Error: Failed to generate Prisma client
    exit /b 1
)
echo ✅ Prisma client generated

REM Run database migrations
echo 🗄️ Running database migrations...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo ❌ Error: Database migrations failed
    exit /b 1
)
echo ✅ Database migrations completed

REM Seed database (optional)
if "%SEED_DATABASE%"=="true" (
    echo 🌱 Seeding database...
    call npm run db:seed
    if %errorlevel% neq 0 (
        echo ❌ Error: Database seeding failed
        exit /b 1
    )
    echo ✅ Database seeded
) else (
    echo ⏭️ Skipping database seeding
)

REM Run tests (optional)
if not "%SKIP_TESTS%"=="true" (
    echo 🧪 Running tests...
    call npm test
    if %errorlevel% neq 0 (
        echo ❌ Error: Tests failed
        exit /b 1
    )
    echo ✅ All tests passed
) else (
    echo ⏭️ Skipping tests
)

REM Build the application
echo 🏗️ Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Error: Build failed
    exit /b 1
)
echo ✅ Application built successfully

echo 🎉 Deployment completed successfully
echo 🌐 Application is ready to serve traffic
echo.
echo To start the application, run: npm start
echo To start in development mode, run: npm run dev