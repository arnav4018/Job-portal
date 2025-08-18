'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, Briefcase } from 'lucide-react'

export function JobSearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [query, setQuery] = useState(searchParams.get('query') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [type, setType] = useState(searchParams.get('type') || 'ALL')
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experienceLevel') || 'ALL')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (query) params.set('query', query)
    if (location) params.set('location', location)
    if (type && type !== 'ALL') params.set('type', type)
    if (experienceLevel && experienceLevel !== 'ALL') params.set('experienceLevel', experienceLevel)
    
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Job Title/Keywords */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Job title, keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 text-black"
          />
        </div>
        
        {/* Location */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10 text-black"
          />
        </div>
        
        {/* Job Type */}
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="text-black">
            <Briefcase className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="FULL_TIME">Full Time</SelectItem>
            <SelectItem value="PART_TIME">Part Time</SelectItem>
            <SelectItem value="CONTRACT">Contract</SelectItem>
            <SelectItem value="INTERNSHIP">Internship</SelectItem>
            <SelectItem value="FREELANCE">Freelance</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Experience Level */}
        <Select value={experienceLevel} onValueChange={setExperienceLevel}>
          <SelectTrigger className="text-black">
            <SelectValue placeholder="Experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Levels</SelectItem>
            <SelectItem value="ENTRY">Entry Level</SelectItem>
            <SelectItem value="MID">Mid Level</SelectItem>
            <SelectItem value="SENIOR">Senior Level</SelectItem>
            <SelectItem value="LEAD">Lead</SelectItem>
            <SelectItem value="EXECUTIVE">Executive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="mt-4 flex justify-center">
        <Button type="submit" size="lg" className="w-full md:w-auto px-8">
          <Search className="h-4 w-4 mr-2" />
          Search Jobs
        </Button>
      </div>
    </form>
  )
}