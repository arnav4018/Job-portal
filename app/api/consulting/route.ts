import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { consultingSessionSchema } from '@/lib/validations'
import { sendEmail } from '@/lib/email'
import { createAuditLog } from '@/lib/audit'

// GET /api/consulting - Get consulting sessions
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
      where.clientId = session.user.id
    } else if (session.user.role === 'EXPERT') {
      where.expertId = session.user.id
    } else if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const [sessions, total] = await Promise.all([
      prisma.consultingSession.findMany({
        where,
        include: {
          expert: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
          },
          client: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          scheduledAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.consultingSession.count({ where }),
    ])

    return NextResponse.json({
      sessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Consulting sessions fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch consulting sessions' },
      { status: 500 }
    )
  }
}

// POST /api/consulting - Book a consulting session
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
    const validatedData = consultingSessionSchema.parse(body)

    // Get expert details
    const expert = await prisma.expertProfile.findUnique({
      where: { id: validatedData.expertId },
      include: {
        user: true,
      },
    })

    if (!expert || !expert.isAvailable) {
      return NextResponse.json(
        { error: 'Expert not available' },
        { status: 404 }
      )
    }

    // Calculate total amount
    const rate = expert.ratePerMinute || 0
    const freeMinutes = expert.freeMinutes || 0
    const billableMinutes = Math.max(0, validatedData.duration - freeMinutes)
    const totalAmount = billableMinutes * rate

    // Create consulting session
    const consultingSession = await prisma.$transaction(async (tx) => {
      const newSession = await tx.consultingSession.create({
        data: {
          expertId: validatedData.expertId,
          clientId: session.user.id,
          duration: validatedData.duration,
          rate,
          totalAmount,
          scheduledAt: new Date(validatedData.scheduledAt),
          notes: validatedData.notes,
          status: 'SCHEDULED',
        },
        include: {
          expert: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          client: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      })

      // Create notifications
      await tx.notification.create({
        data: {
          userId: validatedData.expertId,
          type: 'CONSULTING_BOOKED',
          title: 'New Consulting Session Booked',
          message: `${session.user.name} booked a consulting session with you`,
          data: JSON.stringify({
            sessionId: newSession.id,
            clientId: session.user.id,
            scheduledAt: validatedData.scheduledAt,
          }),
        },
      })

      await tx.notification.create({
        data: {
          userId: session.user.id,
          type: 'CONSULTING_CONFIRMED',
          title: 'Consulting Session Confirmed',
          message: `Your consulting session with ${expert.user.name} has been confirmed`,
          data: JSON.stringify({
            sessionId: newSession.id,
            expertId: validatedData.expertId,
            scheduledAt: validatedData.scheduledAt,
          }),
        },
      })

      return newSession
    })

    // Send confirmation emails (async)
    try {
      await Promise.all([
        sendEmail({
          to: expert.user.email,
          subject: 'New Consulting Session Booked',
          template: 'consulting-expert-notification',
          data: {
            expertName: expert.user.name,
            candidateName: session.user.name,
            scheduledAt: new Date(validatedData.scheduledAt).toLocaleString(),
            duration: validatedData.duration,
            notes: validatedData.notes || 'No additional notes',
          },
        }),
        sendEmail({
          to: session.user.email!,
          subject: 'Consulting Session Confirmed',
          template: 'consulting-candidate-confirmation',
          data: {
            candidateName: session.user.name,
            expertName: expert.user.name,
            scheduledAt: new Date(validatedData.scheduledAt).toLocaleString(),
            duration: validatedData.duration,
            totalAmount,
            freeMinutes,
          },
        }),
      ])
    } catch (emailError) {
      console.error('Failed to send consultation emails:', emailError)
    }

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'consulting_session',
      resourceId: consultingSession.id,
      newData: JSON.stringify(consultingSession),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json(consultingSession, { status: 201 })
  } catch (error) {
    console.error('Consulting session creation error:', error)
    return NextResponse.json(
      { error: 'Failed to book consulting session' },
      { status: 500 }
    )
  }
}