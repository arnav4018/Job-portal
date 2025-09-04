'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText, 
  Download, 
  Upload,
  Eye,
  Edit,
  Star,
  Award,
  CheckCircle,
  AlertCircle,
  Zap,
  Shield,
  BarChart3,
  RefreshCw,
  Plus,
  X,
  Camera,
  Palette
} from 'lucide-react'

interface Resume {
  id: string
  name: string
  template: string
  atsScore: number
  lastModified: Date
  status: 'DRAFT' | 'PUBLISHED' | 'SHARED'
  watermarked: boolean
  downloadCount: number
  skillAssessments: SkillAssessment[]
}

interface SkillAssessment {
  id: string
  skill: string
  level: number
  verified: boolean
  assessmentDate: Date
}

interface ResumeTemplate {
  id: string
  name: string
  preview: string
  category: string
  isPremium: boolean
  atsOptimized: boolean
}

const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'modern-pro',
    name: 'Modern Professional',
    preview: '/templates/modern-pro.jpg',
    category: 'Professional',
    isPremium: false,
    atsOptimized: true
  },
  {
    id: 'creative-designer',
    name: 'Creative Designer',
    preview: '/templates/creative.jpg',
    category: 'Creative',
    isPremium: true,
    atsOptimized: false
  },
  {
    id: 'tech-minimal',
    name: 'Tech Minimal',
    preview: '/templates/tech-minimal.jpg',
    category: 'Technology',
    isPremium: false,
    atsOptimized: true
  },
  {
    id: 'executive-elite',
    name: 'Executive Elite',
    preview: '/templates/executive.jpg',
    category: 'Executive',
    isPremium: true,
    atsOptimized: true
  }
]

const skillCategories = [
  'Programming Languages',
  'Frameworks & Libraries',
  'Databases',
  'Cloud Platforms',
  'DevOps Tools',
  'Soft Skills',
  'Industry Knowledge'
]

