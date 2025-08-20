'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Save, Download, Eye, ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Resume {
  id: string
  title: string
  content: string
  template: string
  isDefault: boolean
}

interface ResumeContent {
  personalInfo: {
    fullName?: string
    email?: string
    phone?: string
    location?: string
    website?: string
    linkedin?: string
    summary?: string
  }
  experience: Array<{
    id: string
    company: string
    position: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  education: Array<{
    id: string
    institution: string
    degree: string
    field: string
    startDate: string
    endDate: string
    gpa?: string
  }>
  skills: Array<{
    id: string
    category: string
    items: string[]
  }>
  projects: Array<{
    id: string
    name: string
    description: string
    technologies: string[]
    url?: string
  }>
}

interface ResumeEditorProps {
  resume: Resume
}

export function ResumeEditor({ resume }: ResumeEditorProps) {
  const [title, setTitle] = useState(resume.title)
  const [content, setContent] = useState<ResumeContent>(() => {
    try {
      return JSON.parse(resume.content)
    } catch {
      return {
        personalInfo: {},
        experience: [],
        education: [],
        skills: [],
        projects: []
      }
    }
  })
  const [isSaving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('personal')
  const router = useRouter()
  const { toast } = useToast()

  const handleSave = async () => {
    setSaving(true)

    try {
      const response = await fetch(`/api/resumes/${resume.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Resume Saved',
          description: 'Your resume has been saved successfully.',
        })
      } else {
        throw new Error('Failed to save resume')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save resume. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }
    setContent(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }))
  }

  const updateExperience = (id: string, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const removeExperience = (id: string) => {
    setContent(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }))
  }

  const addEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    }
    setContent(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }))
  }

  const updateEducation = (id: string, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const removeEducation = (id: string) => {
    setContent(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }))
  }

  const sections = [
    { id: 'personal', name: 'Personal Info' },
    { id: 'experience', name: 'Experience' },
    { id: 'education', name: 'Education' },
    { id: 'skills', name: 'Skills' },
    { id: 'projects', name: 'Projects' }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Resume Sections</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/resume-builder">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {section.name}
                </button>
              ))}
            </nav>
            
            <div className="mt-6 space-y-2">
              <Button onClick={handleSave} disabled={isSaving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Resume'}
              </Button>
              <Button variant="outline" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <div className="space-y-2">
              <Label htmlFor="resume-title">Resume Title</Label>
              <Input
                id="resume-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold"
              />
            </div>
          </CardHeader>
          <CardContent>
            {/* Personal Information */}
            {activeSection === 'personal' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={content.personalInfo.fullName || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={content.personalInfo.email || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, email: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={content.personalInfo.phone || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, phone: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={content.personalInfo.location || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, location: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={content.personalInfo.website || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, website: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={content.personalInfo.linkedin || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    rows={4}
                    value={content.personalInfo.summary || ''}
                    onChange={(e) => setContent(prev => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, summary: e.target.value }
                    }))}
                    placeholder="Write a brief summary of your professional background and career objectives..."
                  />
                </div>
              </div>
            )}

            {/* Experience */}
            {activeSection === 'experience' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Work Experience</h3>
                  <Button onClick={addExperience} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
                
                {content.experience.map((exp, index) => (
                  <Card key={exp.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Experience #{index + 1}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeExperience(exp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>Company</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Position</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="month"
                          value={exp.endDate}
                          onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                          disabled={exp.current}
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                        />
                        <span className="text-sm">I currently work here</span>
                      </label>
                    </div>
                    
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        rows={3}
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </div>
                  </Card>
                ))}
                
                {content.experience.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No work experience added yet.</p>
                    <p className="text-sm">Click "Add Experience" to get started.</p>
                  </div>
                )}
              </div>
            )}

            {/* Education */}
            {activeSection === 'education' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Education</h3>
                  <Button onClick={addEducation} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
                
                {content.education.map((edu, index) => (
                  <Card key={edu.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Education #{index + 1}</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeEducation(edu.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Field of Study</Label>
                        <Input
                          value={edu.field}
                          onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>GPA (Optional)</Label>
                        <Input
                          value={edu.gpa}
                          onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Start Date</Label>
                        <Input
                          type="month"
                          value={edu.startDate}
                          onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input
                          type="month"
                          value={edu.endDate}
                          onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                
                {content.education.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No education added yet.</p>
                    <p className="text-sm">Click "Add Education" to get started.</p>
                  </div>
                )}
              </div>
            )}

            {/* Skills */}
            {activeSection === 'skills' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Skills</h3>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Skills section coming soon!</p>
                  <p className="text-sm">This feature is under development.</p>
                </div>
              </div>
            )}

            {/* Projects */}
            {activeSection === 'projects' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Projects</h3>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Projects section coming soon!</p>
                  <p className="text-sm">This feature is under development.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}