"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LinkButton } from '@/components/ui/link-button'
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
      } else {
        console.error("Failed to fetch stats:", await statsRes.text())
        // Set default stats to prevent errors
        setStats({
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
          scheduledInterviews: 0,
          totalHires: 0,
          pendingApplications: 0
        })
      }

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json()
        setApplications(applicationsData.applications || [])
      } else {
        console.error("Failed to fetch applications:", await applicationsRes.text())
        // Set empty applications to prevent errors
        setApplications([])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Set default values to prevent component crashes
      setStats({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        scheduledInterviews: 0,
        totalHires: 0,
        pendingApplications: 0
      })
      setApplications([])
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
      <div className="space-y-8">
        {/* Modern Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-blue-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Hello, {session?.user?.name?.split(' ')[0]}! 🚀
                </h1>
                <p className="text-white/90 text-lg mb-6">
                  Ready to build your dream team? Let's find exceptional talent together.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/recruiter/jobs/post">
                    <Button className="bg-white text-emerald-600 hover:bg-white/90 font-medium">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Post New Job
                    </Button>
                  </Link>
                  <Link href="/recruiter/analytics">
                    <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-32 h-32 bg-white/10 rounded-full backdrop-blur-sm flex items-center justify-center">
                  <Users className="w-16 h-16 text-white/70" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-cyan-700">Total Jobs</CardTitle>
              <div className="p-2 bg-cyan-500 rounded-lg">
                <Briefcase className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-900 mb-1">{stats.totalJobs}</div>
              <p className="text-xs text-cyan-600 flex items-center">
                <Activity className="w-3 h-3 mr-1" />
                {stats.activeJobs} active
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-emerald-700">Applications</CardTitle>
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900 mb-1">{stats.totalApplications}</div>
              <p className="text-xs text-emerald-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stats.pendingApplications} pending review
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-purple-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-violet-700">Interviews</CardTitle>
              <div className="p-2 bg-violet-500 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-violet-900 mb-1">{stats.scheduledInterviews}</div>
              <p className="text-xs text-violet-600 flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
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
                          <LinkButton variant="outline" size="sm" href={`/recruiter/applications/${application.id}`}>
                            View
                          </LinkButton>
                          
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