export default function ResumeManager() {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null)
  const [showTemplateDialog, setShowTemplateDialog] = useState(false)
  const [showSkillAssessment, setShowSkillAssessment] = useState(false)
  const [showATSScanner, setShowATSScanner] = useState(false)
  const [isBuilding, setIsBuilding] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Form states
  const [resumeName, setResumeName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null)
  const [assessmentSkill, setAssessmentSkill] = useState('')
  const [assessmentCategory, setAssessmentCategory] = useState('')

  useEffect(() => {
    loadResumes()
  }, [])

  const loadResumes = async () => {
    // Mock data - replace with actual API call
    const mockResumes: Resume[] = [
      {
        id: '1',
        name: 'Software Engineer Resume',
        template: 'modern-pro',
        atsScore: 85,
        lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: 'PUBLISHED',
        watermarked: true,
        downloadCount: 12,
        skillAssessments: [
          {
            id: '1',
            skill: 'React.js',
            level: 4,
            verified: true,
            assessmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          },
          {
            id: '2',
            skill: 'Node.js',
            level: 3,
            verified: true,
            assessmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        id: '2',
        name: 'Product Manager CV',
        template: 'executive-elite',
        atsScore: 72,
        lastModified: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'DRAFT',
        watermarked: false,
        downloadCount: 3,
        skillAssessments: []
      }
    ]
    setResumes(mockResumes)
  }

  const createNewResume = async () => {
    if (!resumeName || !selectedTemplate) return

    try {
      setIsBuilding(true)
      
      // Simulate building process
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const newResume: Resume = {
        id: Date.now().toString(),
        name: resumeName,
        template: selectedTemplate.id,
        atsScore: 0,
        lastModified: new Date(),
        status: 'DRAFT',
        watermarked: false,
        downloadCount: 0,
        skillAssessments: []
      }

      setResumes([newResume, ...resumes])
      setShowTemplateDialog(false)
      setResumeName('')
      setSelectedTemplate(null)
      setUploadProgress(0)

    } catch (error) {
      console.error('Error creating resume:', error)
    } finally {
      setIsBuilding(false)
    }
  }

  const runATSAnalysis = async (resume: Resume) => {
    try {
      setShowATSScanner(true)
      
      // Simulate ATS analysis
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const newScore = Math.floor(Math.random() * 30) + 70 // Random score between 70-100
      
      setResumes(resumes.map(r => 
        r.id === resume.id 
          ? { ...r, atsScore: newScore }
          : r
      ))

      setShowATSScanner(false)
    } catch (error) {
      console.error('Error running ATS analysis:', error)
      setShowATSScanner(false)
    }
  }

  const addWatermark = async (resumeId: string) => {
    try {
      setResumes(resumes.map(r => 
        r.id === resumeId 
          ? { ...r, watermarked: true }
          : r
      ))
    } catch (error) {
      console.error('Error adding watermark:', error)
    }
  }

  const takeSkillAssessment = async () => {
    if (!assessmentSkill || !selectedResume) return

    try {
      const newAssessment: SkillAssessment = {
        id: Date.now().toString(),
        skill: assessmentSkill,
        level: Math.floor(Math.random() * 5) + 1, // Random level 1-5
        verified: true,
        assessmentDate: new Date()
      }

      setResumes(resumes.map(r => 
        r.id === selectedResume.id
          ? { ...r, skillAssessments: [...r.skillAssessments, newAssessment] }
          : r
      ))

      setShowSkillAssessment(false)
      setAssessmentSkill('')
      setAssessmentCategory('')
    } catch (error) {
      console.error('Error taking skill assessment:', error)
    }
  }

  const getATSScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusBadge = (status: Resume['status']) => {
    const statusConfig = {
      'DRAFT': { color: 'bg-gray-500', text: 'Draft' },
      'PUBLISHED': { color: 'bg-green-500', text: 'Published' },
      'SHARED': { color: 'bg-blue-500', text: 'Shared' }
    }

    const config = statusConfig[status]
    return (
      <Badge className={`${config.color} text-white text-xs`}>
        {config.text}
      </Badge>
    )
  }

  const renderSkillLevel = (level: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= level 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">({level}/5)</span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resume Manager</h1>
            <p className="text-sm text-gray-600">Build, optimize, and manage your professional resumes</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowTemplateDialog(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Resume
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Upload Resume
          </Button>
        </div>
      </div>

      {/* Resume Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumes List */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>My Resumes</span>
                <Badge variant="outline">{resumes.length} Total</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div key={resume.id} className="border rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{resume.name}</h3>
                          {getStatusBadge(resume.status)}
                          {resume.watermarked && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Watermarked
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Template: {resumeTemplates.find(t => t.id === resume.template)?.name}</span>
                          <span>Modified: {resume.lastModified.toLocaleDateString()}</span>
                          <span>Downloads: {resume.downloadCount}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="w-4 h-4 text-gray-400" />
                            <span className={`font-semibold ${getATSScoreColor(resume.atsScore)}`}>
                              {resume.atsScore}/100
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">ATS Score</p>
                        </div>
                      </div>
                    </div>

                    {/* Skill Assessments */}
                    {resume.skillAssessments.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Verified Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {resume.skillAssessments.slice(0, 3).map((assessment) => (
                            <div key={assessment.id} className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded text-xs">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span>{assessment.skill}</span>
                              {renderSkillLevel(assessment.level)}
                            </div>
                          ))}
                          {resume.skillAssessments.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{resume.skillAssessments.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => runATSAnalysis(resume)}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          ATS Scan
                        </Button>
                      </div>

                      <div className="flex space-x-2">
                        {!resume.watermarked && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => addWatermark(resume.id)}
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            Add Watermark
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => {
                            setSelectedResume(resume)
                            setShowSkillAssessment(true)
                          }}
                        >
                          <Award className="w-3 h-3 mr-1" />
                          Skill Test
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {resumes.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No resumes yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create your first professional resume using our templates.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resume Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Resumes</span>
                <span className="font-semibold">{resumes.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average ATS Score</span>
                <span className="font-semibold">
                  {resumes.length > 0 
                    ? Math.round(resumes.reduce((acc, r) => acc + r.atsScore, 0) / resumes.length)
                    : 0
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Downloads</span>
                <span className="font-semibold">
                  {resumes.reduce((acc, r) => acc + r.downloadCount, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Verified Skills</span>
                <span className="font-semibold">
                  {resumes.reduce((acc, r) => acc + r.skillAssessments.length, 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* ATS Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>ATS Optimization Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <p className="text-sm text-gray-600">Use relevant keywords from job descriptions</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <p className="text-sm text-gray-600">Keep formatting simple and clean</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <p className="text-sm text-gray-600">Include quantifiable achievements</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <p className="text-sm text-gray-600">Use standard section headings</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Choose Resume Template</DialogTitle>
            <DialogDescription>
              Select a professional template to create your new resume
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Resume Name</label>
              <Input
                placeholder="e.g., Software Engineer Resume"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {resumeTemplates.map((template) => (
                <div 
                  key={template.id}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                    {/* Replace with actual template preview image */}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{template.name}</h3>
                      {template.isPremium && (
                        <Badge className="bg-yellow-500 text-white text-xs">Premium</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600">{template.category}</p>
                    
                    <div className="flex items-center space-x-2">
                      {template.atsOptimized && (
                        <Badge variant="outline" className="text-xs">
                          <BarChart3 className="w-3 h-3 mr-1" />
                          ATS Optimized
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {isBuilding && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Building your resume...</span>
                  <span className="text-sm font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={createNewResume}
                disabled={!resumeName || !selectedTemplate || isBuilding}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Create Resume
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Skill Assessment Dialog */}
      <Dialog open={showSkillAssessment} onOpenChange={setShowSkillAssessment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Take Skill Assessment</DialogTitle>
            <DialogDescription>
              Verify your skills with our AI-powered assessment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Skill Category</label>
              <Select onValueChange={setAssessmentCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Specific Skill</label>
              <Input
                placeholder="e.g., React.js, Python, Project Management"
                value={assessmentSkill}
                onChange={(e) => setAssessmentSkill(e.target.value)}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Assessment Information</h4>
                  <p className="text-sm text-blue-700">
                    The assessment consists of 10-15 questions and takes about 5-10 minutes. 
                    You'll receive a skill level rating and verification badge upon completion.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSkillAssessment(false)}>
                Cancel
              </Button>
              <Button 
                onClick={takeSkillAssessment}
                disabled={!assessmentSkill || !assessmentCategory}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Award className="w-4 h-4 mr-2" />
                Start Assessment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ATS Scanner Dialog */}
      <Dialog open={showATSScanner} onOpenChange={setShowATSScanner}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ATS Analysis in Progress</DialogTitle>
            <DialogDescription>
              Analyzing your resume for ATS compatibility...
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="animate-spin">
              <BarChart3 className="w-12 h-12 text-purple-600" />
            </div>
            <p className="text-center text-gray-600">
              Our AI is scanning your resume for keywords, formatting, and ATS optimization. 
              This may take a few moments.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
