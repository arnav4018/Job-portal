import { Suspense } from 'react'
import { JobSearchForm } from '@/components/jobs/job-search-form'
import { JobsList } from '@/components/jobs/jobs-list'
import { JobFilters } from '@/components/jobs/job-filters'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface JobsPageProps {
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

export default function JobsPage({ searchParams }: JobsPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Find Your Next Job</h1>
        <Card>
          <CardContent className="p-6">
            <JobSearchForm />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                ))}
              </div>}>
                <JobFilters searchParams={searchParams} />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <div className="lg:col-span-3">
          <Suspense fallback={
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          }>
            <JobsList searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}