import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()
    
    console.log('Simple signup attempt:', { email, name })
    
    // Just create a basic user without password
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: 'CANDIDATE'
      }
    })
    
    console.log('User created:', user)
    
    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Simple signup error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}