'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { FileText, Plus, Edit, Trash2, Download, Eye } from 'lucide-react'
import Link from 'next/link'

interface Resume {
  id: string
  title: string
  template: string
  isDefault: boolean
  downloadCount: number
  createdAt: string
  updatedAt: string
}

interface ResumeBuilderProps {
  existingResumes: Resume[]
}

export function ResumeBuilder({ existingResumes }: ResumeBuilderProps) {
  const [resumes, setResumes] = useState<Resume[]>(existingResumes)
  const [isCreating, setIsCreating] = useState(false)
  const [newResumeTitle, setNewResumeTitle] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('modern')
  const router = useRouter()
  const { toast } = useToast()

  const templates = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean and contemporary design',
      preview: '/templates/modern-preview.png'
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional professional layout',
      preview: '/templates/classic-preview.png'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Stand out with unique design',
      preview: '/templates/creative-preview.png'
    }
  ]

  const handleCreateResume = async () => {
    if (!newResumeTitle.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for your resume.',
        variant: 'destructive',
      })
      return
    }

    setIsCreating(true)

    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newResumeTitle,
          template: selectedTemplate,
          content: {
            personalInfo: {},
            experience: [],
            education: [],
            skills: [],
            projects: []
          }
        }),
      })

      if (response.ok) {
        const newResume = await response.json()
        toast({
          title: 'Resume Created',
          description: 'Your new resume has been created successfully.',
        })
        router.push(`/resume-builder/${newResume.id}`)
      } else {
        throw new Error('Failed to create resume')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create resume. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return
    }

    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setResumes(resumes.filter(r => r.id !== resumeId))
        toast({
          title: 'Resume Deleted',
          description: 'Your resume has been deleted successfully.',
        })
      } else {
        throw new Error('Failed to delete resume')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete resume. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Create New Resume */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Create New Resume</span>
          </CardTitle>
          <CardDescription>
            Start building your professional resume with our easy-to-use builder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resume Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Resume Title</Label>
            <Input
              id="title"
              placeholder="e.g., Software Engineer Resume"
              value={newResumeTitle}
              onChange={(e) => setNewResumeTitle(e.target.value)}
            />
          </div>

          {/* Template Selection */}
          <div className="space-y-4">
            <Label>Choose Template</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="aspect-[3/4] bg-muted rounded mb-3 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleCreateResume} 
            disabled={isCreating}
            className="w-full md:w-auto"
          >
            {isCreating ? 'Creating...' : 'Create Resume'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Resumes */}
      {resumes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Resumes</CardTitle>
            <CardDescription>
              Manage your existing resumes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{resume.title}</h3>
                        {resume.isDefault && (
                          <Badge variant="secondary" className="text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Template: {resume.template} • Updated {new Date(resume.updatedAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Download className="h-3 w-3 mr-1" />
                          {resume.downloadCount} downloads
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/resume-builder/${resume.id}`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteResume(resume.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Tips for creating an effective resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Resume Essentials</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Keep it concise (1-2 pages)</li>
                <li>• Use action verbs and quantify achievements</li>
                <li>• Tailor content to each job application</li>
                <li>• Include relevant keywords from job descriptions</li>
                <li>• Proofread for spelling and grammar errors</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What to Include</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Contact information</li>
                <li>• Professional summary or objective</li>
                <li>• Work experience with achievements</li>
                <li>• Education and certifications</li>
                <li>• Relevant skills and technologies</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}