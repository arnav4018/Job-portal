'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Plus,
  Eye,
  Calendar,
  MapPin,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/dashboard-layout'

interface Job {
  id: string
  title: string
  status: string
  location: string
  type: string
  createdAt: Date
  company: {
    name: string
  }
  _count: {
    applications: number
  }
}

interface Application {
  id: string
  status: string
  appliedAt: Date
  matchScore: number | null
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
    } | null
  }
}

interface Company {
  id: string
  name: string
  description: string | null
  website: string | null
  location: string | null
}

interface RecruiterStats {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  newApplications: number
}

interface RecruiterDashboardContentProps {
  jobs: Job[]
  applications: Application[]
  company: Company | null
  stats: RecruiterStats
}

export default function RecruiterDashboardContent({ 
  jobs, 
  applications, 
  company, 
  stats 
}: RecruiterDashboardContentProps) {
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getApplicationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied': return 'bg-blue-100 text-blue-800'
      case 'shortlisted': return 'bg-purple-100 text-purple-800'
      case 'interview_scheduled': return 'bg-orange-100 text-orange-800'
      case 'hired': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, Recruiter!
          </h1>
          <p className="text-blue-100 mb-4">
            Manage your job postings and find the best candidates for your team.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/recruiter/jobs/post">
              <Button variant="secondary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            </Link>
            <Link href="/recruiter/applications">
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-blue-600">
                <Users className="w-4 h-4 mr-2" />
                View Applications
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeJobs} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {stats.newApplications} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">
                Currently hiring
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Company Profile</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {company ? '✓' : '!'}
              </div>
              <p className="text-xs text-muted-foreground">
                {company ? 'Complete' : 'Setup required'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Company Setup Alert */}
        {!company && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Complete Your Company Profile</CardTitle>
              <CardDescription className="text-orange-700">
                Set up your company profile to start posting jobs and attracting candidates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/recruiter/company/setup">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Setup Company Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Jobs</CardTitle>
                <Link href="/recruiter/jobs">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Your latest job postings and their performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                  <p className="text-gray-500 mb-4">Start by posting your first job</p>
                  <Link href="/recruiter/jobs/post">
                    <Button>Post Your First Job</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{job.title}</h3>
                            <Badge className={getStatusColor(job.status)}>
                              {formatStatus(job.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{job.company.name}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {job.location}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {job._count.applications} applications
                            </span>
                          </div>
                        </div>
                        <Link href={`/recruiter/jobs/${job.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Applications</CardTitle>
                <Link href="/recruiter/applications">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
              <CardDescription>
                Latest candidate applications to review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-500">Applications will appear here once candidates apply</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((application) => (
                    <div key={application.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">
                              {application.candidate.profile?.firstName} {application.candidate.profile?.lastName} 
                              {!application.candidate.profile?.firstName && application.candidate.name}
                            </h4>
                            <Badge className={getApplicationStatusColor(application.status)}>
                              {formatStatus(application.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{application.job.title}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {new Date(application.appliedAt).toLocaleDateString()}
                            </span>
                            {application.matchScore && (
                              <span className="text-green-600 font-medium">
                                {Math.round(application.matchScore)}% match
                              </span>
                            )}
                          </div>
                        </div>
                        <Link href={`/recruiter/applications/${application.id}`}>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}