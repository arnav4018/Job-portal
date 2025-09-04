'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  DollarSign,
  Target,
  Award,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Share,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserPlus,
  UserCheck,
  UserX,
  Briefcase,
  MapPin,
  Star,
  Zap,
  PieChart,
  LineChart,
  Activity,
  Layers,
  Building2,
  Globe,
  Mail,
  Phone
} from 'lucide-react'
import { format, subDays, subMonths, startOfMonth, endOfMonth, isThisMonth } from 'date-fns'

interface AnalyticsData {
  hiring: {
    totalPositions: number
    activePositions: number
    filledPositions: number
    avgTimeToHire: number
    avgCostPerHire: number
    fillRate: number
    sourceEffectiveness: Array<{
      source: string
      applications: number
      hires: number
      conversionRate: number
      cost: number
    }>
  }
  candidates: {
    totalCandidates: number
    newCandidates: number
    qualifiedCandidates: number
    interviewsScheduled: number
    offersMade: number
    hiresCompleted: number
    rejectionRate: number
    dropoutRate: number
    satisfactionScore: number
  }
  pipeline: {
    stages: Array<{
      name: string
      count: number
      conversionRate: number
      avgDays: number
    }>
  }
  performance: {
    recruiters: Array<{
      id: string
      name: string
      positionsManaged: number
      hires: number
      avgTimeToHire: number
      performance: number
    }>
    departments: Array<{
      name: string
      openPositions: number
      hired: number
      avgSalary: number
      satisfaction: number
    }>
  }
  trends: {
    hiringVolume: Array<{
      month: string
      hires: number
      applications: number
    }>
    skillDemand: Array<{
      skill: string
      demand: number
      supply: number
      trend: 'up' | 'down' | 'stable'
    }>
  }
  diversity: {
    gender: { male: number; female: number; other: number }
    ageGroups: { '18-25': number; '26-35': number; '36-45': number; '45+': number }
    experience: { junior: number; mid: number; senior: number; lead: number }
    education: { undergraduate: number; graduate: number; postgraduate: number; phd: number }
  }
}

