#!/usr/bin/env tsx

// Simple environment validation for production builds
console.log('🔍 Validating environment variables...')

const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
]

const missingVars = requiredVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.warn('⚠️  Missing environment variables:', missingVars.join(', '))
  console.warn('⚠️  Some features may not work properly')
} else {
  console.log('✅ All required environment variables are present')
}

// Don't fail the build, just warn
process.exit(0)