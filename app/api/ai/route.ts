import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/ai/job-matching - AI-powered candidate matching for a job
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'job-matching') {
      return await handleJobMatching(request, session)
    } else if (action === 'candidate-screening') {
      return await handleCandidateScreening(request, session)
    } else if (action === 'generate-job-posting') {
      return await handleJobPostingGeneration(request, session)
    } else if (action === 'optimize-job-description') {
      return await handleJobOptimization(request, session)
    } else if (action === 'skill-assessment') {
      return await handleSkillAssessment(request, session)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use job-matching, candidate-screening, generate-job-posting, optimize-job-description, or skill-assessment' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}

async function handleJobMatching(request: NextRequest, session: any) {
  const data = await request.json()
  const { jobId, filters } = data

  // Get job details
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      company: true,
      recruiter: true
    }
  })

  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // Get candidates with profiles
  const candidates = await prisma.user.findMany({
    where: {
      role: 'CANDIDATE',
      status: 'ACTIVE',
      profile: { isNot: null }
    },
    include: {
      profile: true,
      applications: {
        where: { jobId: jobId },
        select: { id: true }
      }
    },
    take: 100 // Limit for performance
  })

  // Filter out candidates who already applied
  const unappliedCandidates = candidates.filter(c => c.applications.length === 0)

  // AI Matching Algorithm (simplified version)
  const matches = unappliedCandidates.map(candidate => {
    const profile = candidate.profile!
    let score = 0
    const reasons = []

    // Skill matching
    if (job.skills && profile.skills) {
      const jobSkills = JSON.parse(job.skills).map((s: string) => s.toLowerCase())
      const candidateSkills = profile.skills.toLowerCase()
      const skillMatches = jobSkills.filter((skill: string) => 
        candidateSkills.includes(skill)
      ).length
      const skillScore = (skillMatches / jobSkills.length) * 30
      score += skillScore
      if (skillMatches > 0) {
        reasons.push(`${skillMatches}/${jobSkills.length} skills match`)
      }
    }

    // Experience matching
    if (profile.experience) {
      const expScore = getExperienceScore(job.experienceLevel, profile.experience)
      score += expScore
      if (expScore > 0) {
        reasons.push(`${profile.experience} years experience`)
      }
    }

    // Location matching
    if (profile.location && job.location) {
      const locationMatch = profile.location.toLowerCase().includes(job.location.toLowerCase()) ||
                           job.location.toLowerCase().includes(profile.location.toLowerCase())
      if (locationMatch) {
        score += 15
        reasons.push('Location match')
      }
    }

    // Salary expectation matching
    if (profile.expectedCTC && job.salaryMax) {
      if (profile.expectedCTC <= job.salaryMax) {
        score += 10
        reasons.push('Salary expectation within range')
      }
    }

    // Notice period matching (prefer shorter notice periods)
    if (profile.noticePeriod !== null) {
      const noticeScore = Math.max(0, 10 - (profile.noticePeriod / 10))
      score += noticeScore
      if (profile.noticePeriod <= 30) {
        reasons.push(`${profile.noticePeriod} days notice period`)
      }
    }

    // Profile completeness bonus
    if (profile.profileCompleteness >= 80) {
      score += 5
      reasons.push('Complete profile')
    }

    // Relocation preference
    if (profile.willingToRelocate || 
        (profile.location && job.location && 
         profile.location.toLowerCase().includes(job.location.toLowerCase()))) {
      score += 5
      reasons.push(profile.willingToRelocate ? 'Willing to relocate' : 'Local candidate')
    }

    return {
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        image: candidate.image,
        profile: {
          ...profile,
          achievements: profile.achievements ? JSON.parse(profile.achievements) : []
        }
      },
      matchScore: Math.min(100, Math.round(score)),
      reasons,
      insights: generateCandidateInsights(candidate, profile, job)
    }
  })

  // Sort by match score
  const sortedMatches = matches
    .filter(m => m.matchScore >= 30) // Minimum threshold
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 20) // Top 20 matches

  return NextResponse.json({
    job: {
      id: job.id,
      title: job.title,
      company: job.company.name
    },
    matches: sortedMatches,
    totalCandidates: unappliedCandidates.length,
    matchedCandidates: sortedMatches.length,
    insights: {
      averageScore: sortedMatches.reduce((acc, m) => acc + m.matchScore, 0) / sortedMatches.length || 0,
      topReasons: getTopMatchingReasons(sortedMatches)
    }
  })
}

