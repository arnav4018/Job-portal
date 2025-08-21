'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { ArrowLeft, Save, Eye, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Company {
  id: string
  name: string
  description: string | null
}

interface JobPostFormProps {
  company: Company
}

export default function JobPostForm({ company }: JobPostFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    skills: '',
    type: 'FULL_TIME',
    experienceLevel: 'MID',
    location: '',
    remote: false,
    salaryMin: '',
    salaryMax: '',
    currency: 'INR',
  })

  const handleSubmit = async (e: React.FormEvent, status: 'DRAFT' | 'PUBLISHED') => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const jobData = {
        ...formData,
        status,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
        skills: formData.skills ? JSON.stringify(formData.skills.split(',').map(s => s.trim())) : null,
      }

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      })

      if (response.ok) {
        const job = await response.json()
        toast({
          title: status === 'PUBLISHED' ? 'Job Published!' : 'Job Saved as Draft',
          description: status === 'PUBLISHED' 
            ? 'Your job posting is now live and visible to candidates.'
            : 'Your job has been saved as a draft.',
        })
        router.push(`/recruiter/jobs/${job.id}`)
      } else {
        throw new Error('Failed to create job')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create job posting. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/recruiter">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Post New Job</h1>
            <p className="text-muted-foreground">
              Create a job posting to attract qualified candidates
            </p>
          </div>
        </div>

        <form className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
              <CardDescription>
                Basic information about the position
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior Frontend Developer"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Job Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FULL_TIME">Full Time</SelectItem>
                      <SelectItem value="PART_TIME">Part Time</SelectItem>
                      <SelectItem value="CONTRACT">Contract</SelectItem>
                      <SelectItem value="INTERNSHIP">Internship</SelectItem>
                      <SelectItem value="FREELANCE">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ENTRY">Entry Level</SelectItem>
                      <SelectItem value="MID">Mid Level</SelectItem>
                      <SelectItem value="SENIOR">Senior Level</SelectItem>
                      <SelectItem value="LEAD">Lead</SelectItem>
                      <SelectItem value="EXECUTIVE">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote"
                  checked={formData.remote}
                  onCheckedChange={(checked) => setFormData({ ...formData, remote: !!checked })}
                />
                <Label htmlFor="remote">Remote work available</Label>
              </div>
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>
                Detailed information about the role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role, company culture, and what makes this opportunity exciting..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="responsibilities">Key Responsibilities *</Label>
                <Textarea
                  id="responsibilities"
                  rows={5}
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  placeholder="List the main responsibilities and duties for this role..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requirements *</Label>
                <Textarea
                  id="requirements"
                  rows={5}
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="List the required qualifications, experience, and skills..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="skills">Required Skills</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="JavaScript, React, Node.js, Python (comma-separated)"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Separate skills with commas. These will be used for AI matching.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Compensation */}
          <Card>
            <CardHeader>
              <CardTitle>Compensation</CardTitle>
              <CardDescription>
                Salary range and benefits (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="salaryMin">Minimum Salary</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                    placeholder="50000"
                  />
                </div>

                <div>
                  <Label htmlFor="salaryMax">Maximum Salary</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                    placeholder="80000"
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => handleSubmit(e, 'DRAFT')}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e, 'PUBLISHED')}
              disabled={isLoading || !formData.title || !formData.description}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              Publish Job
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}