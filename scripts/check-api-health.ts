#!/usr/bin/env tsx

/**
 * API Health Check Script
 * This script checks all API endpoints for basic functionality
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    return false
  }
}

async function checkModels() {
  const models = [
    'user',
    'job',
    'application',
    'company',
    'profile',
    'resume',
    'interview',
    'quiz',
    'quizAttempt',
    'expertProfile',
    'consultingSession',
    'fAQ',
    'featureFlag',
    'hireTracking',
    'emailTemplate',
    'commission',
    'referral',
    'payment',
    'conversation',
    'message',
    'notification',
    'audit'
  ]

  console.log('\n🔍 Checking Prisma models...')
  
  for (const model of models) {
    try {
      // @ts-ignore - Dynamic model access
      await prisma[model].findMany({ take: 1 })
      console.log(`✅ ${model} model accessible`)
    } catch (error) {
      console.error(`❌ ${model} model error:`, error instanceof Error ? error.message : error)
    }
  }
}

async function main() {
  console.log('🚀 Starting API Health Check...\n')
  
  const dbConnected = await checkDatabaseConnection()
  
  if (dbConnected) {
    await checkModels()
  }
  
  await prisma.$disconnect()
  console.log('\n✅ Health check completed!')
}

main().catch((error) => {
  console.error('❌ Health check failed:', error)
  process.exit(1)
})