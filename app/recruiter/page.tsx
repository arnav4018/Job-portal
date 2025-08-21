import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import RecruiterDashboardContent from './recruiter-dashboard-content'

export default async function RecruiterDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'RECRUITER') {
    redirect('/dashboard')
  }

  // Get recruiter stats and data
  const [jobs, applications, company, stats] = await Promise.all([
    // Recent jobs
    prisma.job.findMany({
      where: { recruiterId: session.user.id },
      include: {
        company: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    
    // Recent applications
    prisma.application.findMany({
      where: {
        job: {
          recruiterId: session.user.id,
        },
      },
      include: {
        job: true,
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            profile: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
      take: 10,
    }),
    
    // Company info
    prisma.company.findUnique({
      where: { userId: session.user.id },
    }),
    
    // Stats
    prisma.job.groupBy({
      by: ['status'],
      where: { recruiterId: session.user.id },
      _count: true,
    }),
  ])

  const totalApplications = await prisma.application.count({
    where: {
      job: {
        recruiterId: session.user.id,
      },
    },
  })

  const dashboardStats = {
    totalJobs: jobs.length,
    activeJobs: stats.find(s => s.status === 'PUBLISHED')?._count || 0,
    totalApplications,
    newApplications: applications.filter(app => 
      new Date(app.appliedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length,
  }

  return (
    <RecruiterDashboardContent 
      jobs={jobs}
      applications={applications}
      company={company}
      stats={dashboardStats}
    />
  )
}