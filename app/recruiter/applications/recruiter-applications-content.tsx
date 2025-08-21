'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Users, 
  Calendar,
  Star,
  Mail,
  Phone,
  Loader2,
  CheckCircle,
  X
} from 'lucide-react'
import Link from 'next/link'

interface Application {
  id: string
  status: string
  appliedAt: string
  matchScore: number | null
  coverLetter: string | null
  job: {
    id: string
    title: string
  }
  candidate: {
    id: string
    name: string | null
    email: string
    profile: {
      firstName?: string | null
      lastName?: string | null
      phone?: string | null
      bio?: string | null
      skills?: string | null
      experience?: number | null
    } | null
  }
  resume: {
    id: string
    title: string
  } | null
}

export default function RecruiterApplicationsContent() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [jobFilter, setJobFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  useEffect(() => {
    fetchApplications()
  }, [page, statusFilter, jobFilter])

  const fetchApplications = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        status: statusFilter,
        search: searchQuery,
      })

      const response = await fetch(`/api/applications?${params}`)
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
        setTotalPages(data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      toast({
        title: 'Error',
        description: 'Failed to load applications. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
        }),
      })

      if (response.ok) {
        setApplications(apps => 
          apps.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus }
              : app
          )
        )
        toast({
          title: 'Status Updated',
          description: `Application status changed to ${newStatus.toLowerCase()}.`,
        })
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update application status.',
        variant: 'destructive',
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied': return 'bg-blue-100 text-blue-800'
      case 'shortlisted': return 'bg-purple-100 text-purple-800'
      case 'interview_scheduled': return 'bg-orange-100 text-orange-800'
      case 'interview_completed': return 'bg-indigo-100 text-indigo-800'
      case 'hired': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredApplications = applications.filter(app =>
    app.candidate.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.job.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/recruiter">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Applications</h1>
            <p className="text-muted-foreground">
              Review and manage candidate applications
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates or jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="APPLIED">Applied</SelectItem>
                  <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
                  <SelectItem value="INTERVIEW_SCHEDULED">Interview Scheduled</SelectItem>
                  <SelectItem value="INTERVIEW_COMPLETED">Interview Completed</SelectItem>
                  <SelectItem value="HIRED">Hired</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchApplications} variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate Applications</CardTitle>
            <CardDescription>
              {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                <p className="text-gray-500">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Applications will appear here when candidates apply to your jobs'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="border rounded-lg p-6 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {application.candidate.profile?.firstName} {application.candidate.profile?.lastName}
                            {!application.candidate.profile?.firstName && application.candidate.name}
                          </h3>
                          <Badge className={getStatusColor(application.status)}>
                            {formatStatus(application.status)}
                          </Badge>
                          {application.matchScore && (
                            <Badge variant="outline" className={getMatchScoreColor(application.matchScore)}>
                              {Math.round(application.matchScore)}% match
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3">Applied for: {application.job.title}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                          <div className="flex items-center text-gray-500">
                            <Mail className="h-4 w-4 mr-2" />
                            {application.candidate.email}
                          </div>
                          
                          {application.candidate.profile?.phone && (
                            <div className="flex items-center text-gray-500">
                              <Phone className="h-4 w-4 mr-2" />
                              {application.candidate.profile.phone}
                            </div>
                          )}
                          
                          <div className="flex items-center text-gray-500">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(application.appliedAt).toLocaleDateString()}
                          </div>
                          
                          {application.candidate.profile?.experience && (
                            <div className="flex items-center text-gray-500">
                              <Star className="h-4 w-4 mr-2" />
                              {application.candidate.profile.experience} years exp.
                            </div>
                          )}
                        </div>

                        {application.candidate.profile?.bio && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {application.candidate.profile.bio}
                          </p>
                        )}

                        {application.candidate.profile?.skills && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Skills:</p>
                            <p className="text-sm text-gray-600">
                              {application.candidate.profile.skills}
                            </p>
                          </div>
                        )}

                        {application.coverLetter && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {application.coverLetter}
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-6">
                        {application.status === 'APPLIED' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateApplicationStatus(application.id, 'SHORTLISTED')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Shortlist
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {application.status === 'SHORTLISTED' && (
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, 'INTERVIEW_SCHEDULED')}
                          >
                            Schedule Interview
                          </Button>
                        )}
                        
                        {application.status === 'INTERVIEW_COMPLETED' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateApplicationStatus(application.id, 'HIRED')}
                            >
                              Hire
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {application.resume && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/resume-builder/${application.resume.id}/preview`}>
                              View Resume
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}