const mockAnalyticsData: AnalyticsData = {
  hiring: {
    totalPositions: 145,
    activePositions: 38,
    filledPositions: 82,
    avgTimeToHire: 28,
    avgCostPerHire: 75000,
    fillRate: 68.5,
    sourceEffectiveness: [
      { source: 'Job Portals', applications: 1250, hires: 45, conversionRate: 3.6, cost: 125000 },
      { source: 'Employee Referrals', applications: 380, hires: 32, conversionRate: 8.4, cost: 95000 },
      { source: 'LinkedIn', applications: 890, hires: 28, conversionRate: 3.1, cost: 180000 },
      { source: 'Campus Hiring', applications: 650, hires: 22, conversionRate: 3.4, cost: 85000 },
      { source: 'Direct Applications', applications: 420, hires: 18, conversionRate: 4.3, cost: 45000 }
    ]
  },
  candidates: {
    totalCandidates: 3590,
    newCandidates: 285,
    qualifiedCandidates: 892,
    interviewsScheduled: 156,
    offersMade: 89,
    hiresCompleted: 67,
    rejectionRate: 78.2,
    dropoutRate: 12.5,
    satisfactionScore: 4.2
  },
  pipeline: {
    stages: [
      { name: 'Application Received', count: 1250, conversionRate: 100, avgDays: 1 },
      { name: 'Initial Screening', count: 892, conversionRate: 71.4, avgDays: 3 },
      { name: 'Technical Assessment', count: 445, conversionRate: 35.6, avgDays: 5 },
      { name: 'Interview Round 1', count: 234, conversionRate: 18.7, avgDays: 7 },
      { name: 'Interview Round 2', count: 156, conversionRate: 12.5, avgDays: 5 },
      { name: 'Final Interview', count: 89, conversionRate: 7.1, avgDays: 6 },
      { name: 'Offer Extended', count: 67, conversionRate: 5.4, avgDays: 2 },
      { name: 'Hired', count: 52, conversionRate: 4.2, avgDays: 3 }
    ]
  },
  performance: {
    recruiters: [
      { id: '1', name: 'Sarah Johnson', positionsManaged: 12, hires: 8, avgTimeToHire: 24, performance: 92 },
      { id: '2', name: 'Michael Chen', positionsManaged: 15, hires: 11, avgTimeToHire: 32, performance: 88 },
      { id: '3', name: 'Emily Davis', positionsManaged: 10, hires: 6, avgTimeToHire: 28, performance: 85 },
      { id: '4', name: 'David Wilson', positionsManaged: 8, hires: 5, avgTimeToHire: 35, performance: 82 }
    ],
    departments: [
      { name: 'Engineering', openPositions: 18, hired: 35, avgSalary: 1250000, satisfaction: 4.3 },
      { name: 'Product', openPositions: 8, hired: 12, avgSalary: 1100000, satisfaction: 4.1 },
      { name: 'Design', openPositions: 5, hired: 8, avgSalary: 950000, satisfaction: 4.0 },
      { name: 'Marketing', openPositions: 4, hired: 6, avgSalary: 800000, satisfaction: 3.8 },
      { name: 'Sales', openPositions: 3, hired: 9, avgSalary: 900000, satisfaction: 4.2 }
    ]
  },
  trends: {
    hiringVolume: [
      { month: 'Jan', hires: 15, applications: 420 },
      { month: 'Feb', hires: 12, applications: 380 },
      { month: 'Mar', hires: 18, applications: 520 },
      { month: 'Apr', hires: 22, applications: 680 },
      { month: 'May', hires: 19, applications: 590 },
      { month: 'Jun', hires: 25, applications: 750 }
    ],
    skillDemand: [
      { skill: 'React.js', demand: 85, supply: 45, trend: 'up' },
      { skill: 'Python', demand: 92, supply: 68, trend: 'up' },
      { skill: 'Node.js', demand: 78, supply: 52, trend: 'stable' },
      { skill: 'AWS', demand: 88, supply: 38, trend: 'up' },
      { skill: 'Product Management', demand: 65, supply: 35, trend: 'down' }
    ]
  },
  diversity: {
    gender: { male: 58, female: 40, other: 2 },
    ageGroups: { '18-25': 25, '26-35': 45, '36-45': 25, '45+': 5 },
    experience: { junior: 30, mid: 40, senior: 25, lead: 5 },
    education: { undergraduate: 35, graduate: 45, postgraduate: 18, phd: 2 }
  }
}

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(mockAnalyticsData)
  const [selectedTimeRange, setSelectedTimeRange] = useState('last-6-months')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadAnalytics()
  }, [selectedTimeRange, selectedDepartment])

  const loadAnalytics = async () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const renderHiringMetrics = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.hiring.activePositions}</p>
                <p className="text-xs text-gray-600">Active Positions</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% vs last month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.hiring.filledPositions}</p>
                <p className="text-xs text-gray-600">Positions Filled</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {analyticsData.hiring.fillRate}% fill rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.hiring.avgTimeToHire}</p>
                <p className="text-xs text-gray-600">Avg Time to Hire (days)</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  +3 days vs target
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">₹{(analyticsData.hiring.avgCostPerHire / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-600">Avg Cost per Hire</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -8% vs last quarter
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Effectiveness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Source Effectiveness</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.hiring.sourceEffectiveness.map((source, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{source.source}</h4>
                    <Badge className="bg-blue-100 text-blue-800">
                      {source.conversionRate.toFixed(1)}% conversion
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">{source.applications}</span> applications
                    </div>
                    <div>
                      <span className="font-medium">{source.hires}</span> hires
                    </div>
                    <div>
                      <span className="font-medium">₹{(source.cost / 1000).toFixed(0)}K</span> cost
                    </div>
                  </div>
                  <Progress value={source.conversionRate * 10} className="h-2 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCandidateAnalytics = () => (
    <div className="space-y-6">
      {/* Candidate Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Candidate Pipeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.pipeline.stages.map((stage, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{stage.name}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {stage.count} candidates
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {stage.conversionRate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={stage.conversionRate} className="flex-1 h-2" />
                      <span className="text-xs text-gray-500">{stage.avgDays}d avg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Candidate Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{analyticsData.candidates.totalCandidates}</p>
                <p className="text-xs text-gray-600">Total Candidates</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{analyticsData.candidates.newCandidates}</p>
                <p className="text-xs text-gray-600">New This Month</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Qualified Candidates</span>
                <span className="font-medium">{analyticsData.candidates.qualifiedCandidates}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Interviews Scheduled</span>
                <span className="font-medium">{analyticsData.candidates.interviewsScheduled}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Offers Made</span>
                <span className="font-medium">{analyticsData.candidates.offersMade}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Hires Completed</span>
                <span className="font-medium text-green-600">{analyticsData.candidates.hiresCompleted}</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Candidate Satisfaction</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{analyticsData.candidates.satisfactionScore.toFixed(1)}/5</span>
                </div>
              </div>
              <Progress value={analyticsData.candidates.satisfactionScore * 20} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Demand Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Skill Demand vs Supply</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.trends.skillDemand.map((skill, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{skill.skill}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge className={`text-xs ${
                        skill.trend === 'up' ? 'bg-green-100 text-green-800' :
                        skill.trend === 'down' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {skill.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> :
                         skill.trend === 'down' ? <TrendingDown className="w-3 h-3 mr-1" /> :
                         <Activity className="w-3 h-3 mr-1" />}
                        {skill.trend}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Demand</span>
                        <span>{skill.demand}%</span>
                      </div>
                      <Progress value={skill.demand} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Supply</span>
                        <span>{skill.supply}%</span>
                      </div>
                      <Progress value={skill.supply} className="h-2 bg-green-100" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPerformanceMetrics = () => (
    <div className="space-y-6">
      {/* Recruiter Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Recruiter Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.performance.recruiters.map((recruiter, index) => (
              <div key={recruiter.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{recruiter.name.charAt(0)}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{recruiter.name}</h4>
                    <Badge className={`text-xs ${
                      recruiter.performance >= 90 ? 'bg-green-100 text-green-800' :
                      recruiter.performance >= 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {recruiter.performance}% performance
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">{recruiter.positionsManaged}</span> positions managed
                    </div>
                    <div>
                      <span className="font-medium">{recruiter.hires}</span> successful hires
                    </div>
                    <div>
                      <span className="font-medium">{recruiter.avgTimeToHire}</span> days avg time
                    </div>
                  </div>
                  <Progress value={recruiter.performance} className="h-2 mt-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Department Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.performance.departments.map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{dept.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-2">
                    <div>
                      <span className="font-medium">{dept.openPositions}</span> open positions
                    </div>
                    <div>
                      <span className="font-medium">{dept.hired}</span> hires completed
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{(dept.avgSalary / 100000).toFixed(1)}L avg</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">{dept.satisfaction.toFixed(1)}/5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderDiversityMetrics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Gender Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Male</span>
                <div className="flex items-center space-x-2">
                  <Progress value={analyticsData.diversity.gender.male} className="w-32 h-2" />
                  <span className="text-sm font-medium">{analyticsData.diversity.gender.male}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Female</span>
                <div className="flex items-center space-x-2">
                  <Progress value={analyticsData.diversity.gender.female} className="w-32 h-2" />
                  <span className="text-sm font-medium">{analyticsData.diversity.gender.female}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Other</span>
                <div className="flex items-center space-x-2">
                  <Progress value={analyticsData.diversity.gender.other} className="w-32 h-2" />
                  <span className="text-sm font-medium">{analyticsData.diversity.gender.other}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Age Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analyticsData.diversity.ageGroups).map(([age, percentage]) => (
                <div key={age} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{age} years</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={percentage} className="w-32 h-2" />
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Experience Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5" />
              <span>Experience Level</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analyticsData.diversity.experience).map(([level, percentage]) => (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{level}</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={percentage} className="w-32 h-2" />
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Education Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Education Level</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analyticsData.diversity.education).map(([edu, percentage]) => (
                <div key={edu} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">{edu}</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={percentage} className="w-32 h-2" />
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h1>
            <p className="text-sm text-gray-600">Comprehensive hiring metrics and performance insights</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={loadAnalytics} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.candidates.newCandidates}</p>
                <p className="text-xs text-gray-600">New Candidates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.candidates.hiresCompleted}</p>
                <p className="text-xs text-gray-600">Hires Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.hiring.avgTimeToHire}</p>
                <p className="text-xs text-gray-600">Avg Time to Hire</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.hiring.fillRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-600">Fill Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{analyticsData.candidates.satisfactionScore.toFixed(1)}</p>
                <p className="text-xs text-gray-600">Satisfaction Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="hiring" className="w-full">
            <div className="border-b">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="hiring" className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="hidden sm:inline">Hiring Metrics</span>
                </TabsTrigger>
                <TabsTrigger value="candidates" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Candidates</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span className="hidden sm:inline">Performance</span>
                </TabsTrigger>
                <TabsTrigger value="diversity" className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">Diversity</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="hiring" className="mt-0">
                {renderHiringMetrics()}
              </TabsContent>
              
              <TabsContent value="candidates" className="mt-0">
                {renderCandidateAnalytics()}
              </TabsContent>
              
              <TabsContent value="performance" className="mt-0">
                {renderPerformanceMetrics()}
              </TabsContent>
              
              <TabsContent value="diversity" className="mt-0">
                {renderDiversityMetrics()}
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Hiring Volume Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LineChart className="w-5 h-5" />
            <span>Hiring Volume Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4">
            {analyticsData.trends.hiringVolume.map((item, index) => (
              <div key={index} className="text-center">
                <div className="mb-2">
                  <div 
                    className="bg-blue-600 mx-auto rounded-t"
                    style={{ 
                      width: '20px',
                      height: `${(item.hires / 25) * 100}px`,
                      minHeight: '20px'
                    }}
                  ></div>
                  <div 
                    className="bg-blue-200 mx-auto rounded-b"
                    style={{ 
                      width: '20px',
                      height: `${((item.applications - item.hires) / 750) * 50}px`,
                      minHeight: '10px'
                    }}
                  ></div>
                </div>
                <p className="text-sm font-medium">{item.month}</p>
                <p className="text-xs text-gray-600">{item.hires} hires</p>
                <p className="text-xs text-gray-500">{item.applications} apps</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
