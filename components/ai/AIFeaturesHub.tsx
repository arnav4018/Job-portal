'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  Users, 
  FileText, 
  Sparkles, 
  Target, 
  MessageSquare,
  Star,
  TrendingUp,
  CheckCircle,
  Clock,
  Zap,
  Search,
  Filter,
  PenTool,
  BarChart3,
  Lightbulb,
  Eye
} from 'lucide-react'

interface JobMatchResult {
  job: any
  matches: Array<{
    candidate: any
    matchScore: number
    reasons: string[]
    insights: any[]
  }>
  insights: {
    averageScore: number
    topReasons: Array<{ reason: string; count: number }>
  }
}

interface ScreeningResult {
  analysis: {
    overallScore: number
    analysis: string[]
    recommendation: 'RECOMMEND' | 'CONSIDER' | 'NOT_RECOMMENDED'
  }
}

interface JobGenerationResult {
  generatedPosting: {
    title: string
    description: string
    responsibilities: string[]
    requirements: string[]
    benefits: string[]
  }
  suggestions: {
    optimizationTips: string[]
    keywordSuggestions: string[]
  }
}

interface SkillAssessmentResult {
  assessmentId: string
  questions: any[]
  timeLimit: number
  instructions: string
}

const aiFeatures = [
  {
    id: 'job-matching',
    title: 'AI Job Matching',
    description: 'Find the perfect candidates for your jobs using advanced AI algorithms',
    icon: Target,
    color: 'bg-blue-500',
    features: ['Skill matching', 'Experience analysis', 'Cultural fit assessment', 'Salary compatibility']
  },
  {
    id: 'candidate-screening',
    title: 'AI Candidate Screening',
    description: 'Intelligent screening questions and automated candidate evaluation',
    icon: Filter,
    color: 'bg-green-500',
    features: ['Dynamic questions', 'Response analysis', 'Scoring system', 'Recommendations']
  },
  {
    id: 'job-generation',
    title: 'AI Job Posting Generator',
    description: 'Create compelling job descriptions with AI assistance',
    icon: PenTool,
    color: 'bg-purple-500',
    features: ['Auto-generation', 'Optimization tips', 'ATS-friendly', 'Keyword suggestions']
  },
  {
    id: 'skill-assessment',
    title: 'Skill Assessment',
    description: 'AI-powered skill evaluation before job applications',
    icon: BarChart3,
    color: 'bg-orange-500',
    features: ['Dynamic questions', 'Real-time scoring', 'Skill validation', 'Performance insights']
  }
]

