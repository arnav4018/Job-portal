import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { formatDistanceToNow } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get recent audit logs for activity feed
    const auditLogs = await prisma.audit.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    const activities = auditLogs.map(log => ({
      id: log.id,
      type: log.action,
      description: generateActivityDescription(log.action, log.resource, log.user?.name || undefined),
      timestamp: formatDistanceToNow(log.createdAt, { addSuffix: true }),
      user: log.user?.name || 'System',
    }))

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Activity fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}

function generateActivityDescription(action: string, resource: string, userName?: string): string {
  const user = userName || 'Someone'
  
  switch (`${action}_${resource}`) {
    case 'CREATE_application':
      return `${user} submitted a new job application`
    case 'UPDATE_application':
      return `${user} updated an application status`
    case 'CREATE_job':
      return `${user} posted a new job`
    case 'UPDATE_job':
      return `${user} updated a job posting`
    case 'CREATE_user':
      return `${user} registered on the platform`
    case 'LOGIN_user':
      return `${user} logged in`
    case 'CREATE_interview':
      return `${user} scheduled an interview`
    case 'UPDATE_interview':
      return `${user} updated interview details`
    case 'CREATE_payment':
      return `${user} made a payment`
    case 'CREATE_referral':
      return `${user} created a referral`
    case 'UPDATE_referral':
      return `${user} updated referral status`
    case 'CREATE_resume':
      return `${user} created a new resume`
    case 'CREATE_message':
      return `${user} sent a message`
    case 'CREATE_consulting_session':
      return `${user} booked a consulting session`
    case 'UPDATE_consulting_session':
      return `${user} updated consulting session`
    case 'CREATE_quiz_attempt':
      return `${user} completed a quiz`
    default:
      return `${user} performed ${action.toLowerCase()} on ${resource}`
  }
}