"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { 
  Users, 
  Briefcase, 
  Calendar,
  TrendingUp, 
  Activity,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Mail,
  Phone,
  Star,
  Flag,
  AlertTriangle
} from "lucide-react"
import { getInitials, formatCurrency, getRelativeTime } from "@/lib/utils"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface RecruiterStats {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  scheduledInterviews: number
  totalHires: number
  pendingApplications: number
}

interface Application {
  id: string
  status: string
  matchScore: number | null
  appliedAt: Date
  droppedOut: boolean
  flaggedForDropout: boolean
  job: {
    id: string
    title: string
    type: string
    location: string
  }
  candidate: {
    id: string
    name: string
    email: string
    image?: string
    dropoutCount: number
    flaggedAsDropout: boolean
    profile?: {
      experience?: number
      skills?: string
    }
  }
  interviews: Array<{
    id: string
    scheduledAt: string
    status: string
    type: string
  }>
}

export default function RecruiterDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<RecruiterStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    scheduledInterviews: 0,
    totalHires: 0,
    pendingApplications: 0
  })
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("appliedAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    filterAndSortApplications()
  }, [applications, searchTerm, statusFilter, sortBy, sortOrder])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, applicationsRes] = await Promise.all([
        fetch("/api/recruiter/stats"),
        fetch("/api/applications?limit=50")
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json()
        setApplications(applicationsData.applications)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterAndSortApplications = () => {
    let filtered = applications.filter(app => {
      const matchesSearch = 
        app.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || app.status === statusFilter
      
      return matchesSearch && matchesStatus
    })

    // Sort applications
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case "matchScore":
          aValue = a.matchScore || 0
          bValue = b.matchScore || 0
          break
        case "appliedAt":
          aValue = new Date(a.appliedAt).getTime()
          bValue = new Date(b.appliedAt).getTime()
          break
        case "candidateName":
          aValue = a.candidate.name.toLowerCase()
          bValue = b.candidate.name.toLowerCase()
          break
        case "experience":
          aValue = a.candidate.profile?.experience || 0
          bValue = b.candidate.profile?.experience || 0
          break
        default:
          aValue = a.appliedAt
          bValue = b.appliedAt
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredApplications(filtered)
  }

  const sendInterviewConfirmation = async (interviewId: string, type: 'confirmation' | 'reminder') => {
    try {
      const response = await fetch(`/api/interviews/${interviewId}/confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      })

      if (response.ok) {
        // Show success message
        console.log(`Interview ${type} sent successfully`)
      }
    } catch (error) {
      console.error(`Failed to send interview ${type}:`, error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED': return 'bg-blue-100 text-blue-800'
      case 'SHORTLISTED': return 'bg-yellow-100 text-yellow-800'
      case 'INTERVIEW_SCHEDULED': return 'bg-purple-100 text-purple-800'
      case 'INTERVIEW_COMPLETED': return 'bg-indigo-100 text-indigo-800'
      case 'HIRED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'DROPPED_OUT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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
            Manage your job postings and track candidate applications with advanced filtering.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/recruiter/jobs/new">
              <Button variant="secondary" size="sm">
                <Briefcase className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            </Link>
            <Link href="/recruiter/interviews">
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-green-600">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Interview
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                {stats.pendingApplications} pending review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduledInterviews}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Applications Management */}
        <Card>
          <CardHeader>
            <CardTitle>Applications Management</CardTitle>
            <CardDescription>
              Advanced filtering and sorting for candidate applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search candidates, jobs, or emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="APPLIED">Applied</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
                  <option value="INTERVIEW_COMPLETED">Interview Completed</option>
                  <option value="HIRED">Hired</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="DROPPED_OUT">Dropped Out</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="appliedAt">Applied Date</option>
                  <option value="matchScore">Match Score</option>
                  <option value="candidateName">Candidate Name</option>
                  <option value="experience">Experience</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
              {filteredApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No applications found</p>
                </div>
              ) : (
                filteredApplications.map((application) => (
                  <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage src={application.candidate.image} />
                          <AvatarFallback>
                            {getInitials(application.candidate.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">{application.candidate.name}</h3>
                            {application.candidate.flaggedAsDropout && (
                              <Flag className="h-4 w-4 text-red-500" />
                            )}
                            {application.droppedOut && (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-1">{application.candidate.email}</p>
                          <p className="text-sm text-gray-600 mb-2">
                            Applied for: <span className="font-medium">{application.job.title}</span>
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Applied {getRelativeTime(application.appliedAt)}</span>
                            {application.candidate.profile?.experience && (
                              <span>{application.candidate.profile.experience} years exp</span>
                            )}
                            {application.candidate.dropoutCount > 0 && (
                              <span className="text-orange-600">
                                {application.candidate.dropoutCount} dropouts
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {application.matchScore && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              {Math.round(application.matchScore)}%
                            </div>
                            <div className="text-xs text-gray-500">Match</div>
                          </div>
                        )}
                        
                        <Badge className={getStatusColor(application.status)}>
                          {application.status.replace('_', ' ')}
                        </Badge>
                        
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/recruiter/applications/${application.id}`}>
                              View
                            </Link>
                          </Button>
                          
                          {application.interviews.length > 0 && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => sendInterviewConfirmation(application.interviews[0].id, 'confirmation')}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}