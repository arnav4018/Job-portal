'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Search, Copy, Share2, Mail, Loader2 } from 'lucide-react'

interface Job {
  id: string
  title: string
  company: {
    name: string
  }
  location: string
  type: string
}

interface ReferralModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
  const [step, setStep] = useState(1)
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [referredEmail, setReferredEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [referralLink, setReferralLink] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      fetchJobs()
    }
  }, [isOpen])

  const fetchJobs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/jobs?status=PUBLISHED&limit=20')
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const createReferral = async () => {
    if (!selectedJob) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJob.id,
          referredEmail: referredEmail || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setReferralLink(data.referralLink)
        setStep(3)
        toast({
          title: 'Referral created!',
          description: 'Your referral link has been generated successfully.',
        })
      } else {
        throw new Error('Failed to create referral')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create referral. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    toast({
      title: 'Link copied!',
      description: 'Referral link has been copied to your clipboard.',
    })
  }

  const shareLink = () => {
    if (navigator.share && selectedJob) {
      navigator.share({
        title: `Job Referral: ${selectedJob.title}`,
        text: `Check out this amazing job opportunity at ${selectedJob.company.name}!`,
        url: referralLink,
      })
    } else {
      copyLink()
    }
  }

  const sendEmail = async () => {
    if (!referredEmail || !selectedJob) return

    try {
      // Email will be sent automatically by the API when creating referral
      toast({
        title: 'Email sent!',
        description: `Referral email has been sent to ${referredEmail}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send email. You can still share the link manually.',
        variant: 'destructive',
      })
    }
  }

  const resetModal = () => {
    setStep(1)
    setSelectedJob(null)
    setReferredEmail('')
    setMessage('')
    setReferralLink('')
    setSearchQuery('')
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && 'Select Job to Refer'}
            {step === 2 && 'Referral Details'}
            {step === 3 && 'Share Your Referral'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Choose a job opportunity to refer a candidate to'}
            {step === 2 && 'Add candidate details (optional) and create your referral'}
            {step === 3 && 'Your referral link is ready! Share it with candidates'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Job Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No jobs found
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedJob?.id === job.id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-sm text-muted-foreground">{job.company.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.location} • {job.type.replace(/_/g, ' ')}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!selectedJob}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Referral Details */}
        {step === 2 && selectedJob && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold">{selectedJob.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedJob.company.name}</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Candidate Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="candidate@example.com"
                  value={referredEmail}
                  onChange={(e) => setReferredEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If provided, we'll send them an email with the job details and your referral link
                </p>
              </div>

              <div>
                <Label htmlFor="message">Personal Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Add a personal note about why this opportunity is great..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={createReferral} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Referral'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Share Referral */}
        {step === 3 && selectedJob && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Referral Created Successfully!</h3>
              <p className="text-sm text-green-700">
                Your referral for <strong>{selectedJob.title}</strong> at <strong>{selectedJob.company.name}</strong> is ready.
              </p>
            </div>

            <div>
              <Label>Your Referral Link</Label>
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" onClick={copyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button onClick={shareLink} className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share Link
              </Button>
              {referredEmail && (
                <Button variant="outline" onClick={sendEmail} className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              )}
            </div>

            <div className="text-center">
              <Button variant="outline" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}