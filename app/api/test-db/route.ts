import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('Database connection test result:', result)
    
    // Test user count
    const userCount = await prisma.user.count()
    console.log('Current user count:', userCount)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection working',
      userCount,
      result 
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        error: 'Database connection failed', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}