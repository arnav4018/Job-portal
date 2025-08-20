// Enhanced AI-powered job matching system
import { calculateSkillMatch } from './utils'

export interface MatchingResult {
  overallScore: number
  skillMatch: number
  experienceMatch: number
  locationMatch: number
  salaryMatch: number
  breakdown: {
    matchedSkills: string[]
    missingSkills: string[]
    partialSkills: string[]
    recommendations: string[]
  }
}

export interface CandidateProfile {
  skills: string[]
  experience: number
  location: string
  expectedSalary?: number
  jobType?: string
  remote?: boolean
}

export interface JobRequirements {
  skills: string[]
  experienceLevel: string
  location: string
  salaryMin?: number
  salaryMax?: number
  remote?: boolean
  type: string
}

// Enhanced skill matching with AI-like features
export function calculateEnhancedMatch(
  candidate: CandidateProfile,
  job: JobRequirements
): MatchingResult {
  // 1. Skill Matching (40% weight)
  const skillScore = calculateSkillMatch(job.skills, candidate.skills)
  
  // 2. Experience Matching (25% weight)
  const experienceScore = calculateExperienceMatch(candidate.experience, job.experienceLevel)
  
  // 3. Location Matching (20% weight)
  const locationScore = calculateLocationMatch(candidate, job)
  
  // 4. Salary Matching (15% weight)
  const salaryScore = calculateSalaryMatch(candidate.expectedSalary, job.salaryMin, job.salaryMax)
  
  // Calculate weighted overall score
  const overallScore = Math.round(
    (skillScore * 0.4) +
    (experienceScore * 0.25) +
    (locationScore * 0.2) +
    (salaryScore * 0.15)
  )
  
  // Generate detailed breakdown
  const breakdown = generateMatchBreakdown(candidate.skills, job.skills)
  
  return {
    overallScore,
    skillMatch: skillScore,
    experienceMatch: experienceScore,
    locationMatch: locationScore,
    salaryMatch: salaryScore,
    breakdown
  }
}

function calculateExperienceMatch(candidateExp: number, jobLevel: string): number {
  const experienceRanges = {
    'ENTRY': { min: 0, max: 2 },
    'MID': { min: 2, max: 5 },
    'SENIOR': { min: 5, max: 10 },
    'LEAD': { min: 8, max: 15 },
    'EXECUTIVE': { min: 10, max: 25 }
  }
  
  const range = experienceRanges[jobLevel as keyof typeof experienceRanges]
  if (!range) return 50
  
  if (candidateExp >= range.min && candidateExp <= range.max) {
    return 100
  } else if (candidateExp < range.min) {
    // Under-qualified
    const deficit = range.min - candidateExp
    return Math.max(0, 100 - (deficit * 20))
  } else {
    // Over-qualified
    const excess = candidateExp - range.max
    return Math.max(70, 100 - (excess * 5))
  }
}

function calculateLocationMatch(candidate: CandidateProfile, job: JobRequirements): number {
  // Remote work preference
  if (job.remote && candidate.remote) return 100
  if (job.remote && !candidate.remote) return 80
  if (!job.remote && candidate.remote) return 60
  
  // Location matching
  if (candidate.location.toLowerCase() === job.location.toLowerCase()) {
    return 100
  }
  
  // City/state partial matching
  const candidateParts = candidate.location.toLowerCase().split(',').map(s => s.trim())
  const jobParts = job.location.toLowerCase().split(',').map(s => s.trim())
  
  const commonParts = candidateParts.filter(part => 
    jobParts.some(jobPart => jobPart.includes(part) || part.includes(jobPart))
  )
  
  return commonParts.length > 0 ? 70 : 30
}

function calculateSalaryMatch(expectedSalary?: number, salaryMin?: number, salaryMax?: number): number {
  if (!expectedSalary || (!salaryMin && !salaryMax)) return 100
  
  const jobSalaryMid = salaryMin && salaryMax ? (salaryMin + salaryMax) / 2 : (salaryMin || salaryMax || 0)
  
  if (!jobSalaryMid) return 100
  
  const difference = Math.abs(expectedSalary - jobSalaryMid)
  const percentageDiff = (difference / expectedSalary) * 100
  
  if (percentageDiff <= 10) return 100
  if (percentageDiff <= 20) return 80
  if (percentageDiff <= 30) return 60
  return 40
}

