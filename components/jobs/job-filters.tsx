'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface JobFiltersProps {
  searchParams: {
    query?: string
    location?: string
    type?: string
    experienceLevel?: string
    remote?: string
    salaryMin?: string
    salaryMax?: string
    skills?: string
    page?: string
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

const popularSkills = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'TypeScript',
  'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'GraphQL',
  'Next.js', 'Vue.js', 'Angular', 'PHP', 'Laravel', 'Django',
  'Machine Learning', 'Data Science', 'DevOps', 'UI/UX Design'
]

export function JobFilters({ searchParams }: JobFiltersProps) {
  const router = useRouter()
  const currentSearchParams = useSearchParams()
  
  const [salaryMin, setSalaryMin] = useState(searchParams.salaryMin || '')
  const [salaryMax, setSalaryMax] = useState(searchParams.salaryMax || '')
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    searchParams.skills ? searchParams.skills.split(',') : []
  )

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(currentSearchParams.toString())
    
    if (value && value !== '' && value !== 'ALL') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    
    // Reset to first page when filters change
    params.delete('page')
    
    router.push(`/jobs?${params.toString()}`)
  }

  const toggleSkill = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill]
    
    setSelectedSkills(newSkills)
    updateFilter('skills', newSkills.length > 0 ? newSkills.join(',') : null)
  }

  const clearAllFilters = () => {
    setSalaryMin('')
    setSalaryMax('')
    setSelectedSkills([])
    router.push('/jobs')
  }

  const hasActiveFilters = Object.values(searchParams).some(value => value && value !== '')

  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Active Filters</span>
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear All
          </Button>
        </div>
      )}

      {/* Job Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Job Type</Label>
        <Select
          value={searchParams.type || 'ALL'}
          onValueChange={(value) => updateFilter('type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {Object.entries(jobTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Experience Level */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Experience Level</Label>
        <Select
          value={searchParams.experienceLevel || 'ALL'}
          onValueChange={(value) => updateFilter('experienceLevel', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Levels</SelectItem>
            {Object.entries(experienceLevelLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Remote Work */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remote"
            checked={searchParams.remote === 'true'}
            onCheckedChange={(checked) => 
              updateFilter('remote', checked ? 'true' : null)
            }
          />
          <Label htmlFor="remote" className="text-sm font-medium">
            Remote Work
          </Label>
        </div>
      </div>

      <Separator />

      {/* Salary Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Salary Range (₹)</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Input
              placeholder="Min"
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              onBlur={() => updateFilter('salaryMin', salaryMin)}
            />
          </div>
          <div>
            <Input
              placeholder="Max"
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              onBlur={() => updateFilter('salaryMax', salaryMax)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Skills */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Skills</Label>
        
        {/* Selected Skills */}
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {selectedSkills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs">
                {skill}
                <button
                  onClick={() => toggleSkill(skill)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        
        {/* Popular Skills */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {popularSkills.map((skill) => (
            <div key={skill} className="flex items-center space-x-2">
              <Checkbox
                id={skill}
                checked={selectedSkills.includes(skill)}
                onCheckedChange={() => toggleSkill(skill)}
              />
              <Label htmlFor={skill} className="text-sm">
                {skill}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}