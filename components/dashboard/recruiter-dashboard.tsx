"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  DollarSign,
  Plus,
  Eye,
  MessageSquare,
  Calendar
} from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface RecruiterStats {
  activeJobs: number
  totalApplications: number
  shortlistedCandidates: number
  hiredCandidates: number
}

export default function RecruiterDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<RecruiterStats>({
    activeJobs: 0,
    totalApplications: 0,
    shortlistedCandidates: 0,
    hiredCandidates: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard/recruiter/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
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
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-green-100 mb-4">
            Manage your job postings and find the perfect candidates.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/jobs/post">
              <Button variant="secondary" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            </Link>
            <Link href="/dashboard/candidates">
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-green-600">
                <Users className="w-4 h-4 mr-2" />
                Browse Candidates
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                +15% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.shortlistedCandidates}</div>
              <p className="text-xs text-muted-foreground">
                8 pending review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hired</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.hiredCandidates}</div>
              <p className="text-xs text-muted-foreground">
                +3 this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
                Latest candidates who applied to your jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Alice Developer</div>
                    <div className="text-sm text-gray-500">Senior Full Stack Developer</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">95% match</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Bob Designer</div>
                    <div className="text-sm text-gray-500">UI/UX Designer</div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">88% match</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Carol Manager</div>
                    <div className="text-sm text-gray-500">Product Manager</div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">82% match</Badge>
                </div>
              </div>
              <Link href="/dashboard/candidates">
                <Button className="w-full mt-4" variant="outline">
                  View All Applications
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Performance</CardTitle>
              <CardDescription>
                Your top performing job postings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Senior Full Stack Developer</div>
                    <div className="text-sm text-gray-500">45 applications</div>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="text-sm">1.2k views</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">UI/UX Designer</div>
                    <div className="text-sm text-gray-500">32 applications</div>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="text-sm">890 views</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Product Manager</div>
                    <div className="text-sm text-gray-500">28 applications</div>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="text-sm">756 views</span>
                  </div>
                </div>
              </div>
              <Link href="/dashboard/jobs">
                <Button className="w-full mt-4" variant="outline">
                  View All Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
            <CardDescription>
              Scheduled interviews with candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Alice Developer</div>
                    <div className="text-sm text-gray-500">Senior Full Stack Developer</div>
                    <div className="text-sm text-gray-500">Tomorrow, 2:00 PM</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                  <Button size="sm">Join Call</Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Bob Designer</div>
                    <div className="text-sm text-gray-500">UI/UX Designer</div>
                    <div className="text-sm text-gray-500">Friday, 10:00 AM</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                  <Button size="sm">Join Call</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}