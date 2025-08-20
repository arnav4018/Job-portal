'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Download, Edit, Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react'

interface Resume {
  id: string
  title: string
  data: string
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
    github?: string
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

interface ResumePreviewProps {
  resume: Resume
}

export default function ResumePreview({ resume }: ResumePreviewProps) {
  const content: ResumeContent = JSON.parse(resume.data)

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/resume-builder/${resume.id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Editor
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">{resume.title} - Preview</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/resume-builder/${resume.id}`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-white shadow-lg">
          <CardContent className="p-8">
            {/* Header Section */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {content.personalInfo.fullName || 'Your Name'}
              </h1>
              
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                {content.personalInfo.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {content.personalInfo.email}
                  </div>
                )}
                {content.personalInfo.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {content.personalInfo.phone}
                  </div>
                )}
                {content.personalInfo.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {content.personalInfo.location}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center gap-4 mt-2 text-sm text-gray-600">
                {content.personalInfo.website && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    <a href={content.personalInfo.website} className="text-blue-600 hover:underline">
                      Website
                    </a>
                  </div>
                )}
                {content.personalInfo.linkedin && (
                  <div className="flex items-center">
                    <Linkedin className="h-4 w-4 mr-1" />
                    <a href={content.personalInfo.linkedin} className="text-blue-600 hover:underline">
                      LinkedIn
                    </a>
                  </div>
                )}
                {content.personalInfo.github && (
                  <div className="flex items-center">
                    <Github className="h-4 w-4 mr-1" />
                    <a href={content.personalInfo.github} className="text-blue-600 hover:underline">
                      GitHub
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            {content.personalInfo.summary && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-gray-200 pb-1">
                  Professional Summary
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {content.personalInfo.summary}
                </p>
              </div>
            )}

            {/* Experience */}
            {content.experience.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-1">
                  Work Experience
                </h2>
                <div className="space-y-6">
                  {content.experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{exp.position}</h3>
                          <p className="text-gray-700 font-medium">{exp.company}</p>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {content.education.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-1">
                  Education
                </h2>
                <div className="space-y-4">
                  {content.education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {edu.degree} in {edu.field}
                          </h3>
                          <p className="text-gray-700">{edu.institution}</p>
                          {edu.gpa && (
                            <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {content.skills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-1">
                  Skills
                </h2>
                <div className="space-y-3">
                  {content.skills.map((skillGroup) => (
                    <div key={skillGroup.id}>
                      <h3 className="font-semibold text-gray-900 mb-1">{skillGroup.category}</h3>
                      <p className="text-gray-700">{skillGroup.items.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {content.projects.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-1">
                  Projects
                </h2>
                <div className="space-y-4">
                  {content.projects.map((project) => (
                    <div key={project.id}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        {project.url && (
                          <a 
                            href={project.url} 
                            className="text-blue-600 hover:underline text-sm"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Project
                          </a>
                        )}
                      </div>
                      <p className="text-gray-700 mb-2">{project.description}</p>
                      <p className="text-sm text-gray-600">
                        <strong>Technologies:</strong> {project.technologies.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}