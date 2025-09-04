import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/filters/smart - Get smart filtered results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filterType = searchParams.get('type') // 'jobs' or 'candidates'
    const filterName = searchParams.get('filter') // 'high-paying', 'local', etc.
    const location = searchParams.get('location')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const skip = (page - 1) * limit

    if (filterType === 'jobs') {
      return await getSmartJobFilters(filterName, location, skip, limit)
    } else if (filterType === 'candidates') {
      return await getSmartCandidateFilters(filterName, location, skip, limit)
    } else {
      return NextResponse.json(
        { error: 'Invalid filter type. Use "jobs" or "candidates"' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Smart filter error:', error)
    return NextResponse.json(
      { error: 'Failed to apply smart filters' },
      { status: 500 }
    )
  }
}

async function getSmartJobFilters(filterName: string | null, location: string | null, skip: number, limit: number) {
  let whereClause: any = { status: 'PUBLISHED' }

  switch (filterName) {
    case 'high-paying':
      // Jobs with salary > 80% percentile
      whereClause.salaryMin = { gte: 800000 } // 8 LPA and above
      break

    case 'urgent':
      whereClause.urgency = 'URGENT'
      break

    case 'remote':
      whereClause.remote = true
      break

    case 'local':
      if (location) {
        whereClause.location = { contains: location }
      }
      break

    case 'early-joiners':
      // Jobs that prefer immediate joiners (no notice period preference)
      whereClause.OR = [
        { description: { contains: 'immediate' } },
        { description: { contains: 'ASAP' } },
        { requirements: { contains: 'immediate' } }
      ]
      break

    case 'no-travel':
      whereClause.travelRequired = false
      break

    case 'flexible-timing':
      whereClause.workTimings = { not: null }
      break

    case 'featured':
      whereClause.featured = true
      break

    default:
      // Return all published jobs if no specific filter
      break
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where: whereClause,
      include: {
        company: {
          select: {
            name: true,
            logo: true,
            location: true,
            size: true,
            workingDays: true,
            travelRequired: true,
            benefits: true,
          }
        },
        recruiter: {
          select: {
            name: true,
            image: true,
          }
        },
        _count: {
          select: {
            applications: true,
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { salaryMax: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit,
    }),
    prisma.job.count({ where: whereClause })
  ])

  // Parse JSON fields and add smart insights
  const jobsWithInsights = jobs.map(job => ({
    ...job,
    skills: job.skills ? JSON.parse(job.skills) : [],
    company: {
      ...job.company,
      benefits: job.company.benefits ? JSON.parse(job.company.benefits) : [],
    },
    smartInsights: getJobSmartInsights(job)
  }))

  return NextResponse.json({
    jobs: jobsWithInsights,
    filterApplied: filterName,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    insights: {
      averageSalary: jobs.reduce((acc, job) => acc + (job.salaryMax || 0), 0) / jobs.length,
      totalJobs: total,
      remoteJobs: jobs.filter(job => job.remote).length,
      urgentJobs: jobs.filter(job => job.urgency === 'URGENT').length,
    }
  })
}

async function getSmartCandidateFilters(filterName: string | null, location: string | null, skip: number, limit: number) {
  let whereClause: any = { 
    role: 'CANDIDATE',
    status: 'ACTIVE',
    profile: { isNot: null }
  }

  let profileWhere: any = {}

  switch (filterName) {
    case 'cost-effective':
      profileWhere.expectedCTC = { lte: 600000 } // 6 LPA and below
      break

    case 'experienced':
      profileWhere.experience = { gte: 5 }
      break

    case 'highly-skilled':
      profileWhere.profileCompleteness = { gte: 80 }
      break

    case 'early-joiners':
      profileWhere.noticePeriod = { lte: 30 } // 30 days or less
      break

    case 'local':
      if (location) {
        profileWhere.location = { contains: location }
      }
      break

    case 'willing-to-relocate':
      profileWhere.willingToRelocate = true
      break

    case 'immediate-joiners':
      profileWhere.noticePeriod = { lte: 15 } // 15 days or immediate
      break

    case 'buyout-candidates':
      profileWhere.buyoutOption = true
      break

    case 'leadership':
      profileWhere.numberOfReportees = { gte: 1 }
      break

    default:
      // Return all active candidates if no specific filter
      break
  }

  if (Object.keys(profileWhere).length > 0) {
    whereClause.profile = { ...whereClause.profile, ...profileWhere }
  }

  const [candidates, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      include: {
        profile: true,
        _count: {
          select: {
            applications: true,
            resumes: true,
          }
        }
      },
      orderBy: [
        { profile: { profileCompleteness: 'desc' } },
        { profile: { experience: 'desc' } },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit,
    }),
    prisma.user.count({ where: whereClause })
  ])

  // Parse JSON fields and add smart insights
  const candidatesWithInsights = candidates.map(candidate => ({
    ...candidate,
    profile: candidate.profile ? {
      ...candidate.profile,
      achievements: candidate.profile.achievements ? JSON.parse(candidate.profile.achievements) : [],
    } : null,
    smartInsights: getCandidateSmartInsights(candidate)
  }))

  return NextResponse.json({
    candidates: candidatesWithInsights,
    filterApplied: filterName,
    pagination: {
      page: Math.floor(skip / limit) + 1,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    insights: {
      averageExperience: candidates.reduce((acc, c) => acc + (c.profile?.experience || 0), 0) / candidates.length,
      averageExpectedCTC: candidates.reduce((acc, c) => acc + (c.profile?.expectedCTC || 0), 0) / candidates.length,
      totalCandidates: total,
      immediateJoiners: candidates.filter(c => (c.profile?.noticePeriod || 0) <= 15).length,
      willingToRelocate: candidates.filter(c => c.profile?.willingToRelocate).length,
    }
  })
}

function getJobSmartInsights(job: any) {
  const insights = []
  
  if (job.salaryMin && job.salaryMin >= 1000000) {
    insights.push("High paying position")
  }
  
  if (job.urgency === 'URGENT') {
    insights.push("Urgent hiring")
  }
  
  if (job.remote) {
    insights.push("Remote work available")
  }
  
  if (!job.travelRequired) {
    insights.push("No travel required")
  }
  
  if (job.featured) {
    insights.push("Featured job")
  }

  return insights
}

function getCandidateSmartInsights(candidate: any) {
  const insights: any[] = []
  const profile = candidate.profile
  
  if (!profile) return insights
  
  if (profile.profileCompleteness >= 90) {
    insights.push("Complete profile")
  }
  
  if (profile.noticePeriod <= 15) {
    insights.push("Immediate joiner")
  }
  
  if (profile.buyoutOption) {
    insights.push("Buyout available")
  }
  
  if (profile.willingToRelocate) {
    insights.push("Willing to relocate")
  }
  
  if (profile.numberOfReportees && profile.numberOfReportees > 0) {
    insights.push(`${profile.numberOfReportees} reportees`)
  }
  
  if (profile.experience >= 10) {
    insights.push("Senior professional")
  }

  return insights
}

// POST /api/filters/smart - Save a smart filter
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { name, type, filters } = data

    const savedFilter = await prisma.savedFilter.create({
      data: {
        userId: session.user.id,
        name,
        type, // JOB_FILTER or CANDIDATE_FILTER
        filters: JSON.stringify(filters),
      }
    })

    return NextResponse.json(savedFilter, { status: 201 })
  } catch (error) {
    console.error('Save filter error:', error)
    return NextResponse.json(
      { error: 'Failed to save filter' },
      { status: 500 }
    )
  }
}
