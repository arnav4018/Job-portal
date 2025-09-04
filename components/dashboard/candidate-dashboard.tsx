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
  Users,
  Star
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
  appliedAt: Date
  matchScore: number | null
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
      } else {
        console.error("Failed to fetch stats:", await statsRes.text())
        // Set default stats to prevent errors
        setStats({
          appliedJobs: 0,
          savedJobs: 0,
          profileViews: 0,
          resumeDownloads: 0
        })
      }

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json()
        setRecentApplications(applicationsData)
      } else {
        console.error("Failed to fetch applications:", await applicationsRes.text())
        // Set empty applications to prevent errors
        setRecentApplications([])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Set default values to prevent component crashes
      setStats({
        appliedJobs: 0,
        savedJobs: 0,
        profileViews: 0,
        resumeDownloads: 0
      })
      setRecentApplications([])
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
      <div className="space-y-8">
        {/* Modern Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {session?.user?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-white/90 text-lg mb-6">
                  Your career journey continues here. Let's find your perfect match.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/jobs">
                    <Button className="bg-white text-indigo-600 hover:bg-white/90 font-medium">
                      <Search className="w-4 h-4 mr-2" />
                      Discover Jobs
                    </Button>
                  </Link>
                  <Link href="/resume-builder">
                    <Button variant="outline" className="border-white text-indigo-600 hover:bg-white/90 hover:text-indigo-600 transition-colors">
                      <FileText className="w-4 h-4 mr-2" />
                      Build Resume
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center">
                  <Briefcase className="w-16 h-16 text-white/70" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-blue-700">Applied Jobs</CardTitle>
              <div className="p-2 bg-blue-500 rounded-lg">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 mb-1">{stats.appliedJobs}</div>
              <p className="text-xs text-blue-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2 from last week
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-green-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-emerald-700">Profile Views</CardTitle>
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900 mb-1">{stats.profileViews}</div>
              <p className="text-xs text-emerald-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-purple-700">Resume Downloads</CardTitle>
              <div className="p-2 bg-purple-500 rounded-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 mb-1">{stats.resumeDownloads}</div>
              <p className="text-xs text-purple-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +5 this week
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-orange-700">Saved Jobs</CardTitle>
              <div className="p-2 bg-orange-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900 mb-1">{stats.savedJobs}</div>
              <p className="text-xs text-orange-600 flex items-center">
                <Star className="w-3 h-3 mr-1 fill-current" />
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
                          Applied {application.appliedAt.toLocaleDateString()}
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