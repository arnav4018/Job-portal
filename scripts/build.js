#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Starting production build...');

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('prisma generate', { stdio: 'inherit' });
  
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
  process.exit(1);
}