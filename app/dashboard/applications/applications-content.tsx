'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import DashboardLayout from '@/components/layout/dashboard-layout'
import Link from 'next/link'
import { MapPin, Clock, Briefcase, ExternalLink } from 'lucide-react'

interface Application {
  id: string
  status: string
  appliedAt: Date
  matchScore: number | null
  job: {
    id: string
    title: string
    location: string
    type: string
    company: {
      name: string
    }
  }
}

interface ApplicationsContentProps {
  applications: Application[]
}

export default function ApplicationsContent({ applications }: ApplicationsContentProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied': return 'bg-blue-100 text-blue-800'
      case 'shortlisted': return 'bg-yellow-100 text-yellow-800'
      case 'interview_scheduled': return 'bg-purple-100 text-purple-800'
      case 'interview_completed': return 'bg-indigo-100 text-indigo-800'
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
        <div>
          <h1 className="text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">
            Track the status of your job applications
          </p>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-500 mb-4">Start applying to jobs to see your applications here</p>
              <Link href="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{application.job.title}</h3>
                        <Badge className={getStatusColor(application.status)}>
                          {formatStatus(application.status)}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{application.job.company.name}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {application.job.location}
                        </span>
                        <span className="flex items-center">
                          <Briefcase className="w-4 h-4 mr-1" />
                          {application.job.type.replace(/_/g, ' ')}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Applied {application.appliedAt.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {application.matchScore && (
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Match Score</div>
                          <div className="text-lg font-semibold text-green-600">
                            {application.matchScore}%
                          </div>
                        </div>
                      )}
                      
                      <Link href={`/jobs/${application.job.id}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Job
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}