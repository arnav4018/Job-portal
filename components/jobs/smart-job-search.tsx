'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Brain, 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Clock,
  Star,
  Target,
  Lightbulb
} from 'lucide-react'

interface JobMatch {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  remote: boolean
  skills: string[]
  matchScore: number
  skillMatch: number
  experienceMatch: number
  locationMatch: number
  breakdown: {
    matchedSkills: string[]
    missingSkills: string[]
    partialSkills: string[]
    recommendations: string[]
  }
}

interface SmartJobSearchProps {
  userSkills?: string[]
  userExperience?: number
  userLocation?: string
}

export function SmartJobSearch({ userSkills = [], userExperience = 0, userLocation = '' }: SmartJobSearchProps) {
  const [query, setQuery] = useState('')
  const [jobs, setJobs] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('search')
  const [skillGaps, setSkillGaps] = useState<{
    mostInDemandSkills: Array<{ skill: string; frequency: number }>
    skillGaps: string[]
    learningPath: Array<{ skill: string; priority: 'high' | 'medium' | 'low' }>
  }>()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const initialQuery = searchParams.get('query') || ''
    setQuery(initialQuery)
    if (initialQuery) {
      handleSearch(initialQuery)
    }
  }, [])

  const handleSearch = async (searchQuery: string = query) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        sortBy: 'matchScore',
        sortOrder: 'desc',
        limit: '20'
      })

      const response = await fetch(`/api/jobs/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
        
        // Analyze skill gaps
        if (data.jobs && data.jobs.length > 0) {
          analyzeSkillGaps(data.jobs)
        }
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeSkillGaps = (jobList: JobMatch[]) => {
    const skillFrequency: Record<string, number> = {}
    
    jobList.forEach(job => {
      job.skills.forEach(skill => {
        const normalizedSkill = skill.toLowerCase().trim()
        skillFrequency[normalizedSkill] = (skillFrequency[normalizedSkill] || 0) + 1
      })
    })
    
    const userSkillsNormalized = userSkills.map(s => s.toLowerCase().trim())
    const gaps = Object.keys(skillFrequency)
      .filter(skill => !userSkillsNormalized.includes(skill))
      .sort((a, b) => skillFrequency[b] - skillFrequency[a])
    
    setSkillGaps({
      mostInDemandSkills: Object.entries(skillFrequency)
        .map(([skill, frequency]) => ({ skill, frequency }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10),
      skillGaps: gaps.slice(0, 10),
      learningPath: gaps.slice(0, 5).map(skill => ({
        skill,
        priority: skillFrequency[skill] >= 3 ? 'high' as const :
                  skillFrequency[skill] >= 2 ? 'medium' as const : 'low' as const
      }))
    })
  }

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMatchBadgeVariant = (score: number) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'outline'
  }

  return (
    <div className="space-y-6">
      {/* Smart Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI-Powered Job Search</span>
          </CardTitle>
          <CardDescription>
            Find jobs that match your skills and experience with intelligent recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Search for jobs, skills, or companies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={() => handleSearch()} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          
          {userSkills.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Your Skills:</p>
              <div className="flex flex-wrap gap-2">
                {userSkills.slice(0, 8).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {userSkills.length > 8 && (
                  <Badge variant="outline" className="text-xs">
                    +{userSkills.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Search Results ({jobs.length})
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Target className="h-4 w-4 mr-2" />
            AI Recommendations
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Lightbulb className="h-4 w-4 mr-2" />
            Career Insights
          </TabsTrigger>
        </TabsList>

        {/* Search Results */}
        <TabsContent value="search" className="space-y-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{job.title}</h3>
                      <p className="text-muted-foreground mb-2">{job.company}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                        </span>
                        {job.salary && (
                          <span className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {job.salary}
                          </span>
                        )}
                        {job.remote && (
                          <Badge variant="outline" className="text-xs">Remote</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getMatchColor(job.matchScore)}`}>
                        {job.matchScore}%
                      </div>
                      <p className="text-xs text-muted-foreground">Match Score</p>
                    </div>
                  </div>

                  {/* Match Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Skills</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={job.skillMatch} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{job.skillMatch}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Experience</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={job.experienceMatch} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{job.experienceMatch}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={job.locationMatch} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{job.locationMatch}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
                      <Button size="sm">
                        Apply Now
                      </Button>
                    </div>
                  </div>

                  {/* Skills Breakdown */}
                  <div className="space-y-2">
                    {job.breakdown.matchedSkills.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Matched Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {job.breakdown.matchedSkills.map((skill) => (
                            <Badge key={skill} variant="default" className="text-xs">
                              ✓ {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {job.breakdown.missingSkills.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Missing Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {job.breakdown.missingSkills.slice(0, 5).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or explore our AI recommendations
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AI Recommendations */}
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Job Recommendations</CardTitle>
              <CardDescription>
                Based on your skills and experience, here are jobs we think you'd be perfect for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4" />
                <p>AI recommendations will appear here based on your profile</p>
                <p className="text-sm">Complete your profile to get personalized suggestions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Career Insights */}
        <TabsContent value="insights" className="space-y-6">
          {skillGaps && (
            <>
              {/* Most In-Demand Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Most In-Demand Skills</span>
                  </CardTitle>
                  <CardDescription>
                    Skills that appear most frequently in job postings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {skillGaps.mostInDemandSkills.slice(0, 8).map((item, index) => (
                      <div key={item.skill} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                            {index + 1}
                          </div>
                          <span className="font-medium">{item.skill}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={(item.frequency / Math.max(...skillGaps.mostInDemandSkills.map(s => s.frequency))) * 100} className="w-20 h-2" />
                          <span className="text-sm text-muted-foreground">{item.frequency} jobs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Learning Path */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5" />
                    <span>Recommended Learning Path</span>
                  </CardTitle>
                  <CardDescription>
                    Skills to learn to improve your job match scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {skillGaps.learningPath.map((item) => (
                      <div key={item.skill} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={item.priority === 'high' ? 'default' : item.priority === 'medium' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {item.priority} priority
                          </Badge>
                          <span className="font-medium">{item.skill}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          Learn More
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}