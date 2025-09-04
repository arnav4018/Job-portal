import { JobCard } from './job-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'
import { prisma } from '@/lib/prisma'

interface JobsListProps {
  searchParams: {
    query?: string
    location?: string
    type?: string
    experienceLevel?: string
    remote?: string
    salaryMin?: string
    salaryMax?: string
    skills?: string
    page?: string
  }
}

export async function JobsList({ searchParams }: JobsListProps) {
  // Convert params to proper types
  const page = searchParams.page ? parseInt(searchParams.page) : 1
  const limit = 10
  const salaryMin = searchParams.salaryMin ? parseInt(searchParams.salaryMin) : undefined
  const salaryMax = searchParams.salaryMax ? parseInt(searchParams.salaryMax) : undefined
  const remote = searchParams.remote === 'true'
  const skills = searchParams.skills ? searchParams.skills.split(',') : undefined
  
  // Build where clause
  const where: any = {
    status: 'PUBLISHED',
  }
  
  if (searchParams.query) {
    where.OR = [
      { title: { contains: searchParams.query } },
      { description: { contains: searchParams.query } },
      { skills: { contains: searchParams.query } },
    ]
  }
  
  if (searchParams.location) {
    where.location = { contains: searchParams.location }
  }
  
  if (searchParams.type) {
    where.type = searchParams.type
  }
  
  if (searchParams.experienceLevel) {
    where.experienceLevel = searchParams.experienceLevel
  }
  
  if (searchParams.remote) {
    where.remote = remote
  }
  
  if (salaryMin) {
    where.salaryMin = { gte: salaryMin }
  }
  
  if (salaryMax) {
    where.salaryMax = { lte: salaryMax }
  }
  
  if (skills && skills.length > 0) {
    where.skills = { contains: skills[0] }
  }
  
  const skip = (page - 1) * limit
  
  let jobs: any[] = []
  let pagination = {
    page,
    limit,
    total: 0,
    pages: 0,
  }
  
  try {
    const [jobsRaw, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              name: true,
              logo: true,
              location: true,
            },
          },
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
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ])
    
    // Parse skills from JSON strings
    jobs = jobsRaw.map(job => ({
      ...job,
      skills: job.skills ? JSON.parse(job.skills) : [],
    }))
    
    pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    }
    
    // Log search for analytics (optional, in background)
    if (searchParams.query || Object.keys(searchParams).length > 0) {
      prisma.jobSearch.create({
        data: {
          query: searchParams.query,
          filters: JSON.stringify(searchParams),
          results: total,
        },
      }).catch(error => {
        console.error('Failed to log job search:', error)
      })
    }
  } catch (error) {
    console.error('Failed to fetch jobs:', error)
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Failed to load jobs. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or filters to find more opportunities.
          </p>
          <Button variant="outline">
            Clear Filters
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} jobs
        </p>
        <div className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.pages}
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 gap-6">
        {jobs.map((job: any) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center space-x-2">
          {pagination.page > 1 && (
            <Button variant="outline">
              Previous
            </Button>
          )}
          
          <div className="flex space-x-1">
            {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
              const pageNum = Math.max(1, pagination.page - 2) + i
              if (pageNum > pagination.pages) return null
              
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.page ? "default" : "outline"}
                  size="sm"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          
          {pagination.page < pagination.pages && (
            <Button variant="outline">
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  )
}