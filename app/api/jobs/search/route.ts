import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { jobSearchSchema } from '@/lib/validations'
import { calculateSkillMatch } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const session = await getServerSession(authOptions)
    
    // Parse and validate search parameters
    const searchData = {
      query: searchParams.get('query') || undefined,
      location: searchParams.get('location') || undefined,
      type: searchParams.get('type') || undefined,
      experienceLevel: searchParams.get('experienceLevel') || undefined,
      remote: searchParams.get('remote') === 'true' ? true : undefined,
      salaryMin: searchParams.get('salaryMin') ? parseInt(searchParams.get('salaryMin')!) : undefined,
      salaryMax: searchParams.get('salaryMax') ? parseInt(searchParams.get('salaryMax')!) : undefined,
      skills: searchParams.get('skills') ? searchParams.get('skills')!.split(',') : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    }

    const validatedData = jobSearchSchema.parse(searchData)
    const skip = (validatedData.page - 1) * validatedData.limit

    // Build where clause
    let where: any = {
      status: 'PUBLISHED',
      expiresAt: {
        gte: new Date(),
      },
    }

    // Full-text search on title and description
    if (validatedData.query) {
      where.OR = [
        {
          title: {
            contains: validatedData.query,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: validatedData.query,
            mode: 'insensitive',
          },
        },
        {
          requirements: {
            contains: validatedData.query,
            mode: 'insensitive',
          },
        },
        {
          company: {
            name: {
              contains: validatedData.query,
              mode: 'insensitive',
            },
          },
        },
      ]
    }

    // Location filter
    if (validatedData.location) {
      where.location = {
        contains: validatedData.location,
        mode: 'insensitive',
      }
    }

    // Job type filter
    if (validatedData.type) {
      where.type = validatedData.type
    }

    // Experience level filter
    if (validatedData.experienceLevel) {
      where.experienceLevel = validatedData.experienceLevel
    }

    // Remote filter
    if (validatedData.remote !== undefined) {
      where.remote = validatedData.remote
    }

    // Salary filters
    if (validatedData.salaryMin || validatedData.salaryMax) {
      where.AND = []
      if (validatedData.salaryMin) {
        where.AND.push({
          OR: [
            { salaryMax: { gte: validatedData.salaryMin } },
            { salaryMin: { gte: validatedData.salaryMin } },
          ],
        })
      }
      if (validatedData.salaryMax) {
        where.AND.push({
          OR: [
            { salaryMin: { lte: validatedData.salaryMax } },
            { salaryMax: { lte: validatedData.salaryMax } },
          ],
        })
      }
    }

    // Skills filter
    if (validatedData.skills && validatedData.skills.length > 0) {
      where.skills = {
        contains: validatedData.skills.join('|'),
        mode: 'insensitive',
      }
    }

    // Build order by clause
    let orderBy: any = {}
    if (validatedData.sortBy === 'salary') {
      orderBy = [
        { salaryMax: validatedData.sortOrder },
        { salaryMin: validatedData.sortOrder },
      ]
    } else if (validatedData.sortBy === 'views') {
      orderBy.views = validatedData.sortOrder
    } else if (validatedData.sortBy === 'createdAt') {
      orderBy.createdAt = validatedData.sortOrder
    }

    // Execute search
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              location: true,
              verified: true,
            },
          },
          recruiter: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy,
        skip,
        take: validatedData.limit,
      }),
      prisma.job.count({ where }),
    ])

    // Calculate skill match scores if user is logged in and has skills
    let jobsWithMatchScores: (typeof jobs[0] & { matchScore?: number })[] = jobs
    if (session?.user && session.user.role === 'CANDIDATE') {
      const candidate = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { profile: true },
      })

      if (candidate?.profile?.skills) {
        const candidateSkills = JSON.parse(candidate.profile.skills)
        jobsWithMatchScores = jobs.map(job => {
          const jobSkills = job.skills ? JSON.parse(job.skills) : []
          const matchScore = calculateSkillMatch(jobSkills, candidateSkills)
          return {
            ...job,
            matchScore,
          }
        })

        // Sort by match score if requested
        if (validatedData.sortBy === 'matchScore') {
          jobsWithMatchScores.sort((a, b) => {
            const scoreA = a.matchScore || 0
            const scoreB = b.matchScore || 0
            return validatedData.sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB
          })
        }
      }
    }

    // Update view counts for displayed jobs (async)
    if (jobs.length > 0) {
      prisma.job.updateMany({
        where: {
          id: {
            in: jobs.map(job => job.id),
          },
        },
        data: {
          views: {
            increment: 1,
          },
        },
      }).catch(error => {
        console.error('Failed to update view counts:', error)
      })
    }

    // Save search query for analytics
    if (validatedData.query || validatedData.location || validatedData.skills) {
      prisma.jobSearch.create({
        data: {
          userId: session?.user?.id,
          query: validatedData.query,
          filters: JSON.stringify({
            location: validatedData.location,
            type: validatedData.type,
            experienceLevel: validatedData.experienceLevel,
            remote: validatedData.remote,
            salaryMin: validatedData.salaryMin,
            salaryMax: validatedData.salaryMax,
            skills: validatedData.skills,
          }),
          results: total,
        },
      }).catch(error => {
        console.error('Failed to save search query:', error)
      })
    }

    return NextResponse.json({
      jobs: jobsWithMatchScores,
      pagination: {
        page: validatedData.page,
        limit: validatedData.limit,
        total,
        pages: Math.ceil(total / validatedData.limit),
      },
      filters: {
        query: validatedData.query,
        location: validatedData.location,
        type: validatedData.type,
        experienceLevel: validatedData.experienceLevel,
        remote: validatedData.remote,
        salaryMin: validatedData.salaryMin,
        salaryMax: validatedData.salaryMax,
        skills: validatedData.skills,
      },
    })
  } catch (error) {
    console.error('Job search error:', error)
    return NextResponse.json(
      { error: 'Failed to search jobs' },
      { status: 500 }
    )
  }
}