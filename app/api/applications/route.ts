import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { applicationSchema } from '@/lib/validations'

import { calculateSkillMatch } from '@/lib/utils'

// GET /api/applications - Get user's applications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    let where: any = {}

    if (session.user.role === 'CANDIDATE') {
      where.candidateId = session.user.id
    } else if (session.user.role === 'RECRUITER') {
      where.job = {
        recruiterId: session.user.id,
      }
    } else {
      // Admin can see all applications
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          job: {
            include: {
              company: {
                select: {
                  name: true,
                  logo: true,
                },
              },
            },
          },
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              profile: true,
            },
          },
          resume: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: {
          appliedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ])

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Applications fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

// POST /api/applications - Apply to a job
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
    const validatedData = applicationSchema.parse(body)

    // Check if job exists and is published
    const job = await prisma.job.findUnique({
      where: { id: validatedData.jobId },
      include: {
        company: true,
      },
    })

    if (!job || job.status !== 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Job not found or not available' },
        { status: 404 }
      )
    }

    // Check if user already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId: validatedData.jobId,
          candidateId: session.user.id,
        },
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      )
    }

    // Get candidate profile for skill matching
    const candidate = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    })

    // Calculate skill match score
    const candidateSkills = candidate?.profile?.skills ? JSON.parse(candidate.profile.skills) : []
    const jobSkills = job.skills ? JSON.parse(job.skills) : []
    const matchScore = calculateSkillMatch(jobSkills, candidateSkills)

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId: validatedData.jobId,
        candidateId: session.user.id,
        resumeId: validatedData.resumeId,
        coverLetter: validatedData.coverLetter,
        matchScore,
        status: 'APPLIED',
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        candidate: {
          select: {
            name: true,
            email: true,
            profile: true,
          },
        },
        resume: true,
      },
    })

    // Log audit
    await prisma.audit.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        resource: 'application',
        resourceId: application.id,
        newData: JSON.stringify(application),
      },
    })

    // TODO: Send notification to recruiter
    // TODO: Send confirmation email to candidate

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Application creation error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}