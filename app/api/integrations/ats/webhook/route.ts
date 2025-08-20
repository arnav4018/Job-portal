import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
// Email service imported dynamically to avoid build-time issues
import { createAuditLog } from '@/lib/audit'

// POST /api/integrations/ats/webhook - Handle ATS webhook for hire tracking
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-webhook-signature')
    const expectedSignature = process.env.ATS_WEBHOOK_SECRET

    if (!signature || signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      type, 
      applicationId, 
      candidateId, 
      atsId, 
      hrisId, 
      payrollId,
      hiredAt,
      startDate,
      salary,
      position,
      department,
      status,
      metadata 
    } = body

    // Find the application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: true,
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

    let hireTracking

    switch (type) {
      case 'hire_confirmed':
        // Create or update hire tracking record
        hireTracking = await prisma.hireTracking.upsert({
          where: { applicationId },
          update: {
            hiredAt: hiredAt ? new Date(hiredAt) : new Date(),
            startDate: startDate ? new Date(startDate) : null,
            salary,
            position,
            department,
            atsId,
            hrisId,
            payrollId,
            status: 'CONFIRMED',
            metadata: JSON.stringify(metadata || {}),
          },
          create: {
            applicationId,
            hiredAt: hiredAt ? new Date(hiredAt) : new Date(),
            startDate: startDate ? new Date(startDate) : null,
            salary,
            position,
            department,
            atsId,
            hrisId,
            payrollId,
            status: 'CONFIRMED',
            metadata: JSON.stringify(metadata || {}),
          },
        })

        // Update application status
        await prisma.application.update({
          where: { id: applicationId },
          data: { status: 'HIRED' },
        })

        // Update referral status if exists
        const referral = await prisma.referral.findFirst({
          where: {
            jobId: application.jobId,
            referredId: application.candidateId,
          },
        })

        if (referral) {
          await prisma.referral.update({
            where: { id: referral.id },
            data: {
              status: 'HIRED',
              paidAt: new Date(),
            },
          })

          // Create referral payout
          await prisma.payment.create({
            data: {
              userId: referral.referrerId,
              type: 'REFERRAL_PAYOUT',
              amount: referral.reward || 1000,
              currency: 'INR',
              status: 'PENDING',
              provider: 'internal',
              metadata: JSON.stringify({
                referralId: referral.id,
                applicationId,
                jobId: application.jobId,
              }),
            },
          })
        }

        // Send confirmation email to candidate
        try {
          const { sendEmail } = await import('@/lib/email')

          await sendEmail({
            to: application.candidate.email,
            subject: `Congratulations! You've been hired for ${application.job.title}`,
            template: 'hire-confirmation',
            data: {
              candidateName: application.candidate.name,
              jobTitle: application.job.title,
              companyName: application.job.company.name,
              startDate: startDate ? new Date(startDate).toLocaleDateString() : 'TBD',
              salary: salary ? `₹${salary.toLocaleString()}` : 'As discussed',
              position: position || application.job.title,
              department: department || 'TBD',
            },
          })
        } catch (emailError) {
          console.error('Failed to send hire confirmation email:', emailError)
        }

        break

      case 'employee_started':
        // Update hire tracking with start confirmation
        await prisma.hireTracking.update({
          where: { applicationId },
          data: {
            status: 'STARTED',
            startDate: startDate ? new Date(startDate) : new Date(),
            metadata: JSON.stringify(metadata || {}),
          },
        })

        break

      case 'employee_terminated':
        // Update hire tracking with termination
        await prisma.hireTracking.update({
          where: { applicationId },
          data: {
            status: 'TERMINATED',
            metadata: JSON.stringify({
              ...(metadata || {}),
              terminatedAt: new Date().toISOString(),
            }),
          },
        })

        break

      default:
        return NextResponse.json(
          { error: 'Unknown webhook type' },
          { status: 400 }
        )
    }

    // Create audit log
    await createAuditLog({
      action: 'WEBHOOK',
      resource: 'hire_tracking',
      resourceId: hireTracking?.id,
      newData: JSON.stringify(body),
      metadata: JSON.stringify({
        webhookType: type,
        source: 'ATS',
      }),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ 
      success: true, 
      message: `Webhook ${type} processed successfully` 
    })
  } catch (error) {
    console.error('ATS webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}