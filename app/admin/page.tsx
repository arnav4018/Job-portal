import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminDashboardContent from './admin-dashboard-content'

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  // Get admin stats
  const [
    totalUsers,
    totalJobs,
    totalApplications,
    totalCompanies,
    recentUsers,
    recentJobs,
    recentApplications
  ] = await Promise.all([
    prisma.user.count(),
    prisma.job.count(),
    prisma.application.count(),
    prisma.company.count(),
    
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        profile: true,
      },
    }),
    
    prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        company: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
    }),
    
    prisma.application.findMany({
      orderBy: { appliedAt: 'desc' },
      take: 5,
      include: {
        job: {
          include: {
            company: true,
          },
        },
        candidate: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ])

  const stats = {
    totalUsers,
    totalJobs,
    totalApplications,
    totalCompanies,
  }

  return (
    <AdminDashboardContent 
      stats={stats}
      recentUsers={recentUsers}
      recentJobs={recentJobs}
      recentApplications={recentApplications}
    />
  )
}