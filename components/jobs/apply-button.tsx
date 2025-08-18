'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Loader2, FileText } from 'lucide-react'

interface ApplyButtonProps {
  jobId: string
}

export function ApplyButton({ jobId }: ApplyButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [resumes, setResumes] = useState<any[]>([])

  const handleOpen = async () => {
    setIsOpen(true)
    
    // Fetch user's resumes
    try {
      const response = await fetch('/api/resumes')
      if (response.ok) {
        const data = await response.json()
        setResumes(data)
        
        // Auto-select default resume
        const defaultResume = data.find((resume: any) => resume.isDefault)
        if (defaultResume) {
          setSelectedResumeId(defaultResume.id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch resumes:', error)
    }
  }

  const handleApply = async () => {
    if (!selectedResumeId) {
      toast({
        title: 'Resume Required',
        description: 'Please select a resume to apply with.',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          resumeId: selectedResumeId,
          coverLetter: coverLetter.trim() || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Application Submitted',
          description: 'Your application has been submitted successfully!',
        })
        setIsOpen(false)
        router.refresh()
      } else {
        const error = await response.json()
        toast({
          title: 'Application Failed',
          description: error.error || 'Failed to submit application. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Application Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" onClick={handleOpen}>
          Apply Now
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for this job</DialogTitle>
          <DialogDescription>
            Submit your application with your resume and cover letter.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Resume Selection */}
          <div className="space-y-2">
            <Label htmlFor="resume">Select Resume *</Label>
            {resumes.length > 0 ? (
              <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a resume" />
                </SelectTrigger>
                <SelectContent>
                  {resumes.map((resume) => (
                    <SelectItem key={resume.id} value={resume.id}>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>{resume.title}</span>
                        {resume.isDefault && (
                          <span className="text-xs text-muted-foreground">(Default)</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">
                  You don't have any resumes yet.
                </p>
                <Button variant="outline" size="sm" onClick={() => {
                  setIsOpen(false)
                  router.push('/resume-builder')
                }}>
                  Create Resume
                </Button>
              </div>
            )}
          </div>
          
          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
            <Textarea
              id="coverLetter"
              placeholder="Write a brief cover letter to introduce yourself..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {coverLetter.length}/1000 characters
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleApply}
              disabled={isLoading || !selectedResumeId}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}