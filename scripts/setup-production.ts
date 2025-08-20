#!/usr/bin/env tsx

/**
 * Production Setup Script
 * This script helps set up the production environment step by step
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { createInterface } from 'readline'

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

interface ServiceConfig {
  name: string
  description: string
  required: boolean
  envVars: string[]
  setupInstructions: string[]
}

const services: ServiceConfig[] = [
  {
    name: 'Database (PostgreSQL)',
    description: 'Primary database for storing application data',
    required: true,
    envVars: ['DATABASE_URL'],
    setupInstructions: [
      '1. Sign up for a PostgreSQL service:',
      '   - Railway: https://railway.app',
      '   - Supabase: https://supabase.com',
      '   - Neon: https://neon.tech',
      '   - PlanetScale: https://planetscale.com',
      '2. Create a new database',
      '3. Copy the connection string',
      '4. Format: postgresql://user:pass@host:5432/dbname',
    ],
  },
  {
    name: 'Authentication (Google OAuth)',
    description: 'Google OAuth for user authentication',
    required: true,
    envVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    setupInstructions: [
      '1. Go to Google Cloud Console: https://console.cloud.google.com',
      '2. Create a new project or select existing',
      '3. Enable Google+ API',
      '4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs',
      '5. Set authorized redirect URIs:',
      '   - http://localhost:3000/api/auth/callback/google (dev)',
      '   - https://your-domain.com/api/auth/callback/google (prod)',
      '6. Copy Client ID and Client Secret',
    ],
  },
  {
    name: 'Email Service (Resend)',
    description: 'Transactional email service',
    required: true,
    envVars: ['RESEND_API_KEY', 'FROM_EMAIL'],
    setupInstructions: [
      '1. Sign up at https://resend.com',
      '2. Verify your domain or use resend.dev for testing',
      '3. Create an API key',
      '4. Set FROM_EMAIL to your verified domain email',
    ],
  },
  {
    name: 'File Storage (AWS S3)',
    description: 'File storage for resumes and uploads',
    required: true,
    envVars: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_S3_BUCKET_NAME'],
    setupInstructions: [
      '1. Sign up for AWS: https://aws.amazon.com',
      '2. Create an S3 bucket',
      '3. Create IAM user with S3 permissions',
      '4. Generate access keys',
      '5. Alternative: Use Cloudflare R2 for cheaper storage',
    ],
  },
  {
    name: 'Real-time Features (Pusher)',
    description: 'WebSocket service for real-time messaging',
    required: false,
    envVars: ['PUSHER_APP_ID', 'PUSHER_KEY', 'PUSHER_SECRET', 'PUSHER_CLUSTER'],
    setupInstructions: [
      '1. Sign up at https://pusher.com',
      '2. Create a new app',
      '3. Copy app credentials',
      '4. Set cluster (e.g., ap2 for Asia Pacific)',
    ],
  },
  {
    name: 'Payment Gateway (Razorpay)',
    description: 'Payment processing for Indian market',
    required: false,
    envVars: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
    setupInstructions: [
      '1. Sign up at https://razorpay.com',
      '2. Complete KYC verification',
      '3. Generate API keys',
      '4. Test in sandbox mode first',
    ],
  },
  {
    name: 'Payment Gateway (Stripe)',
    description: 'Payment processing for global market',
    required: false,
    envVars: ['STRIPE_PUBLISHABLE_KEY', 'STRIPE_SECRET_KEY'],
    setupInstructions: [
      '1. Sign up at https://stripe.com',
      '2. Complete account verification',
      '3. Get API keys from dashboard',
      '4. Test with test keys first',
    ],
  },
]

async function generateSecureSecret(): Promise<string> {
  const crypto = await import('crypto')
  return crypto.randomBytes(32).toString('hex')
}

async function setupService(service: ServiceConfig): Promise<Record<string, string>> {
  console.log(`\n🔧 Setting up: ${service.name}`)
  console.log(`Description: ${service.description}`)
  console.log(`Required: ${service.required ? 'Yes' : 'No'}`)

  if (!service.required) {
    const setup = await question(`Do you want to set up ${service.name}? (y/n): `)
    if (setup.toLowerCase() !== 'y') {
      console.log(`⏭️ Skipping ${service.name}`)
      return {}
    }
  }

  console.log('\n📋 Setup Instructions:')
  service.setupInstructions.forEach((instruction) => {
    console.log(`   ${instruction}`)
  })

  const envValues: Record<string, string> = {}

  for (const envVar of service.envVars) {
    let value = ''
    
    if (envVar === 'NEXTAUTH_SECRET') {
      const generate = await question(`Generate secure secret for ${envVar}? (y/n): `)
      if (generate.toLowerCase() === 'y') {
        value = await generateSecureSecret()
        console.log(`Generated: ${value}`)
      } else {
        value = await question(`Enter ${envVar}: `)
      }
    } else {
      value = await question(`Enter ${envVar}: `)
    }

    if (value.trim()) {
      envValues[envVar] = value.trim()
    }
  }

  return envValues
}

async function createEnvFile(envValues: Record<string, string>): Promise<void> {
  const envContent = Object.entries(envValues)
    .map(([key, value]) => `${key}="${value}"`)
    .join('\n')

  const fullEnvContent = `# =============================================================================
# JOB PORTAL - PRODUCTION ENVIRONMENT CONFIGURATION
# Generated on ${new Date().toISOString()}
# =============================================================================

${envContent}

# =============================================================================
# ADDITIONAL CONFIGURATION
# =============================================================================
NODE_ENV="production"
ENABLE_PAYMENTS="true"
ENABLE_COMMISSIONS="true"
ENABLE_EXPERT_CONSULTING="true"
ENABLE_INTERVIEW_SCHEDULING="true"
ENABLE_QUIZ_SYSTEM="true"
RATE_LIMIT_REQUESTS_PER_MINUTE="60"
SKIP_EMAIL_VERIFICATION="false"
DEBUG="false"
`

  writeFileSync('.env.production', fullEnvContent)
  console.log('\n✅ Created .env.production file')
}

async function runDatabaseSetup(): Promise<void> {
  console.log('\n🗄️ Setting up database...')
  
  try {
    console.log('Generating Prisma client...')
    execSync('npx prisma generate', { stdio: 'inherit' })
    
    console.log('Running database migrations...')
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    
    const seedDb = await question('Seed database with sample data? (y/n): ')
    if (seedDb.toLowerCase() === 'y') {
      console.log('Seeding database...')
      execSync('npm run db:seed', { stdio: 'inherit' })
    }
    
    console.log('✅ Database setup completed')
  } catch (error) {
    console.error('❌ Database setup failed:', error)
  }
}

async function runTests(): Promise<void> {
  console.log('\n🧪 Running tests...')
  
  try {
    execSync('npm run test:ci', { stdio: 'inherit' })
    console.log('✅ All tests passed')
  } catch (error) {
    console.error('❌ Tests failed:', error)
  }
}

async function buildApplication(): Promise<void> {
  console.log('\n🏗️ Building application...')
  
  try {
    execSync('npm run build', { stdio: 'inherit' })
    console.log('✅ Application built successfully')
  } catch (error) {
    console.error('❌ Build failed:', error)
  }
}

async function main(): Promise<void> {
  console.log('🚀 Job Portal - Production Setup Wizard')
  console.log('=====================================\n')

  console.log('This wizard will help you set up your Job Portal for production deployment.')
  console.log('You\'ll need to configure various services and generate environment variables.\n')

  const proceed = await question('Do you want to continue? (y/n): ')
  if (proceed.toLowerCase() !== 'y') {
    console.log('Setup cancelled.')
    rl.close()
    return
  }

  // Collect all environment variables
  const allEnvValues: Record<string, string> = {}

  // Set up basic configuration
  console.log('\n📝 Basic Configuration')
  const appUrl = await question('Enter your application URL (e.g., https://your-domain.com): ')
  if (appUrl) {
    allEnvValues['NEXTAUTH_URL'] = appUrl
  }

  const nextAuthSecret = await generateSecureSecret()
  allEnvValues['NEXTAUTH_SECRET'] = nextAuthSecret
  console.log(`Generated NEXTAUTH_SECRET: ${nextAuthSecret}`)

  // Set up each service
  for (const service of services) {
    const serviceEnvValues = await setupService(service)
    Object.assign(allEnvValues, serviceEnvValues)
  }

  // Create environment file
  await createEnvFile(allEnvValues)

  // Database setup
  const setupDb = await question('\nSet up database now? (y/n): ')
  if (setupDb.toLowerCase() === 'y') {
    await runDatabaseSetup()
  }

  // Run tests
  const runTestsNow = await question('\nRun tests? (y/n): ')
  if (runTestsNow.toLowerCase() === 'y') {
    await runTests()
  }

  // Build application
  const buildNow = await question('\nBuild application? (y/n): ')
  if (buildNow.toLowerCase() === 'y') {
    await buildApplication()
  }

  console.log('\n🎉 Production setup completed!')
  console.log('\n📋 Next Steps:')
  console.log('1. Review the generated .env.production file')
  console.log('2. Deploy to your chosen platform (Vercel, Railway, etc.)')
  console.log('3. Set environment variables in your deployment platform')
  console.log('4. Test all features in production')
  console.log('5. Set up monitoring and backups')

  console.log('\n🔧 Deployment Commands:')
  console.log('- Vercel: npm run deploy:vercel')
  console.log('- Railway: npm run deploy:railway')
  console.log('- Manual: npm run build && npm start')

  console.log('\n📚 Documentation:')
  console.log('- Production Setup: ./PRODUCTION_SETUP.md')
  console.log('- Environment Validation: npx tsx scripts/validate-env.ts')

  rl.close()
}

main().catch((error) => {
  console.error('❌ Setup failed:', error)
  rl.close()
  process.exit(1)
})