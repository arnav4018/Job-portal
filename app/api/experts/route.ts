import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { expertProfileSchema } from '@/lib/validations'
import { createAuditLog } from '@/lib/audit'

// GET /api/experts - Get available experts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const expertise = searchParams.get('expertise')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    let where: any = {
      isAvailable: true,
      isVerified: true,
    }

    if (expertise) {
      where.expertise = {
        contains: expertise,
      }
    }

    const [experts, total] = await Promise.all([
      prisma.expertProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              consultingSessions: true,
            },
          },
        },
        orderBy: [
          { rating: 'desc' },
          { totalSessions: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.expertProfile.count({ where }),
    ])

    const expertsWithDetails = experts.map(expert => ({
      id: expert.id,
      userId: expert.userId,
      name: expert.user.name,
      image: expert.user.image,
      expertise: JSON.parse(expert.expertise),
      bio: expert.bio,
      experience: expert.experience,
      rating: expert.rating,
      totalSessions: expert.totalSessions,
      ratePerMinute: expert.ratePerMinute,
      freeMinutes: expert.freeMinutes,
      isAvailable: expert.isAvailable,
      sessionsCount: expert._count.consultingSessions,
    }))

    return NextResponse.json({
      experts: expertsWithDetails,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Experts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch experts' },
      { status: 500 }
    )
  }
}

// POST /api/experts - Apply to become an expert
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
    const validatedData = expertProfileSchema.parse(body)

    // Check if user already has an expert profile
    const existingExpert = await prisma.expertProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (existingExpert) {
      return NextResponse.json(
        { error: 'Expert profile already exists' },
        { status: 400 }
      )
    }

    const expert = await prisma.$transaction(async (tx) => {
      // Create expert profile
      const newExpert = await tx.expertProfile.create({
        data: {
          userId: session.user.id,
          expertise: JSON.stringify(validatedData.expertise),
          bio: validatedData.bio,
          experience: validatedData.experience,
          ratePerMinute: validatedData.ratePerMinute,
          freeMinutes: validatedData.freeMinutes,
          isAvailable: false, // Requires admin approval
          isVerified: false,
        },
      })

      // Update user role
      await tx.user.update({
        where: { id: session.user.id },
        data: { role: 'EXPERT' },
      })

      return newExpert
    })

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'expert',
      resourceId: expert.id,
      newData: JSON.stringify(expert),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json(expert, { status: 201 })
  } catch (error) {
    console.error('Expert profile creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create expert profile' },
      { status: 500 }
    )
  }
}