import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { JobDetailView } from '@/components/jobs/job-detail-view'
import { ApplyButton } from '@/components/jobs/apply-button'
import JobErrorBoundary from '@/components/jobs/job-error-boundary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import {
  MapPin,
  Clock,
  Briefcase,
  Users,
  Star,
  Building,
  Calendar,
  DollarSign,
  Share2,
  Bookmark
} from 'lucide-react'
import { formatCurrency, getRelativeTime, getInitials } from '@/lib/utils'
import Link from 'next/link'
import { Suspense } from 'react'

interface JobPageProps {
  params: { id: string }
  searchParams: { ref?: string }
}

const jobTypeLabels: Record<string, string> = {
  'FULL_TIME': 'Full Time',
  'PART_TIME': 'Part Time',
  'CONTRACT': 'Contract',
  'INTERNSHIP': 'Internship',
  'FREELANCE': 'Freelance',
}

const experienceLevelLabels: Record<string, string> = {
  'ENTRY': 'Entry Level',
  'MID': 'Mid Level',
  'SENIOR': 'Senior Level',
  'LEAD': 'Lead',
  'EXECUTIVE': 'Executive',
}

// Validate job ID format
function isValidJobId(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id) || /^[a-zA-Z0-9_-]+$/.test(id)
}

async function getJobData(jobId: string, userId?: string) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: true,
        recruiter: {
          select: {
            id: true,
            name: true,
            image: true,
            profile: true,
          },
        },
        applications: userId ? {
          where: {
            candidateId: userId,
          },
          select: {
            id: true,
            status: true,
            appliedAt: true,
          },
        } : false,
        _count: {
          select: {
            applications: true,
          },
        },
      },
    })

    return job
  } catch (error) {
    console.error('Error fetching job data:', error)
    throw error
  }
}

async function getReferralData(referralCode: string) {
  try {
    const referral = await prisma.referral.findUnique({
      where: { code: referralCode },
      include: {
        referrer: {
          select: {
            name: true,
            profile: true,
          },
        },
      },
    })
    return referral
  } catch (error) {
    console.error('Failed to fetch referral info:', error)
    return null
  }
}

export default async function JobPage({ params, searchParams }: JobPageProps) {
  if (!isValidJobId(params.id)) {
    notFound()
  }

  // Fetch session and job data concurrently
  const [session, job] = await Promise.all([
    getServerSession(authOptions),
    getJobData(params.id),
  ])

  // Check if job exists before proceeding
  if (!job) {
    notFound()
  }

  // Handle referral code
  let referralInfo = null
  const referralCode = searchParams.ref
  if (referralCode) {
    referralInfo = await getReferralData(referralCode)
  }

  // Fetch user-specific application data if a user is logged in
  let userApplication = null;
  if (session?.user?.id) {
    const jobWithApplication = await getJobData(params.id, session.user.id);
    userApplication = Array.isArray(jobWithApplication?.applications) ? jobWithApplication?.applications[0] : null;
  }
  
  const canApply = session?.user?.role === 'CANDIDATE' && !userApplication

  const salaryRange = job.salaryMin && job.salaryMax
    ? `${formatCurrency(job.salaryMin, job.currency)} - ${formatCurrency(job.salaryMax, job.currency)}`
    : job.salaryMin
    ? `From ${formatCurrency(job.salaryMin, job.currency)}`
    : job.salaryMax
    ? `Up to ${formatCurrency(job.salaryMax, job.currency)}`
    : 'Salary not disclosed'

  return (
    <JobErrorBoundary
      jobId={params.id}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Referral Banner */}
        {referralInfo && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">
                    You were referred by {referralInfo.referrer.name}
                  </h3>
                  <p className="text-sm text-blue-700">
                    Apply now and help them earn a referral reward when you get hired!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={job.company.logo || ''} alt={job.company.name} />
                      <AvatarFallback className="text-lg">
                        {getInitials(job.company.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h1 className="text-2xl font-bold">{job.title}</h1>
                      <Link
                        href={`/companies/${job.company.id}`}
                        className="text-lg text-muted-foreground hover:text-primary"
                      >
                        {job.company.name}
                      </Link>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {getRelativeTime(job.createdAt)}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {job._count.applications} applicants
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {job.featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{jobTypeLabels[job.type]}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{experienceLevelLabels[job.experienceLevel]}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{salaryRange}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{job.remote ? 'Remote' : 'On-site'}</span>
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills ? (
                      (typeof job.skills === 'string' ? job.skills.split(',').map(s => s.trim()) : job.skills).map((skill: string) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No specific skills listed</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <div className="whitespace-pre-wrap">{job.description}</div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <div className="whitespace-pre-wrap">{job.requirements}</div>
              </CardContent>
            </Card>

            {/* Responsibilities */}
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <div className="whitespace-pre-wrap">{job.responsibilities}</div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <Card>
              <CardHeader>
                <CardTitle>Apply for this job</CardTitle>
              </CardHeader>
              <CardContent>
                {userApplication ? (
                  <div className="text-center space-y-4">
                    <Badge variant="outline" className="text-sm">
                      Application Status: {userApplication.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Applied on {getRelativeTime(userApplication.appliedAt)}
                    </p>
                    <LinkButton variant="outline" className="w-full" href="/candidate/applications">
                      View Application
                    </LinkButton>
                  </div>
                ) : canApply ? (
                  <ApplyButton jobId={job.id} referralCode={searchParams.ref} />
                ) : !session ? (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Sign in to apply for this job
                    </p>
                    <LinkButton className="w-full" href="/auth/signin">
                      Sign In
                    </LinkButton>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Only candidates can apply for jobs
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>About {job.company.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={job.company.logo || ''} alt={job.company.name} />
                      <AvatarFallback>
                        {getInitials(job.company.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{job.company.name}</h4>
                      <p className="text-sm text-muted-foreground">{job.company.location}</p>
                    </div>
                  </div>

                  {job.company.description && (
                    <p className="text-sm text-muted-foreground">
                      {job.company.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {job.company.size && (
                      <div>
                        <span className="font-medium">Size:</span>
                        <br />
                        <span className="text-muted-foreground">{job.company.size} employees</span>
                      </div>
                    )}
                    {job.company.industry && (
                      <div>
                        <span className="font-medium">Industry:</span>
                        <br />
                        <span className="text-muted-foreground">{job.company.industry}</span>
                      </div>
                    )}
                  </div>

                  {job.company.website && (
                    <LinkButton variant="outline" className="w-full" href={job.company.website}>
                      Visit Website
                    </LinkButton>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recruiter Info */}
            <Card>
              <CardHeader>
                <CardTitle>Recruiter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={job.recruiter.image || ''} alt={job.recruiter.name || ''} />
                    <AvatarFallback>
                      {getInitials(job.recruiter.name || 'R')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">{job.recruiter.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {job.recruiter.profile?.firstName} {job.recruiter.profile?.lastName}
                    </p>
                  </div>
                </div>

                {session?.user?.role === 'CANDIDATE' && (
                  <Button variant="outline" className="w-full mt-4">
                    Message Recruiter
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </JobErrorBoundary>
  )
}