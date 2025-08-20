import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MapPin, 
  Clock, 
  Briefcase, 
  Users, 
  Star,
  ExternalLink
} from 'lucide-react'
import { formatCurrency, getRelativeTime, getInitials } from '@/lib/utils'

interface JobCardProps {
  job: {
    id: string
    title: string
    description: string
    type: string
    experienceLevel: string
    location: string
    remote: boolean
    salaryMin: number | null
    salaryMax: number | null
    currency: string
    featured: boolean
    createdAt: Date
    skills: string[]
    company: {
      name: string
      logo: string | null
      location: string | null
    }
    recruiter: {
      name: string | null
      image: string | null
    }
    _count: {
      applications: number
    }
  }
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

export function JobCard({ job }: JobCardProps) {
  const salaryRange = job.salaryMin && job.salaryMax 
    ? `${formatCurrency(job.salaryMin, job.currency)} - ${formatCurrency(job.salaryMax, job.currency)}`
    : job.salaryMin 
    ? `From ${formatCurrency(job.salaryMin, job.currency)}`
    : job.salaryMax
    ? `Up to ${formatCurrency(job.salaryMax, job.currency)}`
    : null

  return (
    <Card className="job-card h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={job.company.logo || ''} alt={job.company.name} />
              <AvatarFallback>
                {getInitials(job.company.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground truncate">
                {job.company.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {getRelativeTime(job.createdAt)}
              </p>
            </div>
          </div>
          {job.featured && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
        
        <CardTitle className="text-lg leading-tight">
          <Link 
            href={`/jobs/${job.id}`}
            className="hover:text-primary transition-colors"
          >
            {job.title}
          </Link>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-3 flex-1">
          {/* Location and Remote */}
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{job.location}</span>
            {job.remote && (
              <Badge variant="outline" className="ml-2 text-xs">
                Remote
              </Badge>
            )}
          </div>
          
          {/* Job Type and Experience */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <Briefcase className="h-3 w-3 mr-1" />
              {jobTypeLabels[job.type]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {experienceLevelLabels[job.experienceLevel]}
            </Badge>
          </div>
          
          {/* Salary */}
          {salaryRange && (
            <div className="text-sm font-medium text-green-600">
              {salaryRange}
            </div>
          )}
          
          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.description}
          </p>
          
          {/* Skills */}
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {job.skills.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{job.skills.length - 3} more
              </Badge>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t">
          <div className="flex items-center text-xs text-muted-foreground">
            <Users className="h-3 w-3 mr-1" />
            <span>{job._count.applications} applicants</span>
          </div>
          
          <Button size="sm" asChild>
            <Link href={`/jobs/${job.id}`}>
              View Details
              <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}