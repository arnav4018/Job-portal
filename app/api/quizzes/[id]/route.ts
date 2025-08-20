import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// GET /api/quizzes/[id] - Get quiz details
export async function GET(
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

    const quiz = await prisma.quiz.findUnique({
      where: { id, isActive: true },
      include: {
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    })

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    // Parse questions
    const questions = JSON.parse(quiz.questions)

    // Get user's previous attempts
    const userAttempts = await prisma.quizAttempt.findMany({
      where: {
        userId: session.user.id,
        quizId: id,
      },
      select: {
        score: true,
        timeSpent: true,
        completedAt: true,
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    return NextResponse.json({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit,
      questions: questions.map((q: any, index: number) => ({
        id: index,
        question: q.question,
        options: q.options,
        // Don't send correct answer to client
      })),
      totalAttempts: quiz._count.attempts,
      userAttempts,
    })
  } catch (error) {
    console.error('Quiz fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz' },
      { status: 500 }
    )
  }
}