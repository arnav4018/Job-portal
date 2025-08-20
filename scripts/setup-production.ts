#!/usr/bin/env tsx

import { execSync } from 'child_process'

console.log('🚀 Setting up production database...')

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set')
  console.log('Please set up your database and add DATABASE_URL to Vercel environment variables')
  process.exit(1)
}

try {
  console.log('📦 Generating Prisma client...')
  execSync('npx prisma generate', { stdio: 'inherit' })

  console.log('🗄️ Running database migrations...')
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })

  console.log('🎭 Seeding demo database...')
  execSync('npm run demo-seed', { stdio: 'inherit' })

  console.log('✅ Production setup complete!')
  console.log('🎬 Your demo database is now ready!')
  console.log('📊 Visit /demo to see the presentation dashboard')
  
} catch (error) {
  console.error('❌ Setup failed:', error)
  process.exit(1)
}