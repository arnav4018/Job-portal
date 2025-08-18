"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Briefcase, 
  FileText, 
  Search, 
  Bell, 
  TrendingUp, 
  MapPin, 
  Clock,
  DollarSign,
  Users
} from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface DashboardStats {
  appliedJobs: number
  savedJobs: number
  profileViews: number
  resumeDownloads: number
}

interface RecentApplication {
  id: string
  job: {
    title: string
    company: { name: string }
    location: string
    type: string
  }
  status: string
  appliedAt: string
  matchScore?: number
}

export default function CandidateDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    appliedJobs: 0,
    savedJobs: 0,
    profileViews: 0,
    resumeDownloads: 0
  })
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, applicationsRes] = await Promise.all([
        fetch("/api/dashboard/candidate/stats"),
        fetch("/api/dashboard/candidate/applications")
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json()
        setRecentApplications(applicationsData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied": return "bg-blue-100 text-blue-800"
      case "shortlisted": return "bg-yellow-100 text-yellow-800"
      case "interview": return "bg-purple-100 text-purple-800"
      case "hired": return "bg-green-100 text-green-800"
      case "rejected": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-blue-100 mb-4">
            Ready to find your next opportunity? Let's get started.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/jobs">
              <Button variant="secondary" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Browse Jobs
              </Button>
            </Link>
            <Link href="/resume-builder">
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-blue-600">
                <FileText className="w-4 h-4 mr-2" />
                Build Resume
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applied Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.appliedJobs}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.profileViews}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resume Downloads</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resumeDownloads}</div>
              <p className="text-xs text-muted-foreground">
                +5 this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Jobs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.savedJobs}</div>
              <p className="text-xs text-muted-foreground">
                3 new matches
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>
              Track the status of your job applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-500 mb-4">Start applying to jobs to see your applications here</p>
                <Link href="/jobs">
                  <Button>Browse Jobs</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{application.job.title}</h3>
                      <p className="text-sm text-gray-500">{application.job.company.name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {application.job.location}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Applied {new Date(application.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {application.matchScore && (
                        <div className="text-center">
                          <div className="text-sm font-medium text-green-600">
                            {application.matchScore}% match
                          </div>
                        </div>
                      )}
                      <Badge className={getStatusColor(application.status)}>
                        {application.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <Link href="/dashboard/applications">
                    <Button variant="outline">View All Applications</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Recommendations</CardTitle>
              <CardDescription>
                Jobs that match your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Frontend Developer at TechCorp</span>
                  <Badge variant="secondary">95% match</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">React Developer at StartupXYZ</span>
                  <Badge variant="secondary">88% match</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Full Stack Engineer at BigTech</span>
                  <Badge variant="secondary">82% match</Badge>
                </div>
              </div>
              <Link href="/jobs/recommended">
                <Button className="w-full mt-4" variant="outline">
                  View All Recommendations
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
              <CardDescription>
                Complete your profile to get better job matches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Basic Information</span>
                  <Badge variant="secondary">Complete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Work Experience</span>
                  <Badge variant="outline">Incomplete</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Skills & Certifications</span>
                  <Badge variant="outline">Incomplete</Badge>
                </div>
              </div>
              <Link href="/profile">
                <Button className="w-full mt-4" variant="outline">
                  Complete Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}