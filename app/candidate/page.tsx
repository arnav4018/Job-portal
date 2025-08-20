import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Briefcase, 
  FileText, 
  Users, 
  TrendingUp,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { getRelativeTime } from '@/lib/utils'

export default async function CandidateDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'CANDIDATE') {
    redirect('/auth/signin')
  }

  // Fetch dashboard data
  const [applications, resumes, profile] = await Promise.all([
    prisma.application.findMany({
      where: { candidateId: session.user.id },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
                logo: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
      take: 5,
    }),
    prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      take: 3,
    }),
    prisma.profile.findUnique({
      where: { userId: session.user.id },
    }),
  ])

  const stats = {
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status === 'APPLIED').length,
    interviewsScheduled: applications.filter(app => app.status === 'INTERVIEW_SCHEDULED').length,
    totalResumes: resumes.length,
  }

  const profileCompleteness = calculateProfileCompleteness(profile)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {session.user.name}!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your job search
        </p>
      </div>

      {/* Profile Completeness */}
      {profileCompleteness < 100 && (
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-800">
              <TrendingUp className="h-5 w-5 mr-2" />
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-orange-700">
              A complete profile increases your chances of getting hired
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Progress value={profileCompleteness} className="flex-1" />
              <span className="text-sm font-medium text-orange-800">
                {profileCompleteness}%
              </span>
            </div>
            <Button className="mt-4" variant="outline" asChild>
              <Link href="/profile">Complete Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              Applications submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.interviewsScheduled}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled interviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resumes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalResumes}</div>
            <p className="text-xs text-muted-foreground">
              Created resumes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/candidate/applications">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{application.job.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {application.job.company.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Applied {getRelativeTime(application.appliedAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusVariant(application.status)}>
                        {application.status}
                      </Badge>
                      {application.matchScore && (
                        <Badge variant="outline">
                          {Math.round(application.matchScore)}% match
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start applying to jobs to see them here
                </p>
                <Button asChild>
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Resumes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Resumes</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/resume-builder">
                  <Plus className="h-4 w-4 mr-1" />
                  Create New
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {resumes.length > 0 ? (
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div key={resume.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{resume.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Updated {getRelativeTime(resume.updatedAt)}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {resume.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {resume.downloadCount} downloads
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/resume-builder/${resume.id}`}>Edit</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No resumes yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first resume to start applying
                </p>
                <Button asChild>
                  <Link href="/resume-builder">Create Resume</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
              <Link href="/jobs">
                <Briefcase className="h-6 w-6" />
                <span>Browse Jobs</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
              <Link href="/resume-builder">
                <FileText className="h-6 w-6" />
                <span>Build Resume</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2" asChild>
              <Link href="/profile">
                <Users className="h-6 w-6" />
                <span>Update Profile</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function calculateProfileCompleteness(profile: any): number {
  if (!profile) return 0
  
  const fields = [
    'firstName',
    'lastName',
    'phone',
    'location',
    'bio',
    'experience',
    'skills',
  ]
  
  const completedFields = fields.filter(field => {
    const value = profile[field]
    if (Array.isArray(value)) return value.length > 0
    return value && value.toString().trim().length > 0
  })
  
  return Math.round((completedFields.length / fields.length) * 100)
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case 'APPLIED':
      return 'secondary'
    case 'SHORTLISTED':
      return 'default'
    case 'INTERVIEW_SCHEDULED':
      return 'default'
    case 'HIRED':
      return 'default'
    case 'REJECTED':
      return 'destructive'
    default:
      return 'outline'
  }
}