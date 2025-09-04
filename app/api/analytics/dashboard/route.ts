import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subDays, startOfDay, endOfDay } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // Default to 30 days
    const startDate = startOfDay(subDays(new Date(), parseInt(period)))
    const endDate = endOfDay(new Date())

    // Get dashboard metrics based on user role
    const userId = session.user.id
    const userRole = session.user.role

    let metrics = {}

    if (userRole === 'RECRUITER' || userRole === 'ADMIN') {
      // Recruiter/Admin metrics
      const [
        totalJobs,
        totalApplications,
        totalInterviews,
        totalHires,
        recentApplications,
        jobsWithMostApplications,
        applicationTrends
      ] = await Promise.all([
        // Total active jobs
        prisma.job.count({
          where: {
            recruiterId: userId,
            status: 'PUBLISHED',
            createdAt: { gte: startDate, lte: endDate }
          }
        }),
        
        // Total applications
        prisma.application.count({
          where: {
            job: { recruiterId: userId },
            appliedAt: { gte: startDate, lte: endDate }
          }
        }),
        
        // Total interviews scheduled
        prisma.interview.count({
          where: {
            application: {
              job: { recruiterId: userId }
            },
            scheduledAt: { gte: startDate, lte: endDate }
          }
        }),
        
        // Total hires
        prisma.application.count({
          where: {
            job: { recruiterId: userId },
            status: 'HIRED',
            updatedAt: { gte: startDate, lte: endDate }
          }
        }),
        
        // Recent applications
        prisma.application.findMany({
          where: {
            job: { recruiterId: userId },
            appliedAt: { gte: startDate, lte: endDate }
          },
          include: {
            candidate: {
              select: { name: true, email: true }
            },
            job: {
              select: { title: true }
            }
          },
          orderBy: { appliedAt: 'desc' },
          take: 10
        }),
        
        // Jobs with most applications
        prisma.job.findMany({
          where: {
            recruiterId: userId,
            createdAt: { gte: startDate, lte: endDate }
          },
          include: {
            _count: {
              select: { applications: true }
            }
          },
          orderBy: {
            applications: {
              _count: 'desc'
            }
          },
          take: 5
        }),
        
        // Application trends (daily applications over the period)
        prisma.$queryRaw`
          SELECT 
            DATE(applied_at) as date,
            COUNT(*) as count
          FROM applications a
          INNER JOIN jobs j ON a.job_id = j.id
          WHERE j.recruiter_id = ${userId}
            AND a.applied_at >= ${startDate}
            AND a.applied_at <= ${endDate}
          GROUP BY DATE(applied_at)
          ORDER BY date DESC
        `
      ])

      metrics = {
        totalJobs,
        totalApplications,
        totalInterviews,
        totalHires,
        conversionRate: totalApplications > 0 ? ((totalHires / totalApplications) * 100).toFixed(1) : '0',
        recentApplications,
        jobsWithMostApplications,
        applicationTrends
      }
      
    } else if (userRole === 'CANDIDATE') {
      // Candidate metrics
      const [
        totalApplications,
        totalInterviews,
        profileViews,
        savedJobs,
        recentApplications,
        interviewHistory,
        applicationStatusBreakdown
      ] = await Promise.all([
        // Total applications sent
        prisma.application.count({
          where: {
            candidateId: userId,
            appliedAt: { gte: startDate, lte: endDate }
          }
        }),
        
        // Total interviews
        prisma.interview.count({
          where: {
            candidateId: userId,
            scheduledAt: { gte: startDate, lte: endDate }
          }
        }),
        
        // Profile views (if tracking implemented)
        prisma.userProfile.findUnique({
          where: { userId },
          select: { profileViews: true }
        }).then(profile => profile?.profileViews || 0),
        
        // Saved jobs count
        prisma.savedFilter.count({
          where: {
            userId,
            type: 'JOB_FILTER'
          }
        }),
        
        // Recent applications
        prisma.application.findMany({
          where: {
            candidateId: userId,
            appliedAt: { gte: startDate, lte: endDate }
          },
          include: {
            job: {
              select: { title: true, company: { select: { name: true } } }
            }
          },
          orderBy: { appliedAt: 'desc' },
          take: 10
        }),
        
        // Interview history
        prisma.interview.findMany({
          where: {
            candidateId: userId,
            scheduledAt: { gte: startDate, lte: endDate }
          },
          include: {
            application: {
              include: {
                job: {
                  select: { title: true, company: { select: { name: true } } }
                }
              }
            }
          },
          orderBy: { scheduledAt: 'desc' },
          take: 10
        }),
        
        // Application status breakdown
        prisma.application.groupBy({
          by: ['status'],
          where: {
            candidateId: userId,
            appliedAt: { gte: startDate, lte: endDate }
          },
          _count: true
        })
      ])

      metrics = {
        totalApplications,
        totalInterviews,
        profileViews,
        savedJobs,
        responseRate: totalApplications > 0 ? ((totalInterviews / totalApplications) * 100).toFixed(1) : '0',
        recentApplications,
        interviewHistory,
        applicationStatusBreakdown
      }
    }

    return NextResponse.json({
      success: true,
      data: metrics,
      period: parseInt(period)
    })

  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
