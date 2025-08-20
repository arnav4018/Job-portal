import { JobCard } from './job-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search } from 'lucide-react'

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
  // Build query parameters
  const params = new URLSearchParams()
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, value)
  })
  
  // Fetch jobs from API
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/jobs?${params.toString()}`, {
    cache: 'no-store',
  })
  
  if (!response.ok) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Failed to load jobs. Please try again.</p>
        </CardContent>
      </Card>
    )
  }
  
  const data = await response.json()
  const { jobs, pagination } = data

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