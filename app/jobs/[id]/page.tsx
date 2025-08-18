import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { JobDetailView } from '@/components/jobs/job-detail-view'
import { ApplyButton } from '@/components/jobs/apply-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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
import { formatCurrency, formatRelativeTime, getInitials } from '@/lib/utils'
import Link from 'next/link'

interface JobPageProps {
  params: { id: string }
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

export default async function JobPage({ params }: JobPageProps) {
  const session = await getServerSession(authOptions)
  
  const job = await prisma.job.findUnique({
    where: { id: params.id },
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
      applications: session?.user ? {
        where: {
          candidateId: session.user.id,
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

  if (!job) {
    notFound()
  }

  const userApplication = Array.isArray(job.applications) ? job.applications[0] : null
  const canApply = session?.user?.role === 'CANDIDATE' && !userApplication

  const salaryRange = job.salaryMin && job.salaryMax 
    ? `${formatCurrency(job.salaryMin, job.currency)} - ${formatCurrency(job.salaryMax, job.currency)}`
    : job.salaryMin 
    ? `From ${formatCurrency(job.salaryMin, job.currency)}`
    : job.salaryMax
    ? `Up to ${formatCurrency(job.salaryMax, job.currency)}`
    : 'Salary not disclosed'

  return (
    <div className="container mx-auto px-4 py-8">
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
                        {formatRelativeTime(job.createdAt)}
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
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
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
                    Applied on {formatRelativeTime(userApplication.appliedAt)}
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/candidate/applications">
                      View Application
                    </Link>
                  </Button>
                </div>
              ) : canApply ? (
                <ApplyButton jobId={job.id} />
              ) : !session ? (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Sign in to apply for this job
                  </p>
                  <Button className="w-full" asChild>
                    <Link href="/auth/signin">Sign In</Link>
                  </Button>
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
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={job.company.website} target="_blank">
                      Visit Website
                    </Link>
                  </Button>
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
  )
}