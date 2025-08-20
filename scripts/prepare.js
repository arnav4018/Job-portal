#!/usr/bin/env node

// Skip husky installation in CI environments
if (process.env.CI || process.env.VERCEL || process.env.RAILWAY_ENVIRONMENT) {
  console.log('Skipping husky installation in CI environment');
  process.exit(0);
}

// Try to install husky
try {
  const { execSync } = require('child_process');
  execSync('husky install', { stdio: 'inherit' });
} catch (error) {
  console.log('Husky installation skipped (not available)');
}