import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get candidate statistics
    const [
      totalApplications,
      pendingApplications,
      interviewsScheduled,
      totalResumes,
      profileViews,
      quizAttempts
    ] = await Promise.all([
      prisma.application.count({
        where: { candidateId: session.user.id }
      }),
      prisma.application.count({
        where: { 
          candidateId: session.user.id,
          status: { in: ['APPLIED', 'SHORTLISTED'] }
        }
      }),
      prisma.interview.count({
        where: { 
          candidateId: session.user.id,
          status: { in: ['SCHEDULED', 'CONFIRMED'] }
        }
      }),
      prisma.resume.count({
        where: { userId: session.user.id }
      }),
      // Profile views would need to be tracked separately
      0,
      prisma.quizAttempt.count({
        where: { userId: session.user.id }
      })
    ])

    // Get recent applications with status
    const recentApplications = await prisma.application.findMany({
      where: { candidateId: session.user.id },
      include: {
        job: {
          select: {
            title: true,
            company: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { appliedAt: 'desc' },
      take: 5
    })

    const stats = {
      totalApplications,
      pendingApplications,
      interviewsScheduled,
      totalResumes,
      profileViews,
      quizAttempts,
      recentApplications
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Candidate stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch candidate stats' },
      { status: 500 }
    )
  }
}