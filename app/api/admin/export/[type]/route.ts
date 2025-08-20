import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { createObjectCsvWriter } from 'csv-writer'
import { createAuditLog } from '@/lib/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { type } = params
    let data: any[] = []
    let headers: any[] = []
    let filename = ''

    switch (type) {
      case 'users':
        data = await prisma.user.findMany({
          include: {
            profile: true,
            _count: {
              select: {
                applications: true,
                jobs: true,
              },
            },
          },
        })
        headers = [
          { id: 'id', title: 'ID' },
          { id: 'name', title: 'Name' },
          { id: 'email', title: 'Email' },
          { id: 'role', title: 'Role' },
          { id: 'status', title: 'Status' },
          { id: 'createdAt', title: 'Created At' },
          { id: 'applicationsCount', title: 'Applications' },
          { id: 'jobsCount', title: 'Jobs Posted' },
          { id: 'dropoutCount', title: 'Dropout Count' },
          { id: 'flaggedAsDropout', title: 'Flagged as Dropout' },
        ]
        data = data.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt.toISOString(),
          applicationsCount: user._count.applications,
          jobsCount: user._count.jobs,
          dropoutCount: user.dropoutCount,
          flaggedAsDropout: user.flaggedAsDropout,
        }))
        filename = 'users-export.csv'
        break

      case 'applications':
        data = await prisma.application.findMany({
          include: {
            job: {
              select: {
                title: true,
                company: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            candidate: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        })
        headers = [
          { id: 'id', title: 'ID' },
          { id: 'jobTitle', title: 'Job Title' },
          { id: 'companyName', title: 'Company' },
          { id: 'candidateName', title: 'Candidate Name' },
          { id: 'candidateEmail', title: 'Candidate Email' },
          { id: 'status', title: 'Status' },
          { id: 'matchScore', title: 'Match Score' },
          { id: 'appliedAt', title: 'Applied At' },
          { id: 'droppedOut', title: 'Dropped Out' },
          { id: 'dropoutReason', title: 'Dropout Reason' },
        ]
        data = data.map(app => ({
          id: app.id,
          jobTitle: app.job.title,
          companyName: app.job.company.name,
          candidateName: app.candidate.name,
          candidateEmail: app.candidate.email,
          status: app.status,
          matchScore: app.matchScore,
          appliedAt: app.appliedAt.toISOString(),
          droppedOut: app.droppedOut,
          dropoutReason: app.dropoutReason || '',
        }))
        filename = 'applications-export.csv'
        break

      case 'jobs':
        data = await prisma.job.findMany({
          include: {
            company: {
              select: {
                name: true,
              },
            },
            recruiter: {
              select: {
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                applications: true,
              },
            },
          },
        })
        headers = [
          { id: 'id', title: 'ID' },
          { id: 'title', title: 'Title' },
          { id: 'companyName', title: 'Company' },
          { id: 'recruiterName', title: 'Recruiter' },
          { id: 'type', title: 'Type' },
          { id: 'status', title: 'Status' },
          { id: 'location', title: 'Location' },
          { id: 'remote', title: 'Remote' },
          { id: 'salaryMin', title: 'Min Salary' },
          { id: 'salaryMax', title: 'Max Salary' },
          { id: 'applicationsCount', title: 'Applications' },
          { id: 'views', title: 'Views' },
          { id: 'createdAt', title: 'Created At' },
        ]
        data = data.map(job => ({
          id: job.id,
          title: job.title,
          companyName: job.company.name,
          recruiterName: job.recruiter.name,
          type: job.type,
          status: job.status,
          location: job.location,
          remote: job.remote,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          applicationsCount: job._count.applications,
          views: job.views,
          createdAt: job.createdAt.toISOString(),
        }))
        filename = 'jobs-export.csv'
        break

      case 'interviews':
        data = await prisma.interview.findMany({
          include: {
            application: {
              include: {
                job: {
                  select: {
                    title: true,
                  },
                },
                candidate: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        })
        headers = [
          { id: 'id', title: 'ID' },
          { id: 'jobTitle', title: 'Job Title' },
          { id: 'candidateName', title: 'Candidate Name' },
          { id: 'candidateEmail', title: 'Candidate Email' },
          { id: 'type', title: 'Type' },
          { id: 'status', title: 'Status' },
          { id: 'scheduledAt', title: 'Scheduled At' },
          { id: 'duration', title: 'Duration (mins)' },
          { id: 'rating', title: 'Rating' },
          { id: 'confirmationSent', title: 'Confirmation Sent' },
          { id: 'reminderSent', title: 'Reminder Sent' },
        ]
        data = data.map(interview => ({
          id: interview.id,
          jobTitle: interview.application.job.title,
          candidateName: interview.application.candidate.name,
          candidateEmail: interview.application.candidate.email,
          type: interview.type,
          status: interview.status,
          scheduledAt: interview.scheduledAt.toISOString(),
          duration: interview.duration,
          rating: interview.rating || '',
          confirmationSent: interview.confirmationSent,
          reminderSent: interview.reminderSent,
        }))
        filename = 'interviews-export.csv'
        break

      default:
        return NextResponse.json(
          { error: 'Invalid export type' },
          { status: 400 }
        )
    }

    // Generate CSV content
    const csvContent = generateCSV(data, headers)

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'EXPORT',
      resource: type,
      metadata: JSON.stringify({ recordCount: data.length }),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

function generateCSV(data: any[], headers: any[]): string {
  const headerRow = headers.map(h => h.title).join(',')
  const dataRows = data.map(row => 
    headers.map(h => {
      const value = row[h.id]
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    }).join(',')
  )
  
  return [headerRow, ...dataRows].join('\n')
}