export default function AIFeaturesHub() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  // Job Matching State
  const [selectedJobId, setSelectedJobId] = useState('')
  const [matchingResults, setMatchingResults] = useState<JobMatchResult | null>(null)

  // Candidate Screening State
  const [candidateId, setCandidateId] = useState('')
  const [jobId, setJobId] = useState('')
  const [screeningQuestions, setScreeningQuestions] = useState<any[]>([])
  const [screeningResults, setScreeningResults] = useState<ScreeningResult | null>(null)

  // Job Generation State
  const [jobTitle, setJobTitle] = useState('')
  const [companyId, setCompanyId] = useState('')
  const [jobRequirements, setJobRequirements] = useState('')
  const [generationResults, setGenerationResults] = useState<JobGenerationResult | null>(null)

  // Skill Assessment State
  const [assessmentSkills, setAssessmentSkills] = useState('')
  const [assessmentResults, setAssessmentResults] = useState<SkillAssessmentResult | null>(null)

  const runAIFeature = async (featureId: string, params: any) => {
    setIsLoading(true)
    setActiveFeature(featureId)
    
    try {
      const response = await fetch(`/api/ai?action=${featureId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      })
      
      const data = await response.json()
      
      switch (featureId) {
        case 'job-matching':
          setMatchingResults(data)
          break
        case 'candidate-screening':
          if (data.analysis) {
            setScreeningResults(data)
          } else {
            setScreeningQuestions(data.screeningQuestions)
          }
          break
        case 'generate-job-posting':
          setGenerationResults(data)
          break
        case 'skill-assessment':
          setAssessmentResults(data)
          break
      }
    } catch (error) {
      console.error('AI feature error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderJobMatching = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="w-5 h-5" />
          <span>AI Job Matching</span>
        </CardTitle>
        <CardDescription>
          Find the best candidate matches for your job openings using AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Job ID</label>
          <Input
            placeholder="Enter job ID to find matches"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={() => runAIFeature('job-matching', { jobId: selectedJobId })}
          disabled={!selectedJobId || isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Finding Matches...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Find AI Matches
            </>
          )}
        </Button>

        {matchingResults && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Job: {matchingResults.job.title}</h4>
              <Badge variant="outline">{matchingResults.matches.length} matches found</Badge>
            </div>
            
            <div className="space-y-3">
              {matchingResults.matches.slice(0, 5).map((match, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{match.candidate.name}</div>
                    <Badge className={`${
                      match.matchScore >= 80 ? 'bg-green-500' :
                      match.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {match.matchScore}% Match
                    </Badge>
                  </div>
                  <Progress value={match.matchScore} className="mb-2" />
                  <div className="flex flex-wrap gap-1">
                    {match.reasons.slice(0, 3).map((reason, reasonIdx) => (
                      <Badge key={reasonIdx} variant="secondary" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">Matching Insights</h5>
              <div className="text-sm text-gray-600">
                <p>Average Match Score: {Math.round(matchingResults.insights.averageScore)}%</p>
                <p>Top Reasons: {matchingResults.insights.topReasons.map(r => r.reason).join(', ')}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderCandidateScreening = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>AI Candidate Screening</span>
        </CardTitle>
        <CardDescription>
          Generate intelligent screening questions and analyze candidate responses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Candidate ID</label>
            <Input
              placeholder="Candidate ID"
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Job ID</label>
            <Input
              placeholder="Job ID"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
            />
          </div>
        </div>
        
        <Button 
          onClick={() => runAIFeature('candidate-screening', { candidateId, jobId })}
          disabled={!candidateId || !jobId || isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Generating Questions...
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4 mr-2" />
              Generate Screening Questions
            </>
          )}
        </Button>

        {screeningQuestions.length > 0 && (
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold">AI-Generated Screening Questions</h4>
            {screeningQuestions.map((question, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="font-medium mb-2">{question.question}</div>
                <div className="text-sm text-gray-600 mb-2">Type: {question.type}</div>
                {question.options && (
                  <div className="space-y-1">
                    {question.options.map((option: string, optIdx: number) => (
                      <div key={optIdx} className="text-sm bg-gray-50 p-2 rounded">
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {screeningResults && (
          <div className="mt-6">
            <Alert className={`${
              screeningResults.analysis.recommendation === 'RECOMMEND' ? 'border-green-200 bg-green-50' :
              screeningResults.analysis.recommendation === 'CONSIDER' ? 'border-yellow-200 bg-yellow-50' :
              'border-red-200 bg-red-50'
            }`}>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">
                  Analysis Complete - {screeningResults.analysis.recommendation}
                </div>
                <div className="space-y-1">
                  {screeningResults.analysis.analysis.map((point, idx) => (
                    <p key={idx} className="text-sm">{point}</p>
                  ))}
                </div>
                <div className="mt-2">
                  <Badge>Score: {screeningResults.analysis.overallScore}/100</Badge>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderJobGeneration = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PenTool className="w-5 h-5" />
          <span>AI Job Posting Generator</span>
        </CardTitle>
        <CardDescription>
          Create compelling job descriptions with AI assistance and optimization tips
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Job Title</label>
            <Input
              placeholder="e.g., Senior Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Company ID</label>
            <Input
              placeholder="Company ID"
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Requirements (Optional)</label>
          <Textarea
            placeholder="Describe specific requirements or let AI generate them..."
            value={jobRequirements}
            onChange={(e) => setJobRequirements(e.target.value)}
            rows={3}
          />
        </div>
        
        <Button 
          onClick={() => runAIFeature('generate-job-posting', { 
            jobTitle, 
            companyId, 
            requirements: jobRequirements.split('\n').filter(Boolean)
          })}
          disabled={!jobTitle || !companyId || isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Generating Job Posting...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Generate AI Job Posting
            </>
          )}
        </Button>

        {generationResults && (
          <div className="mt-6 space-y-6">
            <div className="border rounded-lg p-6">
              <h4 className="font-semibold mb-4">Generated Job Posting</h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-900">{generationResults.generatedPosting.title}</h5>
                  <p className="text-gray-700 mt-2">{generationResults.generatedPosting.description}</p>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900">Responsibilities:</h5>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {generationResults.generatedPosting.responsibilities.map((resp, idx) => (
                      <li key={idx} className="text-gray-700">{resp}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900">Requirements:</h5>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {generationResults.generatedPosting.requirements.map((req, idx) => (
                      <li key={idx} className="text-gray-700">{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-gray-900">Benefits:</h5>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {generationResults.generatedPosting.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-gray-700">{benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">
                  <Lightbulb className="w-4 h-4 inline mr-1" />
                  Optimization Tips
                </h5>
                <ul className="space-y-1">
                  {generationResults.suggestions.optimizationTips.map((tip, idx) => (
                    <li key={idx} className="text-sm text-blue-800">• {tip}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="font-medium text-green-900 mb-2">
                  <Star className="w-4 h-4 inline mr-1" />
                  Keyword Suggestions
                </h5>
                <div className="flex flex-wrap gap-1">
                  {generationResults.suggestions.keywordSuggestions.map((keyword, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderSkillAssessment = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>AI Skill Assessment</span>
        </CardTitle>
        <CardDescription>
          Generate dynamic skill assessments for candidates before job applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Skills to Assess</label>
          <Input
            placeholder="e.g., React, Node.js, Python (comma separated)"
            value={assessmentSkills}
            onChange={(e) => setAssessmentSkills(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={() => runAIFeature('skill-assessment', { 
            candidateId: 'candidate123', // This would be dynamic
            jobId: 'job456', // This would be dynamic
            skills: assessmentSkills.split(',').map(s => s.trim()).filter(Boolean)
          })}
          disabled={!assessmentSkills || isLoading}
          className="w-full bg-orange-600 hover:bg-orange-700"
        >
          {isLoading ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Creating Assessment...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Skill Assessment
            </>
          )}
        </Button>

        {assessmentResults && (
          <div className="mt-6 space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900">Assessment Created</h4>
              <p className="text-orange-800 mt-1">
                Assessment ID: {assessmentResults.assessmentId}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-orange-700">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {assessmentResults.timeLimit} minutes
                </div>
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  {assessmentResults.questions.length} questions
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium">Sample Questions:</h5>
              {assessmentResults.questions.slice(0, 2).map((skillGroup, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="font-medium mb-2">Skill: {skillGroup.skill}</div>
                  <Badge className="mb-2">{skillGroup.difficulty}</Badge>
                  <div className="space-y-2">
                    {skillGroup.questions.slice(0, 1).map((question: any, qIdx: number) => (
                      <div key={qIdx} className="text-sm bg-gray-50 p-3 rounded">
                        <div className="font-medium">{question.question}</div>
                        <div className="text-gray-600 mt-1">Type: {question.type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View Full Assessment
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Features Hub</h1>
          <p className="text-sm text-gray-600">Leverage AI to enhance your hiring process</p>
        </div>
      </div>

      {/* Feature Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {aiFeatures.map((feature) => (
          <Card key={feature.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 ${feature.color} rounded-lg flex items-center justify-center`}>
                  <feature.icon className="w-4 h-4 text-white" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
              <CardDescription className="mt-2">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {feature.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-gray-600">{feat}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Features Tabs */}
      <Tabs defaultValue="job-matching" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="job-matching">Job Matching</TabsTrigger>
          <TabsTrigger value="candidate-screening">Candidate Screening</TabsTrigger>
          <TabsTrigger value="job-generation">Job Generation</TabsTrigger>
          <TabsTrigger value="skill-assessment">Skill Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="job-matching">
          {renderJobMatching()}
        </TabsContent>

        <TabsContent value="candidate-screening">
          {renderCandidateScreening()}
        </TabsContent>

        <TabsContent value="job-generation">
          {renderJobGeneration()}
        </TabsContent>

        <TabsContent value="skill-assessment">
          {renderSkillAssessment()}
        </TabsContent>
      </Tabs>

      {/* Credits Usage Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">AI Features Credit Usage</h3>
              <p className="text-blue-700 text-sm mt-1">
                Each AI feature consumes credits: Job Matching (5 credits), Screening (2 credits), 
                Job Generation (2 credits), Skill Assessment (3 credits)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
