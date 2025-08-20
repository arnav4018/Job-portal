import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import { createAuditLog } from '@/lib/audit'

// POST /api/applications/[id]/dropout - Mark application as dropped out
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { reason, reportedBy } = body // reportedBy can be 'candidate' or 'recruiter'

    // Get application details
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            company: true,
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

    // Permission check
    const canReport = 
      session.user.role === 'ADMIN' ||
      (session.user.role === 'CANDIDATE' && application.candidateId === session.user.id) ||
      (session.user.role === 'RECRUITER' && application.job.recruiterId === session.user.id)

    if (!canReport) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Update application and user dropout tracking
    const updatedApplication = await prisma.$transaction(async (tx) => {
      // Update application status
      const updated = await tx.application.update({
        where: { id },
        data: {
          status: 'DROPPED_OUT',
          droppedOut: true,
          dropoutReason: reason,
          flaggedForDropout: true,
        },
      })

      // Update user dropout count
      const updatedUser = await tx.user.update({
        where: { id: application.candidateId },
        data: {
          dropoutCount: {
            increment: 1,
          },
        },
      })

      // Flag user if dropout count exceeds threshold
      if (updatedUser.dropoutCount >= 3) {
        await tx.user.update({
          where: { id: application.candidateId },
          data: {
            flaggedAsDropout: true,
          },
        })
      }

      // Create notification for the other party
      const notificationUserId = reportedBy === 'candidate' 
        ? application.job.recruiterId 
        : application.candidateId

      const notificationMessage = reportedBy === 'candidate'
        ? `${application.candidate.name} has dropped out of the application for ${application.job.title}`
        : `The recruiter has marked your application for ${application.job.title} as dropped out`

      await tx.notification.create({
        data: {
          userId: notificationUserId,
          type: 'APPLICATION_DROPOUT',
          title: 'Application Dropout',
          message: notificationMessage,
          data: JSON.stringify({
            applicationId: id,
            jobId: application.jobId,
            reason,
            reportedBy,
          }),
        },
      })

      return updated
    })

    // Send email notifications
    try {
      if (reportedBy === 'candidate') {
        // Notify recruiter
        await sendEmail({
          to: application.job.recruiter.email,
          subject: `Candidate Dropout - ${application.job.title}`,
          template: 'candidate-dropout-notification',
          data: {
            recruiterName: application.job.recruiter.name,
            candidateName: application.candidate.name,
            jobTitle: application.job.title,
            reason: reason || 'No reason provided',
            applicationUrl: `${process.env.NEXTAUTH_URL}/recruiter/applications/${id}`,
          },
        })
      } else {
        // Notify candidate
        await sendEmail({
          to: application.candidate.email,
          subject: `Application Status Update - ${application.job.title}`,
          template: 'recruiter-dropout-notification',
          data: {
            candidateName: application.candidate.name,
            jobTitle: application.job.title,
            companyName: application.job.company.name,
            reason: reason || 'No reason provided',
          },
        })
      }
    } catch (emailError) {
      console.error('Failed to send dropout notification email:', emailError)
    }

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      resource: 'application',
      resourceId: id,
      newData: JSON.stringify({
        status: 'DROPPED_OUT',
        reason,
        reportedBy,
      }),
      metadata: JSON.stringify({
        dropoutCount: application.candidate.dropoutCount + 1,
      }),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({
      success: true,
      message: 'Dropout reported successfully',
      dropoutCount: application.candidate.dropoutCount + 1,
    })
  } catch (error) {
    console.error('Dropout reporting error:', error)
    return NextResponse.json(
      { error: 'Failed to report dropout' },
      { status: 500 }
    )
  }
}

// GET /api/applications/[id]/dropout - Get dropout statistics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params

    // Get dropout statistics for the candidate
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            dropoutCount: true,
            flaggedAsDropout: true,
            applications: {
              where: {
                droppedOut: true,
              },
              include: {
                job: {
                  select: {
                    title: true,
                    company: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
              orderBy: {
                updatedAt: 'desc',
              },
            },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      candidateId: application.candidate.id,
      candidateName: application.candidate.name,
      totalDropouts: application.candidate.dropoutCount,
      flaggedAsDropout: application.candidate.flaggedAsDropout,
      dropoutHistory: application.candidate.applications,
    })
  } catch (error) {
    console.error('Dropout statistics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dropout statistics' },
      { status: 500 }
    )
  }
}