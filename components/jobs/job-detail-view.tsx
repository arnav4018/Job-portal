"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Clock, DollarSign, Users, Briefcase } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Job } from "@prisma/client"

interface JobDetailViewProps {
  job: Job & {
    company: {
      name: string
      logo: string | null
      description: string | null
    }
  }
  canApply?: boolean
  onApply?: () => void
}

export function JobDetailView({ job, canApply = false, onApply }: JobDetailViewProps) {
  const [showFullDescription, setShowFullDescription] = useState(false)

  const skills = job.skills ? JSON.parse(job.skills) : []
  const requirements = job.requirements ? JSON.parse(job.requirements) : []
  const responsibilities = job.responsibilities ? JSON.parse(job.responsibilities) : []

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              <CardDescription className="text-lg">
                {job.company.name}
              </CardDescription>
            </div>
            {job.company.logo && (
              <img
                src={job.company.logo}
                alt={job.company.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{job.type.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span>
                {job.salaryMin && job.salaryMax
                  ? `${job.currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                  : "Not specified"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">
              {showFullDescription || job.description.length <= 300
                ? job.description
                : `${job.description.substring(0, 300)}...`}
              {job.description.length > 300 && (
                <Button
                  variant="link"
                  className="ml-2"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? "Show less" : "Show more"}
                </Button>
              )}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Requirements</h3>
            <ul className="list-disc list-inside space-y-1">
              {requirements.map((req: string, index: number) => (
                <li key={index} className="text-muted-foreground">
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Responsibilities</h3>
            <ul className="list-disc list-inside space-y-1">
              {responsibilities.map((resp: string, index: number) => (
                <li key={index} className="text-muted-foreground">
                  {resp}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {canApply && onApply && (
            <div className="pt-4">
              <Button onClick={onApply} className="w-full">
                Apply for this position
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
