import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { quizAttemptSchema } from '@/lib/validations'
import { createAuditLog } from '@/lib/audit'

// POST /api/quizzes/[id]/attempt - Submit quiz attempt
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
    const validatedData = quizAttemptSchema.parse(body)

    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id, isActive: true },
    })

    if (!quiz) {
      return NextResponse.json(
        { error: 'Quiz not found' },
        { status: 404 }
      )
    }

    const questions = JSON.parse(quiz.questions)

    // Calculate score
    let correctAnswers = 0
    const detailedResults = validatedData.answers.map(answer => {
      const question = questions[answer.questionIndex]
      const isCorrect = question.correctAnswer === answer.answer
      if (isCorrect) correctAnswers++

      return {
        questionIndex: answer.questionIndex,
        userAnswer: answer.answer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
      }
    })

    const score = (correctAnswers / questions.length) * 100

    // Save attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: id,
        userId: session.user.id,
        answers: JSON.stringify(validatedData.answers),
        score,
        timeSpent: body.timeSpent || 0,
      },
    })

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE',
      resource: 'quiz_attempt',
      resourceId: attempt.id,
      newData: JSON.stringify({ quizId: id, score }),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({
      id: attempt.id,
      score,
      correctAnswers,
      totalQuestions: questions.length,
      timeSpent: attempt.timeSpent,
      results: detailedResults,
      completedAt: attempt.completedAt,
    })
  } catch (error) {
    console.error('Quiz attempt error:', error)
    return NextResponse.json(
      { error: 'Failed to submit quiz attempt' },
      { status: 500 }
    )
  }
}