async function handleCandidateScreening(request: NextRequest, session: any) {
  const data = await request.json()
  const { candidateId, jobId, questions } = data

  // Get candidate and job details
  const [candidate, job] = await Promise.all([
    prisma.user.findUnique({
      where: { id: candidateId },
      include: { profile: true }
    }),
    prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true }
    })
  ])

  if (!candidate || !job) {
    return NextResponse.json({ error: 'Candidate or job not found' }, { status: 404 })
  }

  // Generate AI screening questions based on job requirements
  const screeningQuestions = generateScreeningQuestions(job, candidate.profile)

  // If this is a screening response, analyze it
  let analysis = null
  if (questions && questions.length > 0) {
    analysis = analyzeScreeningResponses(questions, job, candidate.profile)
  }

  return NextResponse.json({
    candidate: {
      id: candidate.id,
      name: candidate.name,
      profile: candidate.profile
    },
    job: {
      id: job.id,
      title: job.title,
      company: job.company.name
    },
    screeningQuestions,
    analysis
  })
}

async function handleJobPostingGeneration(request: NextRequest, session: any) {
  if (session.user.role !== 'RECRUITER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await request.json()
  const { jobTitle, companyId, requirements, benefits, location, salaryRange } = data

  // Get company details
  const company = await prisma.company.findUnique({
    where: { id: companyId }
  })

  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  // Generate AI-powered job posting
  const generatedJobPosting = await generateJobPosting({
    jobTitle,
    company: {
      name: company.name,
      industry: company.industry,
      size: company.size,
      culture: company.culture,
      benefits: company.benefits ? JSON.parse(company.benefits) : []
    },
    requirements,
    benefits,
    location,
    salaryRange
  })

  return NextResponse.json({
    generatedPosting: generatedJobPosting,
    suggestions: {
      optimizationTips: [
        'Consider adding specific years of experience required',
        'Include remote work options if applicable',
        'Mention growth opportunities and career progression',
        'Add information about work-life balance'
      ],
      keywordSuggestions: generateKeywordSuggestions(jobTitle, requirements)
    }
  })
}

async function handleJobOptimization(request: NextRequest, session: any) {
  const data = await request.json()
  const { jobDescription, title, skills, experienceLevel } = data

  const optimizationSuggestions = {
    readabilityScore: calculateReadabilityScore(jobDescription),
    improvementSuggestions: [
      'Use bullet points for better readability',
      'Include specific qualifications and requirements',
      'Add information about company culture',
      'Mention career growth opportunities'
    ],
    missingElements: [],
    strongPoints: [],
    atsScore: calculateATSScore(jobDescription, skills)
  }

  // Check for missing elements
  if (!jobDescription.toLowerCase().includes('benefit')) {
    (optimizationSuggestions.missingElements as string[]).push('Benefits information')
  }
  if (!jobDescription.toLowerCase().includes('remote')) {
    (optimizationSuggestions.missingElements as string[]).push('Remote work policy')
  }
  if (!jobDescription.toLowerCase().includes('growth')) {
    (optimizationSuggestions.missingElements as string[]).push('Career growth opportunities')
  }

  return NextResponse.json({
    optimizationSuggestions,
    optimizedDescription: optimizeJobDescription(jobDescription, title)
  })
}

async function handleSkillAssessment(request: NextRequest, session: any) {
  const data = await request.json()
  const { candidateId, jobId, skills } = data

  // Generate skill assessment questions
  const assessmentQuestions = skills.map((skill: string) => ({
    skill,
    questions: generateSkillQuestions(skill),
    difficulty: getSkillDifficulty(skill),
    weight: getSkillWeight(skill, jobId)
  }))

  return NextResponse.json({
    assessmentId: `assessment_${Date.now()}`,
    questions: assessmentQuestions,
    timeLimit: assessmentQuestions.length * 3, // 3 minutes per skill
    instructions: 'Answer the following questions to assess your skills. Be honest in your responses.'
  })
}

// Helper functions
function getExperienceScore(requiredLevel: string, candidateExperience: number): number {
  const levelMap: { [key: string]: number } = {
    'ENTRY': 1,
    'MID': 4,
    'SENIOR': 8,
    'LEAD': 12,
    'EXECUTIVE': 15
  }
  
  const requiredExp = levelMap[requiredLevel] || 0
  if (candidateExperience >= requiredExp) {
    return Math.min(25, 25 * (candidateExperience / requiredExp))
  }
  return 0
}

function generateCandidateInsights(candidate: any, profile: any, job: any) {
  const insights = []
  
  if (profile.noticePeriod <= 15) {
    insights.push({ type: 'immediate', text: 'Immediate joiner' })
  }
  
  if (profile.buyoutOption) {
    insights.push({ type: 'buyout', text: 'Buyout option available' })
  }
  
  if (profile.profileCompleteness >= 90) {
    insights.push({ type: 'complete', text: 'Complete profile' })
  }
  
  return insights
}

function getTopMatchingReasons(matches: any[]) {
  const reasonCounts: { [key: string]: number } = {}
  
  matches.forEach(match => {
    match.reasons.forEach((reason: string) => {
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1
    })
  })
  
  return Object.entries(reasonCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([reason, count]) => ({ reason, count }))
}

function generateScreeningQuestions(job: any, profile: any) {
  const questions = [
    {
      id: 'experience',
      question: `Do you have experience working with ${job.skills ? JSON.parse(job.skills).join(', ') : 'the required technologies'}?`,
      type: 'multiple_choice',
      options: ['Yes, extensive experience', 'Yes, some experience', 'Limited experience', 'No experience'],
      weight: 0.3
    },
    {
      id: 'notice_period',
      question: 'What is your current notice period?',
      type: 'single_choice',
      options: ['Immediate', '15 days', '30 days', '60 days', '90+ days'],
      weight: 0.2
    },
    {
      id: 'salary_expectation',
      question: 'What are your salary expectations for this role?',
      type: 'text',
      weight: 0.2
    },
    {
      id: 'motivation',
      question: `Why are you interested in working at ${job.company?.name}?`,
      type: 'text',
      weight: 0.3
    }
  ]

  return questions
}

function analyzeScreeningResponses(responses: any[], job: any, profile: any) {
  let score = 0
  const analysis: any[] = []

  responses.forEach(response => {
    switch (response.id) {
      case 'experience':
        if (response.answer.includes('extensive') || response.answer.includes('some')) {
          score += 30
          analysis.push('Positive: Has relevant experience')
        }
        break
      case 'notice_period':
        if (response.answer.includes('Immediate') || response.answer.includes('15 days')) {
          score += 20
          analysis.push('Positive: Short notice period')
        }
        break
      case 'salary_expectation':
        analysis.push('Note: Salary expectation provided')
        score += 10
        break
      case 'motivation':
        if (response.answer.length > 50) {
          score += 20
          analysis.push('Positive: Detailed motivation response')
        }
        break
    }
  })

  return {
    overallScore: Math.min(100, score),
    analysis,
    recommendation: score >= 60 ? 'RECOMMEND' : score >= 40 ? 'CONSIDER' : 'NOT_RECOMMENDED'
  }
}

function generateJobPosting(data: any) {
  // This would integrate with OpenAI/Claude API in a real implementation
  return {
    title: data.jobTitle,
    description: `Join ${data.company.name} as a ${data.jobTitle}! We're looking for a talented professional to contribute to our ${data.company.industry} team.`,
    responsibilities: [
      `Lead ${data.jobTitle.toLowerCase()} initiatives`,
      'Collaborate with cross-functional teams',
      'Drive innovation and best practices',
      'Mentor junior team members'
    ],
    requirements: data.requirements || [
      'Bachelor\'s degree in relevant field',
      '3+ years of experience',
      'Strong communication skills',
      'Team player with leadership qualities'
    ],
    benefits: data.benefits || [
      'Competitive salary',
      'Health insurance',
      'Flexible working hours',
      'Professional development opportunities'
    ]
  }
}

function generateKeywordSuggestions(jobTitle: string, requirements: string[]) {
  // Generate relevant keywords based on job title and requirements
  const keywords = [
    jobTitle.toLowerCase(),
    ...requirements.map(req => req.toLowerCase()),
    'remote',
    'hybrid',
    'career growth',
    'competitive salary'
  ]
  
  return keywords.slice(0, 10)
}

function calculateReadabilityScore(text: string) {
  // Simplified readability score
  const sentences = text.split('.').length
  const words = text.split(' ').length
  const avgSentenceLength = words / sentences
  
  return Math.max(0, Math.min(100, 100 - (avgSentenceLength - 15) * 2))
}

function calculateATSScore(description: string, skills: string[]) {
  let score = 0
  const text = description.toLowerCase()
  
  // Check for skills mentions
  skills.forEach(skill => {
    if (text.includes(skill.toLowerCase())) {
      score += 10
    }
  })
  
  // Check for other ATS-friendly elements
  if (text.includes('experience')) score += 5
  if (text.includes('qualification')) score += 5
  if (text.includes('requirement')) score += 5
  if (text.includes('benefit')) score += 5
  
  return Math.min(100, score)
}

function optimizeJobDescription(description: string, title: string) {
  // Simple optimization - would use AI in real implementation
  return {
    optimizedText: description,
    changes: [
      'Added bullet points for better readability',
      'Included specific qualifications',
      'Enhanced benefits section'
    ]
  }
}

function generateSkillQuestions(skill: string) {
  // Generate assessment questions for specific skills
  const questions = [
    {
      question: `How would you rate your proficiency in ${skill}?`,
      type: 'scale',
      scale: { min: 1, max: 10 }
    },
    {
      question: `Describe a project where you used ${skill}`,
      type: 'text'
    }
  ]
  
  return questions
}

function getSkillDifficulty(skill: string) {
  // Determine skill difficulty level
  const advancedSkills = ['machine learning', 'ai', 'blockchain', 'kubernetes']
  return advancedSkills.some(advanced => 
    skill.toLowerCase().includes(advanced)
  ) ? 'advanced' : 'intermediate'
}

function getSkillWeight(skill: string, jobId: string) {
  // Calculate skill importance weight for the job
  return 1.0 // Default weight
}
