import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get comprehensive stats
    const [
      totalUsers,
      totalJobs,
      totalCompanies,
      totalApplications,
      activeJobs,
      pendingApprovals,
      totalInterviews,
      totalExperts,
      totalCommissions,
      flaggedDropouts,
      totalQuizzes,
      totalConsultingSessions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.company.count(),
      prisma.application.count(),
      prisma.job.count({ where: { status: 'PUBLISHED' } }),
      prisma.job.count({ where: { status: 'DRAFT' } }),
      prisma.interview.count(),
      prisma.expertProfile.count(),
      prisma.commission.aggregate({
        _sum: { amount: true }
      }),
      prisma.user.count({ where: { flaggedAsDropout: true } }),
      prisma.quizAttempt.count(),
      prisma.consultingSession.count()
    ])

    const stats = {
      totalUsers,
      totalJobs,
      totalCompanies,
      totalApplications,
      activeJobs,
      pendingApprovals,
      totalInterviews,
      totalExperts,
      totalCommissions: totalCommissions._sum.amount || 0,
      flaggedDropouts,
      totalQuizzes,
      totalConsultingSessions
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}