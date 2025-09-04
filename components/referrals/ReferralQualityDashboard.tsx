'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  Star,
  Award,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  UserPlus,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Filter,
  Search,
  Download,
  Share,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Gift,
  Trophy,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Plus,
  X
} from 'lucide-react'
import { format, subDays, subMonths, isThisMonth, isThisWeek } from 'date-fns'

interface Referral {
  id: string
  referrerName: string
  referrerEmail: string
  referrerRole: string
  candidateName: string
  candidateEmail: string
  candidatePhone: string
  position: string
  department: string
  dateReferred: Date
  status: 'pending' | 'screening' | 'interviewing' | 'selected' | 'hired' | 'rejected'
  qualityScore: number
  stage: string
  feedback: string
  rewardAmount: number
  rewardPaid: boolean
  source: 'email' | 'linkedin' | 'internal_portal' | 'whatsapp' | 'direct'
  priority: 'high' | 'medium' | 'low'
}

interface ReferrerProfile {
  id: string
  name: string
  email: string
  role: string
  department: string
  joinDate: Date
  totalReferrals: number
  successfulReferrals: number
  successRate: number
  qualityScore: number
  totalRewardsEarned: number
  averageTimeToHire: number
  specializations: string[]
  status: 'active' | 'inactive'
}

interface QualityMetric {
  id: string
  name: string
  weight: number
  description: string
  criteria: Array<{
    range: string
    score: number
    description: string
  }>
}

const qualityMetrics: QualityMetric[] = [
  {
    id: 'relevance',
    name: 'Job Relevance',
    weight: 30,
    description: 'How well the candidate matches the job requirements',
    criteria: [
      { range: '90-100', score: 5, description: 'Perfect match for all key requirements' },
      { range: '70-89', score: 4, description: 'Strong match with minor gaps' },
      { range: '50-69', score: 3, description: 'Moderate match with some gaps' },
      { range: '30-49', score: 2, description: 'Weak match with significant gaps' },
      { range: '0-29', score: 1, description: 'Poor match, major misalignment' }
    ]
  },
  {
    id: 'experience',
    name: 'Experience Quality',
    weight: 25,
    description: 'Relevance and quality of work experience',
    criteria: [
      { range: '90-100', score: 5, description: 'Exceptional experience in relevant domain' },
      { range: '70-89', score: 4, description: 'Strong relevant experience' },
      { range: '50-69', score: 3, description: 'Adequate experience' },
      { range: '30-49', score: 2, description: 'Limited relevant experience' },
      { range: '0-29', score: 1, description: 'Minimal or no relevant experience' }
    ]
  },
  {
    id: 'cultural_fit',
    name: 'Cultural Fit',
    weight: 20,
    description: 'Alignment with company culture and values',
    criteria: [
      { range: '90-100', score: 5, description: 'Excellent cultural alignment' },
      { range: '70-89', score: 4, description: 'Good cultural fit' },
      { range: '50-69', score: 3, description: 'Moderate cultural fit' },
      { range: '30-49', score: 2, description: 'Questionable cultural fit' },
      { range: '0-29', score: 1, description: 'Poor cultural alignment' }
    ]
  },
  {
    id: 'availability',
    name: 'Availability',
    weight: 15,
    description: 'Candidate availability and notice period',
    criteria: [
      { range: 'Immediate', score: 5, description: 'Available immediately' },
      { range: '1-15 days', score: 4, description: 'Short notice period' },
      { range: '16-30 days', score: 3, description: 'Standard notice period' },
      { range: '31-60 days', score: 2, description: 'Long notice period' },
      { range: '60+ days', score: 1, description: 'Very long notice period' }
    ]
  },
  {
    id: 'motivation',
    name: 'Motivation Level',
    weight: 10,
    description: 'Candidate interest and motivation for the role',
    criteria: [
      { range: '90-100', score: 5, description: 'Highly motivated and engaged' },
      { range: '70-89', score: 4, description: 'Good motivation level' },
      { range: '50-69', score: 3, description: 'Moderate interest' },
      { range: '30-49', score: 2, description: 'Low motivation' },
      { range: '0-29', score: 1, description: 'Very low interest' }
    ]
  }
]

