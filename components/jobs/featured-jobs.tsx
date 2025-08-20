import { safeDbQuery, prisma } from '@/lib/prisma'
import { JobCard } from './job-card'

export async function FeaturedJobs() {
  const featuredJobsRaw = await safeDbQuery(
    () => prisma.job.findMany({
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
    }),
    [] // Fallback to empty array during build
  )
  
  // Parse skills from JSON strings
  const featuredJobs = featuredJobsRaw.map(job => ({
    ...job,
    skills: job.skills ? JSON.parse(job.skills) : [],
  }))

  if (featuredJobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Show placeholder cards during build */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="h-8 w-8 bg-muted rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded w-16" />
                <div className="h-6 bg-muted rounded w-20" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground">Featured jobs will load once the database is connected.</p>
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