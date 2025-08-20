import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

// GET /api/resumes - Get user's resumes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(resumes)
  } catch (error) {
    console.error('Resume fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    )
  }
}

// POST /api/resumes - Create new resume
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, template = 'modern' } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Check if this should be the default resume
    const existingResumes = await prisma.resume.count({
      where: { userId: session.user.id }
    })

    const isFirstResume = existingResumes === 0

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title,
        content: JSON.stringify(content),
        template,
        isDefault: isFirstResume, // First resume becomes default
      }
    })

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'resume',
      resourceId: resume.id,
      newData: JSON.stringify({ title, template }),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json(resume, { status: 201 })
  } catch (error) {
    console.error('Resume creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create resume' },
      { status: 500 }
    )
  }
}