export default function ReferralQualityDashboard() {
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [referrers, setReferrers] = useState<ReferrerProfile[]>([])
  const [selectedTimeRange, setSelectedTimeRange] = useState('this-month')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [qualityFilter, setQualityFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadReferrals()
    loadReferrers()
  }, [selectedTimeRange])

  const loadReferrals = async () => {
    // Mock data - replace with actual API call
    const mockReferrals: Referral[] = [
      {
        id: '1',
        referrerName: 'John Smith',
        referrerEmail: 'john.smith@company.com',
        referrerRole: 'Senior Developer',
        candidateName: 'Alice Johnson',
        candidateEmail: 'alice.johnson@email.com',
        candidatePhone: '+1-555-0123',
        position: 'Frontend Developer',
        department: 'Engineering',
        dateReferred: subDays(new Date(), 5),
        status: 'interviewing',
        qualityScore: 85,
        stage: 'Technical Interview',
        feedback: 'Strong candidate with excellent React skills',
        rewardAmount: 5000,
        rewardPaid: false,
        source: 'linkedin',
        priority: 'high'
      },
      {
        id: '2',
        referrerName: 'Sarah Davis',
        referrerEmail: 'sarah.davis@company.com',
        referrerRole: 'Product Manager',
        candidateName: 'Michael Brown',
        candidateEmail: 'michael.brown@email.com',
        candidatePhone: '+1-555-0124',
        position: 'Backend Engineer',
        department: 'Engineering',
        dateReferred: subDays(new Date(), 12),
        status: 'hired',
        qualityScore: 92,
        stage: 'Completed',
        feedback: 'Exceptional candidate, perfect fit for the role',
        rewardAmount: 7500,
        rewardPaid: true,
        source: 'internal_portal',
        priority: 'high'
      },
      {
        id: '3',
        referrerName: 'David Wilson',
        referrerEmail: 'david.wilson@company.com',
        referrerRole: 'Designer',
        candidateName: 'Emma Wilson',
        candidateEmail: 'emma.wilson@email.com',
        candidatePhone: '+1-555-0125',
        position: 'UX Designer',
        department: 'Design',
        dateReferred: subDays(new Date(), 8),
        status: 'rejected',
        qualityScore: 45,
        stage: 'Initial Screening',
        feedback: 'Skills didn\'t match requirements',
        rewardAmount: 0,
        rewardPaid: false,
        source: 'email',
        priority: 'low'
      },
      {
        id: '4',
        referrerName: 'Lisa Anderson',
        referrerEmail: 'lisa.anderson@company.com',
        referrerRole: 'Engineering Manager',
        candidateName: 'Robert Taylor',
        candidateEmail: 'robert.taylor@email.com',
        candidatePhone: '+1-555-0126',
        position: 'DevOps Engineer',
        department: 'Engineering',
        dateReferred: subDays(new Date(), 3),
        status: 'screening',
        qualityScore: 78,
        stage: 'HR Screening',
        feedback: 'Good technical background, proceeding to next round',
        rewardAmount: 6000,
        rewardPaid: false,
        source: 'whatsapp',
        priority: 'medium'
      }
    ]
    setReferrals(mockReferrals)
  }

  const loadReferrers = async () => {
    // Mock data - replace with actual API call
    const mockReferrers: ReferrerProfile[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@company.com',
        role: 'Senior Developer',
        department: 'Engineering',
        joinDate: subMonths(new Date(), 18),
        totalReferrals: 12,
        successfulReferrals: 8,
        successRate: 66.7,
        qualityScore: 85,
        totalRewardsEarned: 45000,
        averageTimeToHire: 28,
        specializations: ['Frontend', 'React', 'JavaScript'],
        status: 'active'
      },
      {
        id: '2',
        name: 'Sarah Davis',
        email: 'sarah.davis@company.com',
        role: 'Product Manager',
        department: 'Product',
        joinDate: subMonths(new Date(), 24),
        totalReferrals: 15,
        successfulReferrals: 12,
        successRate: 80.0,
        qualityScore: 92,
        totalRewardsEarned: 67500,
        averageTimeToHire: 22,
        specializations: ['Product', 'Strategy', 'Analytics'],
        status: 'active'
      },
      {
        id: '3',
        name: 'David Wilson',
        email: 'david.wilson@company.com',
        role: 'Designer',
        department: 'Design',
        joinDate: subMonths(new Date(), 12),
        totalReferrals: 6,
        successfulReferrals: 3,
        successRate: 50.0,
        qualityScore: 68,
        totalRewardsEarned: 18000,
        averageTimeToHire: 35,
        specializations: ['UI/UX', 'Design Systems', 'Figma'],
        status: 'active'
      }
    ]
    setReferrers(mockReferrers)
  }

  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getStatusBadge = (status: Referral['status']) => {
    const statusConfig = {
      'pending': { color: 'bg-gray-500', text: 'Pending' },
      'screening': { color: 'bg-blue-500', text: 'Screening' },
      'interviewing': { color: 'bg-orange-500', text: 'Interviewing' },
      'selected': { color: 'bg-purple-500', text: 'Selected' },
      'hired': { color: 'bg-green-500', text: 'Hired' },
      'rejected': { color: 'bg-red-500', text: 'Rejected' }
    }

    const config = statusConfig[status]
    return (
      <Badge className={`${config.color} text-white text-xs`}>
        {config.text}
      </Badge>
    )
  }

  const filteredReferrals = referrals.filter(referral => {
    const matchesSearch = referral.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         referral.referrerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         referral.position.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || referral.status === statusFilter
    
    const matchesQuality = qualityFilter === 'all' ||
                          (qualityFilter === 'high' && referral.qualityScore >= 80) ||
                          (qualityFilter === 'medium' && referral.qualityScore >= 60 && referral.qualityScore < 80) ||
                          (qualityFilter === 'low' && referral.qualityScore < 60)

    return matchesSearch && matchesStatus && matchesQuality
  })

  const calculateStats = () => {
    const totalReferrals = referrals.length
    const successfulReferrals = referrals.filter(r => r.status === 'hired').length
    const pendingReferrals = referrals.filter(r => ['pending', 'screening', 'interviewing'].includes(r.status)).length
    const averageQualityScore = referrals.length > 0 
      ? Math.round(referrals.reduce((acc, r) => acc + r.qualityScore, 0) / referrals.length)
      : 0
    const totalRewards = referrals.filter(r => r.rewardPaid).reduce((acc, r) => acc + r.rewardAmount, 0)
    
    return {
      totalReferrals,
      successfulReferrals,
      pendingReferrals,
      successRate: totalReferrals > 0 ? Math.round((successfulReferrals / totalReferrals) * 100) : 0,
      averageQualityScore,
      totalRewards
    }
  }

  const stats = calculateStats()

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Referral Quality Dashboard</h1>
            <p className="text-sm text-gray-600">Track and analyze referral quality metrics</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
                <p className="text-xs text-gray-600">Total Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.successfulReferrals}</p>
                <p className="text-xs text-gray-600">Successful Hires</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingReferrals}</p>
                <p className="text-xs text-gray-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
                <p className="text-xs text-gray-600">Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.averageQualityScore}</p>
                <p className="text-xs text-gray-600">Avg Quality Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">₹{(stats.totalRewards / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-600">Rewards Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referrals List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Referral Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search referrals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="screening">Screening</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={qualityFilter} onValueChange={setQualityFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quality</SelectItem>
                    <SelectItem value="high">High (80+)</SelectItem>
                    <SelectItem value="medium">Medium (60-79)</SelectItem>
                    <SelectItem value="low">Low (&lt;60)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {filteredReferrals.map((referral) => (
                  <div key={referral.id} className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{referral.candidateName}</h3>
                          {getStatusBadge(referral.status)}
                          <Badge 
                            className={`text-xs px-2 py-1 rounded-full ${getQualityScoreColor(referral.qualityScore)}`}
                          >
                            {referral.qualityScore}/100
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Position:</strong> {referral.position}</p>
                            <p><strong>Referred by:</strong> {referral.referrerName}</p>
                          </div>
                          <div>
                            <p><strong>Stage:</strong> {referral.stage}</p>
                            <p><strong>Date:</strong> {format(referral.dateReferred, 'MMM dd, yyyy')}</p>
                          </div>
                        </div>

                        {referral.feedback && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                            <strong>Feedback:</strong> {referral.feedback}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {referral.rewardAmount > 0 && (
                          <Badge variant={referral.rewardPaid ? "default" : "outline"} className="text-xs">
                            ₹{referral.rewardAmount.toLocaleString()}
                            {referral.rewardPaid && <CheckCircle className="w-3 h-3 ml-1" />}
                          </Badge>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Quality Score Breakdown */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span>Quality Score Breakdown</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Source: {referral.source}</span>
                          <Badge variant="outline" className={`text-xs ${
                            referral.priority === 'high' ? 'border-red-300 text-red-700' :
                            referral.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                            'border-gray-300 text-gray-700'
                          }`}>
                            {referral.priority} priority
                          </Badge>
                        </div>
                      </div>
                      <Progress value={referral.qualityScore} className="h-2 mt-2" />
                    </div>
                  </div>
                ))}
              </div>

              {filteredReferrals.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="mx-auto h-12 w-12 mb-4" />
                  <p>No referrals match your current filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Referrers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span>Top Referrers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {referrers
                .sort((a, b) => b.qualityScore - a.qualityScore)
                .slice(0, 5)
                .map((referrer, index) => (
                <div key={referrer.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-xs">
                        {referrer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{referrer.name}</p>
                    <p className="text-xs text-gray-600">{referrer.role}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs font-medium">{referrer.qualityScore}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {referrer.successfulReferrals}/{referrer.totalReferrals} hires
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {index < 3 && (
                      <Badge className={`text-xs ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        'bg-orange-500'
                      } text-white`}>
                        #{index + 1}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quality Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Quality Metrics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {qualityMetrics.map((metric) => (
                <div key={metric.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <span className="text-xs text-gray-500">{metric.weight}%</span>
                  </div>
                  <div className="text-xs text-gray-600">{metric.description}</div>
                  <Progress value={Math.random() * 100} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {referrals
                .sort((a, b) => b.dateReferred.getTime() - a.dateReferred.getTime())
                .slice(0, 5)
                .map((referral) => (
                <div key={referral.id} className="flex items-start space-x-2 text-sm">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    referral.status === 'hired' ? 'bg-green-500' :
                    referral.status === 'rejected' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium">{referral.candidateName}</p>
                    <p className="text-xs text-gray-600">
                      {referral.status === 'hired' ? 'was hired for' :
                       referral.status === 'rejected' ? 'was rejected for' :
                       'applied for'} {referral.position}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(referral.dateReferred, 'MMM dd, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reward Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Gift className="w-5 h-5 text-green-600" />
                <span>Reward Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Rewards</span>
                <span className="font-semibold">₹{stats.totalRewards.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Rewards</span>
                <span className="font-semibold text-orange-600">
                  ₹{referrals
                    .filter(r => r.rewardAmount > 0 && !r.rewardPaid)
                    .reduce((acc, r) => acc + r.rewardAmount, 0)
                    .toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Reward</span>
                <span className="font-semibold">
                  ₹{Math.round(stats.totalRewards / Math.max(stats.successfulReferrals, 1)).toLocaleString()}
                </span>
              </div>
              
              <div className="pt-3 border-t">
                <div className="text-xs text-gray-600 mb-2">Reward Distribution</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>High Quality (80+)</span>
                    <span>₹7,500</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Medium Quality (60-79)</span>
                    <span>₹5,000</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Standard Quality</span>
                    <span>₹2,500</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
