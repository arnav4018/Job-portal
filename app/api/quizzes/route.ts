import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { quizSchema } from '@/lib/validations'
import { createAuditLog } from '@/lib/audit'

// GET /api/quizzes - Get available quizzes
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
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    let where: any = { isActive: true }

    if (category && category !== 'all') {
      where.category = category
    }

    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty
    }

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          category: true,
          difficulty: true,
          timeLimit: true,
          createdAt: true,
          _count: {
            select: {
              attempts: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.quiz.count({ where }),
    ])

    // Get user's attempts for these quizzes
    const userAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: session.user.id,
        quizId: {
          in: quizzes.map(q => q.id),
        },
      },
      select: {
        quizId: true,
        score: true,
        completedAt: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    // Merge quiz data with user attempts
    const quizzesWithAttempts = quizzes.map(quiz => ({
      ...quiz,
      userAttempt: userAttempts.find(attempt => attempt.quizId === quiz.id),
      totalAttempts: quiz._count.attempts,
    }))

    return NextResponse.json({
      quizzes: quizzesWithAttempts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Quizzes fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    )
  }
}

// POST /api/quizzes - Create a new quiz (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = quizSchema.parse(body)

    const quiz = await prisma.quiz.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        difficulty: validatedData.difficulty,
        questions: JSON.stringify(validatedData.questions),
        timeLimit: validatedData.timeLimit,
        isActive: true,
      },
    })

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'quiz',
      resourceId: quiz.id,
      newData: JSON.stringify(quiz),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json(quiz, { status: 201 })
  } catch (error) {
    console.error('Quiz creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create quiz' },
      { status: 500 }
    )
  }
}