'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Briefcase, 
  Building, 
  TrendingUp,
  Settings,
  Shield,
  Activity,
  Calendar
} from 'lucide-react'
import Link from 'next/link'
import DashboardLayout from '@/components/layout/dashboard-layout'

interface AdminStats {
  totalUsers: number
  totalJobs: number
  totalApplications: number
  totalCompanies: number
}

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: Date
  profile: {
    firstName?: string | null
    lastName?: string | null
  } | null
}

interface Job {
  id: string
  title: string
  status: string
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
  job: {
    title: string
    company: {
      name: string
    }
  }
  candidate: {
    name: string | null
    email: string
  }
}

interface AdminDashboardContentProps {
  stats: AdminStats
  recentUsers: User[]
  recentJobs: Job[]
  recentApplications: Application[]
}

export default function AdminDashboardContent({ 
  stats, 
  recentUsers, 
  recentJobs, 
  recentApplications 
}: AdminDashboardContentProps) {
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'RECRUITER': return 'bg-blue-100 text-blue-800'
      case 'CANDIDATE': return 'bg-green-100 text-green-800'
      case 'EXPERT': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-red-100 text-red-800'
      case 'applied': return 'bg-blue-100 text-blue-800'
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
        <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-red-100 mb-4">
            Monitor platform activity and manage system settings.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/users">
              <Button variant="secondary" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-red-600">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                Job postings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Applications</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                Total applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">
                Registered companies
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>
                Latest user registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {user.profile?.firstName} {user.profile?.lastName} 
                        {!user.profile?.firstName && user.name}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.toLowerCase()}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full mt-4">
                  View All Users
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>
                Latest job postings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{job.title}</p>
                        <p className="text-sm text-gray-500">{job.company.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {job._count.applications} applications
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(job.status)}>
                          {formatStatus(job.status)}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/admin/jobs">
                <Button variant="outline" className="w-full mt-4">
                  View All Jobs
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
                Latest job applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">
                          {application.candidate.name || application.candidate.email}
                        </p>
                        <p className="text-sm text-gray-500">{application.job.title}</p>
                        <p className="text-xs text-gray-500">{application.job.company.name}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(application.status)}>
                          {formatStatus(application.status)}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/admin/applications">
                <Button variant="outline" className="w-full mt-4">
                  View All Applications
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/users">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/jobs">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <Briefcase className="h-6 w-6 mb-2" />
                  Manage Jobs
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <Settings className="h-6 w-6 mb-2" />
                  System Settings
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" className="w-full h-20 flex flex-col">
                  <Activity className="h-6 w-6 mb-2" />
                  Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}