import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { sendInterviewConfirmation, sendInterviewReminder } from '@/lib/email'
import { createAuditLog } from '@/lib/audit'

// POST /api/interviews/[id]/confirmation - Send interview confirmation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'RECRUITER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { type = 'confirmation' } = body // 'confirmation' or 'reminder'

    // Get interview details
    const interview = await prisma.interview.findUnique({
      where: { id },
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

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    // Permission check for recruiter
    if (session.user.role === 'RECRUITER' && interview.application.job.recruiterId !== session.user.id) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const candidate = interview.application.candidate
    const job = interview.application.job

    try {
      if (type === 'confirmation') {
        // Send confirmation email
        await sendInterviewConfirmation({
          candidateEmail: candidate.email,
          candidateName: candidate.name || 'Candidate',
          jobTitle: job.title,
          interviewDate: interview.scheduledAt.toLocaleDateString(),
          interviewTime: interview.scheduledAt.toLocaleTimeString(),
          interviewType: interview.type,
          meetingLink: interview.location || undefined,
        })

        // Update confirmation sent status
        await prisma.interview.update({
          where: { id },
          data: { confirmationSent: true },
        })
      } else if (type === 'reminder') {
        // Send reminder email
        await sendInterviewReminder({
          candidateEmail: candidate.email,
          candidateName: candidate.name || 'Candidate',
          jobTitle: job.title,
          interviewDate: interview.scheduledAt.toLocaleDateString(),
          interviewTime: interview.scheduledAt.toLocaleTimeString(),
          meetingLink: interview.location || undefined,
        })

        // Update reminder sent status
        await prisma.interview.update({
          where: { id },
          data: { reminderSent: true },
        })
      }

      // Create audit log
      await createAuditLog({
        userId: session.user.id,
        action: 'UPDATE',
        resource: 'interview',
        resourceId: id,
        metadata: JSON.stringify({ emailType: type }),
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      })

      return NextResponse.json({ 
        success: true, 
        message: `Interview ${type} sent successfully` 
      })
    } catch (emailError) {
      console.error(`Failed to send interview ${type}:`, emailError)
      return NextResponse.json(
        { error: `Failed to send interview ${type}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Interview confirmation error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}