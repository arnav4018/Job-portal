import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { referralSchema } from '@/lib/validations'
// Email service imported dynamically to avoid build-time issues
import { createAuditLog } from '@/lib/audit'
import { nanoid } from 'nanoid'

// GET /api/referrals - Get user's referrals
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

    let where: any = {
      referrerId: session.user.id,
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const [referrals, total] = await Promise.all([
      prisma.referral.findMany({
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
          referred: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.referral.count({ where }),
    ])

    return NextResponse.json({
      referrals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Referrals fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    )
  }
}

// POST /api/referrals - Create a referral
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
    const validatedData = referralSchema.parse(body)

    // Check if job exists
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

    // Generate unique referral code
    const code = nanoid(10)

    // Check if referred user exists
    let referredUser = null
    if (validatedData.referredEmail) {
      referredUser = await prisma.user.findUnique({
        where: { email: validatedData.referredEmail },
      })
    }

    // Create referral
    const referral = await prisma.referral.create({
      data: {
        referrerId: session.user.id,
        referredId: referredUser?.id,
        jobId: validatedData.jobId,
        code,
        status: 'PENDING',
        reward: 1000, // Default reward amount in INR
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        referred: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Send referral email if email provided
    if (validatedData.referredEmail) {
      try {
        const referralLink = `${process.env.NEXTAUTH_URL}/jobs/${job.id}?ref=${code}`
        
        const { sendEmail } = await import('@/lib/email')

        
        await sendEmail({
          to: validatedData.referredEmail,
          subject: `${session.user.name} referred you to a job opportunity`,
          template: 'job-referral',
          data: {
            referrerName: session.user.name,
            jobTitle: job.title,
            companyName: job.company.name,
            referralLink,
            jobDescription: job.description.substring(0, 200) + '...',
          },
        })
      } catch (emailError) {
        console.error('Failed to send referral email:', emailError)
      }
    }

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'referral',
      resourceId: referral.id,
      newData: JSON.stringify(referral),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({
      ...referral,
      referralLink: `${process.env.NEXTAUTH_URL}/jobs/${job.id}?ref=${code}`,
    }, { status: 201 })
  } catch (error) {
    console.error('Referral creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    )
  }
}

// PATCH /api/referrals - Update referral status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'RECRUITER')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { referralId, status } = body

    if (!['PENDING', 'APPLIED', 'INTERVIEW', 'HIRED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Get referral
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      include: {
        referrer: true,
        job: {
          include: {
            company: true,
          },
        },
      },
    })

    if (!referral) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      )
    }

    // Permission check for recruiter
    if (session.user.role === 'RECRUITER' && referral.job.recruiterId !== session.user.id) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Update referral status
    const updatedReferral = await prisma.$transaction(async (tx) => {
      const updated = await tx.referral.update({
        where: { id: referralId },
        data: {
          status,
          paidAt: status === 'HIRED' ? new Date() : undefined,
        },
        include: {
          referrer: true,
          job: {
            include: {
              company: true,
            },
          },
        },
      })

      // Create notification for referrer
      await tx.notification.create({
        data: {
          userId: referral.referrerId,
          type: 'REFERRAL_UPDATE',
          title: 'Referral Status Updated',
          message: `Your referral for ${referral.job.title} has been updated to ${status}`,
          data: JSON.stringify({
            referralId,
            jobId: referral.jobId,
            status,
            reward: status === 'HIRED' ? referral.reward : null,
          }),
        },
      })

      // Create payment record if hired
      if (status === 'HIRED' && referral.reward) {
        await tx.payment.create({
          data: {
            userId: referral.referrerId,
            type: 'REFERRAL_PAYOUT',
            amount: referral.reward,
            currency: 'INR',
            status: 'PENDING',
            provider: 'internal',
            metadata: JSON.stringify({
              referralId,
              jobId: referral.jobId,
            }),
          },
        })
      }

      return updated
    })

    // Send notification email
    try {
      const { sendEmail } = await import('@/lib/email')

      await sendEmail({
        to: referral.referrer.email,
        subject: `Referral Status Update - ${referral.job.title}`,
        template: 'referral-status-update',
        data: {
          referrerName: referral.referrer.name,
          jobTitle: referral.job.title,
          companyName: referral.job.company.name,
          status,
          reward: status === 'HIRED' ? referral.reward : null,
        },
      })
    } catch (emailError) {
      console.error('Failed to send referral update email:', emailError)
    }

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      resource: 'referral',
      resourceId: referralId,
      oldData: JSON.stringify(referral),
      newData: JSON.stringify(updatedReferral),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json(updatedReferral)
  } catch (error) {
    console.error('Referral update error:', error)
    return NextResponse.json(
      { error: 'Failed to update referral' },
      { status: 500 }
    )
  }
}