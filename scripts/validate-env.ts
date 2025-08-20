#!/usr/bin/env tsx

/**
 * Environment Variables Validation Script
 * This script validates that all required environment variables are set for production
 */

interface EnvConfig {
  name: string
  required: boolean
  description: string
  example?: string
  validation?: (value: string) => boolean
}

const envConfigs: EnvConfig[] = [
  // Database
  {
    name: 'DATABASE_URL',
    required: true,
    description: 'PostgreSQL database connection string',
    example: 'postgresql://user:pass@host:5432/dbname',
    validation: (value) => value.startsWith('postgresql://') || value.startsWith('postgres://'),
  },

  // Authentication
  {
    name: 'NEXTAUTH_URL',
    required: true,
    description: 'Application URL for NextAuth',
    example: 'https://your-domain.com',
    validation: (value) => value.startsWith('http://') || value.startsWith('https://'),
  },
  {
    name: 'NEXTAUTH_SECRET',
    required: true,
    description: 'Secret key for NextAuth (32+ characters)',
    validation: (value) => value.length >= 32,
  },
  {
    name: 'GOOGLE_CLIENT_ID',
    required: true,
    description: 'Google OAuth client ID',
  },
  {
    name: 'GOOGLE_CLIENT_SECRET',
    required: true,
    description: 'Google OAuth client secret',
  },

  // Email
  {
    name: 'RESEND_API_KEY',
    required: true,
    description: 'Resend API key for sending emails',
    validation: (value) => value.startsWith('re_'),
  },
  {
    name: 'FROM_EMAIL',
    required: true,
    description: 'From email address',
    validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },

  // File Storage
  {
    name: 'AWS_ACCESS_KEY_ID',
    required: true,
    description: 'AWS access key ID for S3',
  },
  {
    name: 'AWS_SECRET_ACCESS_KEY',
    required: true,
    description: 'AWS secret access key for S3',
  },
  {
    name: 'AWS_REGION',
    required: true,
    description: 'AWS region',
    example: 'us-east-1',
  },
  {
    name: 'AWS_S3_BUCKET_NAME',
    required: true,
    description: 'S3 bucket name for file storage',
  },

  // Real-time Features
  {
    name: 'PUSHER_APP_ID',
    required: false,
    description: 'Pusher app ID for real-time features',
  },
  {
    name: 'PUSHER_KEY',
    required: false,
    description: 'Pusher key',
  },
  {
    name: 'PUSHER_SECRET',
    required: false,
    description: 'Pusher secret',
  },
  {
    name: 'PUSHER_CLUSTER',
    required: false,
    description: 'Pusher cluster',
    example: 'ap2',
  },

  // Payments
  {
    name: 'RAZORPAY_KEY_ID',
    required: false,
    description: 'Razorpay key ID for payments',
  },
  {
    name: 'RAZORPAY_KEY_SECRET',
    required: false,
    description: 'Razorpay secret key',
  },
  {
    name: 'STRIPE_SECRET_KEY',
    required: false,
    description: 'Stripe secret key for payments',
  },

  // Security
  {
    name: 'ATS_WEBHOOK_SECRET',
    required: false,
    description: 'Secret for ATS webhook verification',
  },

  // Environment
  {
    name: 'NODE_ENV',
    required: true,
    description: 'Node environment',
    validation: (value) => ['development', 'production', 'test'].includes(value),
  },
]

function validateEnvironment(isProduction = false): boolean {
  console.log('🔍 Validating environment variables...\n')

  let hasErrors = false
  let hasWarnings = false

  for (const config of envConfigs) {
    const value = process.env[config.name]
    const isEmpty = !value || value.trim() === ''

    // Check if required variable is missing
    if (config.required && isEmpty) {
      console.log(`❌ ${config.name}: MISSING (Required)`)
      console.log(`   Description: ${config.description}`)
      if (config.example) {
        console.log(`   Example: ${config.example}`)
      }
      console.log('')
      hasErrors = true
      continue
    }

    // Skip validation for optional empty variables
    if (isEmpty) {
      if (isProduction) {
        console.log(`⚠️  ${config.name}: NOT SET (Optional)`)
        console.log(`   Description: ${config.description}`)
        console.log('')
        hasWarnings = true
      }
      continue
    }

    // Validate the value if validation function exists
    if (config.validation && !config.validation(value)) {
      console.log(`❌ ${config.name}: INVALID FORMAT`)
      console.log(`   Description: ${config.description}`)
      console.log(`   Current: ${value.substring(0, 20)}...`)
      if (config.example) {
        console.log(`   Example: ${config.example}`)
      }
      console.log('')
      hasErrors = true
      continue
    }

    // Variable is valid
    console.log(`✅ ${config.name}: OK`)
  }

  console.log('\n' + '='.repeat(50))

  if (hasErrors) {
    console.log('❌ Environment validation FAILED')
    console.log('Please fix the errors above before proceeding.')
    return false
  }

  if (hasWarnings && isProduction) {
    console.log('⚠️  Environment validation completed with WARNINGS')
    console.log('Some optional features may not work properly.')
  } else {
    console.log('✅ Environment validation PASSED')
    console.log('All required environment variables are properly configured.')
  }

  return true
}

function generateEnvTemplate(): void {
  console.log('\n📝 Environment Template:\n')
  console.log('# Copy this template to your .env file and fill in the values\n')

  for (const config of envConfigs) {
    console.log(`# ${config.description}`)
    if (config.required) {
      console.log(`${config.name}="${config.example || 'your-value-here'}"`)
    } else {
      console.log(`# ${config.name}="${config.example || 'your-value-here'}"`)
    }
    console.log('')
  }
}

function main(): void {
  const args = process.argv.slice(2)
  const isProduction = process.env.NODE_ENV === 'production' || args.includes('--production')
  const generateTemplate = args.includes('--template')

  console.log('🚀 Job Portal - Environment Validation\n')

  if (generateTemplate) {
    generateEnvTemplate()
    return
  }

  const isValid = validateEnvironment(isProduction)

  if (!isValid) {
    console.log('\n💡 To generate an environment template, run:')
    console.log('npx tsx scripts/validate-env.ts --template')
    process.exit(1)
  }

  console.log('\n🎉 Ready for deployment!')
}

main()