import { prisma } from '@/lib/prisma'
import { JobCard } from './job-card'

export async function FeaturedJobs() {
  const featuredJobsRaw = await prisma.job.findMany({
    where: {
      status: 'PUBLISHED',
      featured: true,
      featuredUntil: {
        gte: new Date(),
      },
    },
    include: {
      company: true,
      recruiter: {
        select: {
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 6,
  })
  
  // Parse skills from JSON strings
  const featuredJobs = featuredJobsRaw.map(job => ({
    ...job,
    skills: job.skills ? JSON.parse(job.skills) : [],
  }))

  if (featuredJobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No featured jobs available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredJobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  )
}