import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Users, 
  Briefcase, 
  Building2, 
  TrendingUp, 
  Activity,
  Star,
  Calendar,
  Brain,
  UserCheck,
  DollarSign
} from 'lucide-react'

// Server-side data fetching function
async function getDemoData() {
  try {
    const [stats, recentJobs, topCandidates, recentApplications] = await Promise.all([
      // Statistics
      Promise.all([
        prisma.user.count(),
        prisma.job.count(),
        prisma.company.count(),
        prisma.application.count(),
        prisma.interview.count(),
        prisma.expertProfile.count(),
        prisma.quizAttempt.count(),
        prisma.referral.count()
      ]),
      
      // Recent jobs with companies
      prisma.job.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: { name: true, logo: true, location: true }
          },
          _count: {
            select: { applications: true }
          }
        }
      }),
      
      // Top candidates by match scores
      prisma.user.findMany({
        where: { role: 'CANDIDATE' },
        take: 5,
        include: {
          profile: true,
          _count: {
            select: { applications: true }
          }
        }
      }),
      
      // Recent applications with match scores
      prisma.application.findMany({
        take: 8,
        orderBy: { appliedAt: 'desc' },
        include: {
          job: {
            select: { title: true }
          },
          candidate: {
            select: { name: true, image: true }
          }
        }
      })
    ])

    const [totalUsers, totalJobs, totalCompanies, totalApplications, totalInterviews, totalExperts, totalQuizAttempts, totalReferrals] = stats
    
    return {
      stats: [totalUsers, totalJobs, totalCompanies, totalApplications, totalInterviews, totalExperts, totalQuizAttempts, totalReferrals],
      recentJobs,
      topCandidates,
      recentApplications
    }
  } catch (error) {
    console.error('Failed to fetch demo data:', error)
    
    // Return fallback data for when database is not available
    return {
      stats: [0, 0, 0, 0, 0, 0, 0, 0],
      recentJobs: [],
      topCandidates: [],
      recentApplications: []
    }
  }
}

export default async function DemoPage() {
  const { stats, recentJobs, topCandidates, recentApplications } = await getDemoData()
  const [totalUsers, totalJobs, totalCompanies, totalApplications, totalInterviews, totalExperts, totalQuizAttempts, totalReferrals] = stats

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Portal Demo</h1>
              <p className="text-gray-600 mt-1">AI-Powered Recruitment Platform</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/">
                <Button variant="outline">View Live Site</Button>
              </Link>
              <Link href="/dashboard">
                <Button>Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Candidates, Recruiters & Experts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalJobs}</div>
              <p className="text-xs text-muted-foreground">Across {totalCompanies} companies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-muted-foreground">{totalInterviews} interviews scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Features</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuizAttempts}</div>
              <p className="text-xs text-muted-foreground">Quiz attempts & {totalExperts} experts</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Featured Jobs</span>
              </CardTitle>
              <CardDescription>Latest job postings with AI-powered matching</CardDescription>
            </CardHeader>
            <CardContent>
              {recentJobs.length > 0 ? (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {job.company.name.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{job.title}</h4>
                        <p className="text-sm text-gray-600">{job.company.name}</p>
                        <p className="text-xs text-gray-500">{job.company.location}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {job._count.applications} applications
                          </Badge>
                          {job.remote && (
                            <Badge variant="outline" className="text-xs">Remote</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Demo data will load once database is connected and seeded.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Candidates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5" />
                <span>Top Candidates</span>
              </CardTitle>
              <CardDescription>Candidates with high skill match scores</CardDescription>
            </CardHeader>
            <CardContent>
              {topCandidates.length > 0 ? (
                <div className="space-y-4">
                  {topCandidates.map((candidate) => {
                    const skills = candidate.profile?.skills ? JSON.parse(candidate.profile.skills) : []
                    return (
                      <div key={candidate.id} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          {candidate.name?.substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm">{candidate.name}</h4>
                          <p className="text-xs text-gray-500">{candidate.profile?.location}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {skills.slice(0, 3).map((skill: string) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {candidate._count.applications} applications
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Candidate data will load once database is seeded.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Recent Applications</span>
            </CardTitle>
            <CardDescription>Latest job applications with AI match scores</CardDescription>
          </CardHeader>
          <CardContent>
            {recentApplications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="p-4 rounded-lg border hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold text-xs">
                        {application.candidate.name?.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{application.candidate.name}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 truncate">{application.job.title}</p>
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={application.matchScore && application.matchScore > 80 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {application.matchScore || 0}% match
                      </Badge>
                      <Badge 
                        variant={application.status === 'HIRED' ? 'default' : 'outline'} 
                        className="text-xs"
                      >
                        {application.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Application data will load once database is seeded.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Demo Actions</CardTitle>
            <CardDescription>Explore different aspects of the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/dashboard">
                <Button className="w-full" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/jobs">
                <Button className="w-full" variant="outline">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button className="w-full" variant="outline">
                  <Activity className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link href="/status">
                <Button className="w-full" variant="outline">
                  <Star className="w-4 h-4 mr-2" />
                  System Status
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        {totalUsers === 0 && (
          <Card className="mt-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Setup Required</CardTitle>
              <CardDescription className="text-orange-700">
                To see demo data, you need to set up the database and run the seed script.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-orange-800">
                <p><strong>1.</strong> Set up environment variables in Vercel</p>
                <p><strong>2.</strong> Run database migrations: <code className="bg-orange-100 px-2 py-1 rounded">npx prisma migrate deploy</code></p>
                <p><strong>3.</strong> Seed demo data: <code className="bg-orange-100 px-2 py-1 rounded">npm run demo-seed</code></p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}