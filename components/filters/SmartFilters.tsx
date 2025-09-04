'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Filter, 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Briefcase, 
  Users, 
  Star, 
  TrendingUp,
  Target,
  Zap,
  Save,
  Eye,
  BarChart3
} from 'lucide-react'

export interface FilterOption {
  id: string
  label: string
  value: string
  count?: number
}

export interface FilterPreset {
  id: string
  name: string
  description: string
  filters: Record<string, any>
  isDefault?: boolean
}

export interface FilterInsight {
  jobs?: any[]
  candidates?: any[]
  insights?: {
    totalJobs?: number
    totalCandidates?: number
    averageSalary?: number
    averageExperience?: number
    averageExpectedCTC?: number
    remoteJobs?: number
    urgentJobs?: number
    immediateJoiners?: number
    willingToRelocate?: number
    topReasons?: { reason: string; count: number }[]
  }
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

type FilterResult = FilterInsight

const smartJobFilters = [
  { id: 'high-paying', label: 'High-Paying Jobs', icon: DollarSign, color: 'bg-green-500', description: '8+ LPA jobs' },
  { id: 'urgent', label: 'Urgent Hiring', icon: Zap, color: 'bg-red-500', description: 'Immediate openings' },
  { id: 'remote', label: 'Remote Jobs', icon: MapPin, color: 'bg-blue-500', description: 'Work from anywhere' },
  { id: 'no-travel', label: 'No Travel Required', icon: MapPin, color: 'bg-purple-500', description: 'Location-based roles' },
  { id: 'flexible-timing', label: 'Flexible Timings', icon: Clock, color: 'bg-orange-500', description: 'Flexible work hours' },
  { id: 'featured', label: 'Featured Jobs', icon: Star, color: 'bg-yellow-500', description: 'Premium listings' },
]

const smartCandidateFilters = [
  { id: 'cost-effective', label: 'Cost-Effective', icon: DollarSign, color: 'bg-green-500', description: '≤6 LPA expectation' },
  { id: 'experienced', label: 'Experienced', icon: Briefcase, color: 'bg-blue-500', description: '5+ years experience' },
  { id: 'highly-skilled', label: 'Highly Skilled', icon: Star, color: 'bg-purple-500', description: '80%+ profile complete' },
  { id: 'early-joiners', label: 'Early Joiners', icon: Clock, color: 'bg-orange-500', description: '≤30 days notice' },
  { id: 'immediate-joiners', label: 'Immediate Joiners', icon: Zap, color: 'bg-red-500', description: '≤15 days notice' },
  { id: 'willing-to-relocate', label: 'Willing to Relocate', icon: MapPin, color: 'bg-cyan-500', description: 'Open to relocation' },
  { id: 'buyout-candidates', label: 'Buyout Available', icon: TrendingUp, color: 'bg-pink-500', description: 'Can be bought out' },
  { id: 'leadership', label: 'Leadership Experience', icon: Users, color: 'bg-indigo-500', description: 'Has reportees' },
]

export default function SmartFilters() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates'>('jobs')
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [location, setLocation] = useState('')
  const [results, setResults] = useState<FilterResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [savedFilters, setSavedFilters] = useState<any[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [filterName, setFilterName] = useState('')

  const currentFilters = activeTab === 'jobs' ? smartJobFilters : smartCandidateFilters

  const applyFilter = async (filterId: string) => {
    setIsLoading(true)
    setSelectedFilter(filterId)

    try {
      const response = await fetch(`/api/filters/smart?type=${activeTab}&filter=${filterId}&location=${location}&page=1&limit=20`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Filter error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveCurrentFilter = async () => {
    if (!filterName || !selectedFilter) return

    try {
      const response = await fetch('/api/filters/smart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: filterName,
          type: activeTab === 'jobs' ? 'JOB_FILTER' : 'CANDIDATE_FILTER',
          filters: { filter: selectedFilter, location }
        })
      })

      if (response.ok) {
        setShowSaveDialog(false)
        setFilterName('')
        // Refresh saved filters
        loadSavedFilters()
      }
    } catch (error) {
      console.error('Save filter error:', error)
    }
  }

  const loadSavedFilters = async () => {
    // This would load saved filters from API
    // For now, mock data
    setSavedFilters([
      { id: '1', name: 'High-Paying Remote Jobs', type: 'JOB_FILTER' },
      { id: '2', name: 'Immediate Joiners in Bangalore', type: 'CANDIDATE_FILTER' }
    ])
  }

  useEffect(() => {
    loadSavedFilters()
  }, [])

  const renderJobResults = () => {
    if (!results?.jobs) return null

    return (
      <div className="space-y-4">
        {results.jobs.map((job: any) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-gray-600">{job.company.name} • {job.location}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    ₹{job.salaryMin?.toLocaleString()} - ₹{job.salaryMax?.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">{job.type}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center space-x-1">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{job.experienceLevel}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{job._count.applications} applicants</span>
                </div>
                {job.remote && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">Remote</Badge>
                )}
                {job.urgency === 'URGENT' && (
                  <Badge variant="destructive">Urgent</Badge>
                )}
              </div>

              {job.smartInsights && job.smartInsights.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.smartInsights.map((insight: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {insight}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </div>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderCandidateResults = () => {
    if (!results?.candidates) return null

    return (
      <div className="space-y-4">
        {results.candidates.map((candidate: any) => (
          <Card key={candidate.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                    <p className="text-gray-600">{candidate.profile?.currentDesignation || 'Professional'}</p>
                    <p className="text-sm text-gray-500">{candidate.profile?.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">
                    ₹{candidate.profile?.expectedCTC?.toLocaleString()} LPA
                  </div>
                  <div className="text-sm text-gray-500">Expected</div>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-3">
                <div className="flex items-center space-x-1">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{candidate.profile?.experience || 0} years</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{candidate.profile?.noticePeriod || 0} days notice</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{Math.round(candidate.profile?.profileCompleteness || 0)}% complete</span>
                </div>
              </div>

              {candidate.smartInsights && candidate.smartInsights.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {candidate.smartInsights.map((insight: any, idx: number) => (
                    <Badge key={idx} variant="outline" className={`text-xs ${
                      insight.type === 'immediate' ? 'border-red-200 bg-red-50 text-red-700' :
                      insight.type === 'buyout' ? 'border-green-200 bg-green-50 text-green-700' :
                      'border-blue-200 bg-blue-50 text-blue-700'
                    }`}>
                      {insight.text}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  {candidate._count.applications} applications • {candidate._count.resumes} resumes
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    View Profile
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Contact
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Filter className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Smart Filters</h1>
            <p className="text-sm text-gray-600">Find the perfect match with AI-powered filtering</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Input
            placeholder="Enter location..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-48"
          />
          {selectedFilter && (
            <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Save className="w-4 h-4 mr-1" />
                  Save Filter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Smart Filter</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Filter name..."
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveCurrentFilter}>
                      Save Filter
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'jobs' | 'candidates')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="jobs">Job Filters</TabsTrigger>
          <TabsTrigger value="candidates">Candidate Filters</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          {/* Job Filter Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {smartJobFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? "default" : "outline"}
                className={`h-auto p-4 flex flex-col items-center space-y-2 ${
                  selectedFilter === filter.id ? filter.color : ''
                }`}
                onClick={() => applyFilter(filter.id)}
                disabled={isLoading}
              >
                <filter.icon className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium text-xs">{filter.label}</div>
                  <div className="text-xs opacity-75">{filter.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          {/* Candidate Filter Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {smartCandidateFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? "default" : "outline"}
                className={`h-auto p-4 flex flex-col items-center space-y-2 ${
                  selectedFilter === filter.id ? filter.color : ''
                }`}
                onClick={() => applyFilter(filter.id)}
                disabled={isLoading}
              >
                <filter.icon className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium text-xs">{filter.label}</div>
                  <div className="text-xs opacity-75">{filter.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Results Section */}
      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Results */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>
                      {activeTab === 'jobs' ? 'Matching Jobs' : 'Matching Candidates'} 
                      ({results.pagination?.total || 0})
                    </span>
                  </CardTitle>
                  {selectedFilter && (
                    <Badge variant="secondary" className="capitalize">
                      {currentFilters.find(f => f.id === selectedFilter)?.label}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-2">Finding matches...</span>
                  </div>
                ) : activeTab === 'jobs' ? (
                  renderJobResults()
                ) : (
                  renderCandidateResults()
                )}
              </CardContent>
            </Card>
          </div>

          {/* Insights Sidebar */}
          <div className="space-y-6">
            {/* Filter Insights */}
            {results.insights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeTab === 'jobs' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Jobs:</span>
                        <span className="font-medium">{results.insights.totalJobs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Salary:</span>
                        <span className="font-medium">₹{Math.round(results.insights.averageSalary || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Remote Jobs:</span>
                        <span className="font-medium">{results.insights.remoteJobs || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Urgent:</span>
                        <span className="font-medium">{results.insights.urgentJobs || 0}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Candidates:</span>
                        <span className="font-medium">{results.insights.totalCandidates}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Experience:</span>
                        <span className="font-medium">{Math.round(results.insights.averageExperience || 0)} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Avg Expected CTC:</span>
                        <span className="font-medium">₹{Math.round(results.insights.averageExpectedCTC || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Immediate Joiners:</span>
                        <span className="font-medium">{results.insights.immediateJoiners || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Willing to Relocate:</span>
                        <span className="font-medium">{results.insights.willingToRelocate || 0}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Top Matching Reasons */}
            {results.insights?.topReasons && results.insights.topReasons.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Match Reasons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.insights.topReasons.map((reason, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{reason.reason}</span>
                        <Badge variant="outline">{reason.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Saved Filters */}
            {savedFilters.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Saved Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {savedFilters.map((filter) => (
                      <Button
                        key={filter.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {filter.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