function generateMatchBreakdown(candidateSkills: string[], jobSkills: string[]) {
  const normalizedCandidateSkills = candidateSkills.map(s => s.toLowerCase().trim())
  const normalizedJobSkills = jobSkills.map(s => s.toLowerCase().trim())
  
  const matchedSkills: string[] = []
  const partialSkills: string[] = []
  const missingSkills: string[] = []
  
  jobSkills.forEach(jobSkill => {
    const normalizedJobSkill = jobSkill.toLowerCase().trim()
    
    if (normalizedCandidateSkills.includes(normalizedJobSkill)) {
      matchedSkills.push(jobSkill)
    } else {
      // Check for partial matches
      const hasPartialMatch = normalizedCandidateSkills.some(candidateSkill => {
        const jobParts = normalizedJobSkill.split(/[\s\-\.]/).filter(part => part.length > 2)
        const candidateParts = candidateSkill.split(/[\s\-\.]/).filter(part => part.length > 2)
        
        return jobParts.some(jobPart =>
          candidateParts.some(candidatePart =>
            jobPart.includes(candidatePart) || candidatePart.includes(jobPart)
          )
        )
      })
      
      if (hasPartialMatch) {
        partialSkills.push(jobSkill)
      } else {
        missingSkills.push(jobSkill)
      }
    }
  })
  
  // Generate recommendations
  const recommendations: string[] = []
  if (missingSkills.length > 0) {
    recommendations.push(`Consider learning: ${missingSkills.slice(0, 3).join(', ')}`)
  }
  if (partialSkills.length > 0) {
    recommendations.push(`Strengthen your knowledge in: ${partialSkills.slice(0, 2).join(', ')}`)
  }
  if (matchedSkills.length === jobSkills.length) {
    recommendations.push('Perfect skill match! You\'re an ideal candidate.')
  }
  
  return {
    matchedSkills,
    missingSkills,
    partialSkills,
    recommendations
  }
}

// AI-powered job recommendations
export function getJobRecommendations(
  candidate: CandidateProfile,
  allJobs: (JobRequirements & { id: string; title: string })[]
): Array<{ job: JobRequirements & { id: string; title: string }, match: MatchingResult }> {
  return allJobs
    .map(job => ({
      job,
      match: calculateEnhancedMatch(candidate, job)
    }))
    .filter(item => item.match.overallScore >= 60) // Only show jobs with 60%+ match
    .sort((a, b) => b.match.overallScore - a.match.overallScore)
    .slice(0, 10) // Top 10 recommendations
}

// Smart search with AI filtering
export function smartJobSearch(
  query: string,
  candidate: CandidateProfile,
  allJobs: (JobRequirements & { id: string; title: string; description: string })[]
) {
  // 1. Text-based search
  const textMatches = allJobs.filter(job => 
    job.title.toLowerCase().includes(query.toLowerCase()) ||
    job.description.toLowerCase().includes(query.toLowerCase())
  )
  
  // 2. Apply AI matching
  const scoredJobs = textMatches.map(job => ({
    job,
    match: calculateEnhancedMatch(candidate, job)
  }))
  
  // 3. Smart sorting (combine relevance + match score)
  return scoredJobs
    .sort((a, b) => {
      // Prioritize high match scores
      const matchDiff = b.match.overallScore - a.match.overallScore
      if (Math.abs(matchDiff) > 10) return matchDiff
      
      // Then by text relevance (title matches first)
      const aInTitle = a.job.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0
      const bInTitle = b.job.title.toLowerCase().includes(query.toLowerCase()) ? 1 : 0
      return bInTitle - aInTitle
    })
}

// Skill gap analysis
export function analyzeSkillGaps(
  candidate: CandidateProfile,
  targetJobs: JobRequirements[]
): {
  mostInDemandSkills: Array<{ skill: string; frequency: number }>
  skillGaps: string[]
  learningPath: Array<{ skill: string; priority: 'high' | 'medium' | 'low' }>
} {
  // Count skill frequency across target jobs
  const skillFrequency: Record<string, number> = {}
  
  targetJobs.forEach(job => {
    job.skills.forEach(skill => {
      const normalizedSkill = skill.toLowerCase().trim()
      skillFrequency[normalizedSkill] = (skillFrequency[normalizedSkill] || 0) + 1
    })
  })
  
  const candidateSkillsNormalized = candidate.skills.map(s => s.toLowerCase().trim())
  
  // Find skill gaps
  const skillGaps = Object.keys(skillFrequency)
    .filter(skill => !candidateSkillsNormalized.includes(skill))
    .sort((a, b) => skillFrequency[b] - skillFrequency[a])
  
  // Create learning path
  const learningPath = skillGaps.map(skill => ({
    skill,
    priority: skillFrequency[skill] >= 3 ? 'high' as const :
              skillFrequency[skill] >= 2 ? 'medium' as const : 'low' as const
  }))
  
  return {
    mostInDemandSkills: Object.entries(skillFrequency)
      .map(([skill, frequency]) => ({ skill, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10),
    skillGaps: skillGaps.slice(0, 10),
    learningPath: learningPath.slice(0, 5)
  }
}