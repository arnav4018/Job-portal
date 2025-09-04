#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Starting production build...');

try {
  // Check if we're in production environment
  const isProduction = process.env.NODE_ENV === 'production';
  console.log(`🌟 Building in ${isProduction ? 'production' : 'development'} mode...`);
  
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('prisma generate', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db'
    }
  });
  
  // Run database migrations in production (Railway)
  if (isProduction && process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgresql')) {
    console.log('🚀 Running database migrations for production...');
    try {
      execSync('prisma migrate deploy', { 
        stdio: 'inherit',
        env: {
          ...process.env
        }
      });
    } catch (migrateError) {
      console.warn('⚠️ Migration failed, continuing with build:', migrateError.message);
    }
  }
  
  // Build Next.js application
  console.log('🏗️  Building Next.js application...');
  execSync('next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      SKIP_DATABASE_VALIDATION: 'true',
      SKIP_ENV_VALIDATION: 'true'
    }
  });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}
