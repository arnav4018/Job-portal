"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { 
  Users, 
  Briefcase, 
  Building2, 
  TrendingUp, 
  Activity,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Download,
  Settings,
  MessageSquare,
  Calendar,
  Brain,
  UserCheck,
  Flag,
  CreditCard
} from "lucide-react"
import DashboardLayout from "@/components/layout/dashboard-layout"

interface AdminStats {
  totalUsers: number
  totalJobs: number
  totalCompanies: number
  totalApplications: number
  activeJobs: number
  pendingApprovals: number
  totalInterviews: number
  totalExperts: number
  totalCommissions: number
  flaggedDropouts: number
  totalQuizzes: number
  totalConsultingSessions: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  timestamp: string
  user: string
}

interface FeatureFlags {
  paymentsEnabled: boolean
  commissionsEnabled: boolean
  expertConsultingEnabled: boolean
  interviewSchedulingEnabled: boolean
  quizSystemEnabled: boolean
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalJobs: 0,
    totalCompanies: 0,
    totalApplications: 0,
    activeJobs: 0,
    pendingApprovals: 0,
    totalInterviews: 0,
    totalExperts: 0,
    totalCommissions: 0,
    flaggedDropouts: 0,
    totalQuizzes: 0,
    totalConsultingSessions: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>({
    paymentsEnabled: false,
    commissionsEnabled: false,
    expertConsultingEnabled: false,
    interviewSchedulingEnabled: false,
    quizSystemEnabled: false
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes, flagsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/activity"),
        fetch("/api/admin/feature-flags")
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setRecentActivity(activityData)
      }

      if (flagsRes.ok) {
        const flagsData = await flagsRes.json()
        setFeatureFlags(flagsData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFeatureFlag = async (key: keyof FeatureFlags) => {
    try {
      const response = await fetch("/api/admin/feature-flags", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          enabled: !featureFlags[key],
        }),
      })

      if (response.ok) {
        setFeatureFlags(prev => ({
          ...prev,
          [key]: !prev[key]
        }))
      }
    } catch (error) {
      console.error("Error toggling feature flag:", error)
    }
  }

  const exportData = async (type: string) => {
    try {
      const response = await fetch(`/api/admin/export/${type}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting data:", error)
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
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-purple-100 mb-4">
            Manage and monitor the entire job portal platform with advanced features.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/users">
              <Button variant="secondary" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/jobs">
              <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-purple-600">
                <Briefcase className="w-4 h-4 mr-2" />
                Manage Jobs
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-white border-white hover:bg-white hover:text-purple-600"
              onClick={() => exportData('users')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
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
                    {stats.activeJobs} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Applications</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalApplications}</div>
                  <p className="text-xs text-muted-foreground">
                    +18% from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Interviews</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalInterviews}</div>
                  <p className="text-xs text-muted-foreground">
                    Scheduled & completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Experts</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalExperts}</div>
                  <p className="text-xs text-muted-foreground">
                    Available for consulting
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Commissions</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.totalCommissions}</div>
                  <p className="text-xs text-muted-foreground">
                    Total earned
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Flagged Dropouts</CardTitle>
                  <Flag className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.flaggedDropouts}</div>
                  <p className="text-xs text-muted-foreground">
                    Require attention
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quiz Attempts</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                  <p className="text-xs text-muted-foreground">
                    Interview prep
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest platform activities and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.length === 0 ? (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No recent activity</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                            <div>
                              <p className="text-sm">{activity.description}</p>
                              <p className="text-xs text-gray-500">{activity.user} • {activity.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common administrative tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Link href="/admin/users">
                      <Button className="w-full justify-start" variant="outline">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Users
                      </Button>
                    </Link>
                    <Link href="/admin/interviews">
                      <Button className="w-full justify-start" variant="outline">
                        <Calendar className="w-4 h-4 mr-2" />
                        Interview Management
                      </Button>
                    </Link>
                    <Link href="/admin/experts">
                      <Button className="w-full justify-start" variant="outline">
                        <UserCheck className="w-4 h-4 mr-2" />
                        Expert Community
                      </Button>
                    </Link>
                    <Link href="/admin/commissions">
                      <Button className="w-full justify-start" variant="outline">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Commission Tracking
                      </Button>
                    </Link>
                    <Link href="/admin/dropouts">
                      <Button className="w-full justify-start" variant="outline">
                        <Flag className="w-4 h-4 mr-2" />
                        Flagged Dropouts
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Feature Management</CardTitle>
                <CardDescription>
                  Enable or disable platform features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="payments">Payment System</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable Razorpay/Stripe payments for job features and subscriptions
                    </p>
                  </div>
                  <Switch
                    id="payments"
                    checked={featureFlags.paymentsEnabled}
                    onCheckedChange={() => toggleFeatureFlag('paymentsEnabled')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="commissions">Commission System</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable commission-based payments for companies
                    </p>
                  </div>
                  <Switch
                    id="commissions"
                    checked={featureFlags.commissionsEnabled}
                    onCheckedChange={() => toggleFeatureFlag('commissionsEnabled')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="consulting">Expert Consulting</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable expert consulting and career guidance features
                    </p>
                  </div>
                  <Switch
                    id="consulting"
                    checked={featureFlags.expertConsultingEnabled}
                    onCheckedChange={() => toggleFeatureFlag('expertConsultingEnabled')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="interviews">Interview Scheduling</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable automated interview scheduling and confirmation emails
                    </p>
                  </div>
                  <Switch
                    id="interviews"
                    checked={featureFlags.interviewSchedulingEnabled}
                    onCheckedChange={() => toggleFeatureFlag('interviewSchedulingEnabled')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="quizzes">Quiz System</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable AI-powered interview preparation quizzes
                    </p>
                  </div>
                  <Switch
                    id="quizzes"
                    checked={featureFlags.quizSystemEnabled}
                    onCheckedChange={() => toggleFeatureFlag('quizSystemEnabled')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Export</CardTitle>
                  <CardDescription>
                    Download platform data for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => exportData('users')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Users Data
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => exportData('applications')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Applications Data
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => exportData('jobs')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Jobs Data
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => exportData('interviews')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Interviews Data
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>
                    Monitor platform performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Status</span>
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Healthy
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Email Service</span>
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Payment Gateway</span>
                      <Badge variant={featureFlags.paymentsEnabled ? "default" : "secondary"} 
                             className={featureFlags.paymentsEnabled ? "bg-green-500" : ""}>
                        {featureFlags.paymentsEnabled ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </>
                        ) : (
                          "Disabled"
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure platform-wide settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Advanced system settings will be available here. This includes email templates, 
                    payment configurations, and integration settings.
                  </p>
                  <div className="flex gap-3">
                    <Link href="/admin/email-templates">
                      <Button variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Email Templates
                      </Button>
                    </Link>
                    <Link href="/admin/integrations">
                      <Button variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Integrations
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
