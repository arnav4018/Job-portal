import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { interviewSchema } from '@/lib/validations'
import { sendInterviewConfirmation } from '@/lib/email'
import { createAuditLog } from '@/lib/audit'

// GET /api/interviews - Get interviews
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
    const status = searchParams.get('status')
    const skip = (page - 1) * limit

    let where: any = {}

    // Role-based filtering
    if (session.user.role === 'CANDIDATE') {
      where.candidateId = session.user.id
    } else if (session.user.role === 'RECRUITER') {
      where.application = {
        job: {
          recruiterId: session.user.id,
        },
      }
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const [interviews, total] = await Promise.all([
      prisma.interview.findMany({
        where,
        include: {
          application: {
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
                },
              },
            },
          },
        },
        orderBy: {
          scheduledAt: 'asc',
        },
        skip,
        take: limit,
      }),
      prisma.interview.count({ where }),
    ])

    return NextResponse.json({
      interviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Interviews fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    )
  }
}

// POST /api/interviews - Schedule an interview
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || (session.user.role !== 'RECRUITER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = interviewSchema.parse(body)

    // Get application with permissions check
    const application = await prisma.application.findUnique({
      where: { id: validatedData.applicationId },
      include: {
        job: {
          include: {
            recruiter: true,
          },
        },
        candidate: true,
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Permission check for recruiter
    if (session.user.role === 'RECRUITER' && application.job.recruiterId !== session.user.id) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Create interview with transaction
    const interview = await prisma.$transaction(async (tx) => {
      const newInterview = await tx.interview.create({
        data: {
          applicationId: validatedData.applicationId,
          candidateId: application.candidateId,
          type: validatedData.type,
          scheduledAt: new Date(validatedData.scheduledAt),
          duration: validatedData.duration,
          location: validatedData.location,
          notes: validatedData.notes,
          status: 'SCHEDULED',
        },
        include: {
          application: {
            include: {
              job: {
                include: {
                  company: true,
                },
              },
              candidate: true,
            },
          },
        },
      })

      // Update application status
      await tx.application.update({
        where: { id: validatedData.applicationId },
        data: { status: 'INTERVIEW_SCHEDULED' },
      })

      // Create notification for candidate
      await tx.notification.create({
        data: {
          userId: application.candidateId,
          type: 'INTERVIEW_SCHEDULED',
          title: 'Interview Scheduled',
          message: `Your interview for ${application.job.title} has been scheduled`,
          data: JSON.stringify({
            interviewId: newInterview.id,
            applicationId: validatedData.applicationId,
            jobId: application.jobId,
            scheduledAt: validatedData.scheduledAt,
          }),
        },
      })

      return newInterview
    })

    // Send confirmation email (async)
    try {
      await sendInterviewConfirmation({
        candidateEmail: application.candidate.email,
        candidateName: application.candidate.name || 'Candidate',
        jobTitle: application.job.title,
        interviewDate: new Date(validatedData.scheduledAt).toLocaleDateString(),
        interviewTime: new Date(validatedData.scheduledAt).toLocaleTimeString(),
        interviewType: validatedData.type,
        meetingLink: validatedData.location,
      })

      // Mark confirmation as sent
      await prisma.interview.update({
        where: { id: interview.id },
        data: { confirmationSent: true },
      })
    } catch (emailError) {
      console.error('Failed to send interview confirmation:', emailError)
    }

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'interview',
      resourceId: interview.id,
      newData: JSON.stringify(interview),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json(interview, { status: 201 })
  } catch (error) {
    console.error('Interview creation error:', error)
    return NextResponse.json(
      { error: 'Failed to schedule interview' },
      { status: 500 }
    )
  }
}