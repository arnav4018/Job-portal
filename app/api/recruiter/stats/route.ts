import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'RECRUITER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get recruiter statistics
    const [
      totalJobs,
      activeJobs,
      totalApplications,
      scheduledInterviews,
      totalHires,
      pendingApplications
    ] = await Promise.all([
      prisma.job.count({
        where: { recruiterId: session.user.id }
      }),
      prisma.job.count({
        where: { 
          recruiterId: session.user.id,
          status: 'PUBLISHED'
        }
      }),
      prisma.application.count({
        where: {
          job: {
            recruiterId: session.user.id
          }
        }
      }),
      prisma.interview.count({
        where: {
          application: {
            job: {
              recruiterId: session.user.id
            }
          },
          status: { in: ['SCHEDULED', 'CONFIRMED'] }
        }
      }),
      prisma.application.count({
        where: {
          job: {
            recruiterId: session.user.id
          },
          status: 'HIRED'
        }
      }),
      prisma.application.count({
        where: {
          job: {
            recruiterId: session.user.id
          },
          status: { in: ['APPLIED', 'SHORTLISTED'] }
        }
      })
    ])

    const stats = {
      totalJobs,
      activeJobs,
      totalApplications,
      scheduledInterviews,
      totalHires,
      pendingApplications
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Recruiter stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recruiter stats' },
      { status: 500 }
    )
  }
}