import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { resumeSchema } from '@/lib/validations'


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
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { isDefault: 'desc' },
        { updatedAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        isDefault: true,
        downloadCount: true,
        createdAt: true,
        updatedAt: true,
        pdfUrl: true,
      },
    })

    return NextResponse.json(resumes)
  } catch (error) {
    console.error('Resumes fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    )
  }
}

// POST /api/resumes - Create or update resume
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = resumeSchema.parse(body)

    // Check resume limit
    const resumeCount = await prisma.resume.count({
      where: { userId: session.user.id },
    })

    const maxResumes = 5 // Could be configurable
    if (resumeCount >= maxResumes) {
      return NextResponse.json(
        { error: `Maximum ${maxResumes} resumes allowed` },
        { status: 400 }
      )
    }

    // If this is the first resume, make it default
    const isFirstResume = resumeCount === 0

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        title: validatedData.title,
        data: validatedData,
        isDefault: isFirstResume,
      },
    })

    // Log audit
    await prisma.audit.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        resource: 'resume',
        resourceId: resume.id,
        newData: JSON.stringify(resume),
      },
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