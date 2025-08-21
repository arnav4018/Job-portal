import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { applicationSchema } from '@/lib/validations'
import { calculateSkillMatch } from '@/lib/utils'
// Email service imported dynamically to avoid build-time issues
import { createAuditLog } from '@/lib/audit'

// GET /api/applications - Get user's applications with advanced filtering
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
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'appliedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    let where: any = {}
    let orderBy: any = {}

    // Role-based filtering
    if (session.user.role === 'CANDIDATE') {
      where.candidateId = session.user.id
    } else if (session.user.role === 'RECRUITER') {
      where.job = {
        recruiterId: session.user.id,
      }
    } else if (session.user.role === 'ADMIN') {
      // Admin can see all applications
    }

    // Status filtering
    if (status && status !== 'all') {
      where.status = status
    }

    // Search filtering
    if (search) {
      where.OR = [
        {
          job: {
            title: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          candidate: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    // Dynamic sorting
    if (sortBy === 'matchScore') {
      orderBy.matchScore = sortOrder
    } else if (sortBy === 'appliedAt') {
      orderBy.appliedAt = sortOrder
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder
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
              dropoutCount: true,
              flaggedAsDropout: true,
            },
          },
          resume: {
            select: {
              id: true,
              title: true,
            },
          },
          interviews: {
            orderBy: {
              scheduledAt: 'desc'
            },
            take: 1
          },
          hireTracking: true,
        },
        orderBy,
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

// POST /api/applications - Apply to a job with enhanced features
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
    const referralCode = body.referralCode // Optional referral code

    // Check if job exists and is published
    const job = await prisma.job.findUnique({
      where: { id: validatedData.jobId },
      include: {
        company: true,
        recruiter: true,
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

    // Check for referral code and update referral status
    let referral = null
    if (referralCode) {
      referral = await prisma.referral.findUnique({
        where: { code: referralCode },
        include: { referrer: true },
      })

      if (referral && referral.jobId === validatedData.jobId) {
        // Update referral with referred user if not already set
        if (!referral.referredId) {
          await prisma.referral.update({
            where: { id: referral.id },
            data: { referredId: session.user.id },
          })
        }
      }
    }

    // Create application with transaction
    const application = await prisma.$transaction(async (tx) => {
      const newApplication = await tx.application.create({
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

      // Create audit log
      await createAuditLog({
        userId: session.user.id,
        action: 'CREATE',
        resource: 'application',
        resourceId: newApplication.id,
        newData: JSON.stringify(newApplication),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      })

      // Send notification to recruiter
      await tx.notification.create({
        data: {
          userId: job.recruiterId,
          type: 'NEW_APPLICATION',
          title: 'New Job Application',
          message: `${candidate?.name || 'A candidate'} applied for ${job.title}${referral ? ' (via referral)' : ''}`,
          data: JSON.stringify({
            applicationId: newApplication.id,
            jobId: job.id,
            candidateId: session.user.id,
            matchScore,
            referralId: referral?.id,
          }),
        },
      })

      // Update referral status to APPLIED if referral exists
      if (referral) {
        await tx.referral.update({
          where: { id: referral.id },
          data: { status: 'APPLIED' },
        })

        // Notify referrer
        await tx.notification.create({
          data: {
            userId: referral.referrerId,
            type: 'REFERRAL_UPDATE',
            title: 'Referral Application Submitted',
            message: `Your referred candidate applied for ${job.title}`,
            data: JSON.stringify({
              referralId: referral.id,
              jobId: job.id,
              status: 'APPLIED',
            }),
          },
        })
      }

      return newApplication
    })

    // Send email notification to recruiter (async)
    try {
      const { sendEmail } = await import('@/lib/email')

      await sendEmail({
        to: job.recruiter.email,
        subject: `New Application for ${job.title}`,
        template: 'new-application',
        data: {
          recruiterName: job.recruiter.name,
          jobTitle: job.title,
          candidateName: candidate?.name,
          matchScore: Math.round(matchScore || 0),
          applicationUrl: `${process.env.NEXTAUTH_URL}/dashboard/recruiter/applications/${application.id}`,
        },
      })
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
    }

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Application creation error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}

// PATCH /api/applications - Update application status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { applicationId, status, notes, dropoutReason } = body

    // Get application with permissions check
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        candidate: true,
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Permission check
    const canUpdate = 
      session.user.role === 'ADMIN' ||
      (session.user.role === 'RECRUITER' && application.job.recruiterId === session.user.id) ||
      (session.user.role === 'CANDIDATE' && application.candidateId === session.user.id && status === 'DROPPED_OUT')

    if (!canUpdate) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Update application with transaction
    const updatedApplication = await prisma.$transaction(async (tx) => {
      const updateData: any = {
        status,
        updatedAt: new Date(),
      }

      if (notes) updateData.notes = notes
      if (status === 'DROPPED_OUT') {
        updateData.droppedOut = true
        updateData.dropoutReason = dropoutReason
        
        // Update candidate dropout count
        await tx.user.update({
          where: { id: application.candidateId },
          data: {
            dropoutCount: {
              increment: 1
            },
            flaggedAsDropout: {
              set: true // Flag if dropout count > 3
            }
          }
        })
      }

      const updated = await tx.application.update({
        where: { id: applicationId },
        data: updateData,
        include: {
          job: {
            include: {
              company: true,
            },
          },
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              profile: true,
            },
          },
          interviews: true,
          hireTracking: true,
        },
      })

      // Create audit log
      await createAuditLog({
        userId: session.user.id,
        action: 'UPDATE',
        resource: 'application',
        resourceId: applicationId,
        oldData: JSON.stringify(application),
        newData: JSON.stringify(updated),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      })

      // Send notification to candidate
      await tx.notification.create({
        data: {
          userId: application.candidateId,
          type: 'APPLICATION_STATUS',
          title: 'Application Status Updated',
          message: `Your application for ${application.job.title} has been updated to ${status}`,
          data: JSON.stringify({
            applicationId,
            jobId: application.jobId,
            status,
          }),
        },
      })

      return updated
    })

    // Send email notification (async)
    try {
      const { sendEmail } = await import('@/lib/email')

      await sendEmail({
        to: application.candidate.email,
        subject: `Application Status Update - ${application.job.title}`,
        template: 'application-status-update',
        data: {
          candidateName: application.candidate.name,
          jobTitle: application.job.title,
          status,
          notes,
          applicationUrl: `${process.env.NEXTAUTH_URL}/dashboard/candidate/applications/${applicationId}`,
        },
      })
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
    }

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error('Application update error:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}
