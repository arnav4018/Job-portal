import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { jobSchema, jobSearchSchema } from '@/lib/validations'

// GET /api/jobs - Search and list jobs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    
    // Convert string params to appropriate types
    const searchData = {
      ...params,
      page: params.page ? parseInt(params.page) : 1,
      limit: params.limit ? parseInt(params.limit) : 10,
      salaryMin: params.salaryMin ? parseInt(params.salaryMin) : undefined,
      salaryMax: params.salaryMax ? parseInt(params.salaryMax) : undefined,
      remote: params.remote === 'true',
      skills: params.skills ? params.skills.split(',') : undefined,
    }
    
    const validatedData = jobSearchSchema.parse(searchData)
    
    const where: any = {
      status: 'PUBLISHED',
    }
    
    // Build search conditions
    if (validatedData.query) {
      where.OR = [
        { title: { contains: validatedData.query } },
        { description: { contains: validatedData.query } },
        { skills: { contains: validatedData.query } },
      ]
    }
    
    if (validatedData.location) {
      where.location = { contains: validatedData.location }
    }
    
    if (validatedData.type) {
      where.type = validatedData.type
    }
    
    if (validatedData.experienceLevel) {
      where.experienceLevel = validatedData.experienceLevel
    }
    
    if (validatedData.remote !== undefined) {
      where.remote = validatedData.remote
    }
    
    if (validatedData.salaryMin) {
      where.salaryMin = { gte: validatedData.salaryMin }
    }
    
    if (validatedData.salaryMax) {
      where.salaryMax = { lte: validatedData.salaryMax }
    }
    
    if (validatedData.skills && validatedData.skills.length > 0) {
      // For SQLite, we'll search within the JSON string
      where.skills = { contains: validatedData.skills[0] }
    }
    
    const skip = (validatedData.page - 1) * validatedData.limit
    
    const [jobsRaw, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              name: true,
              logo: true,
              location: true,
            },
          },
          recruiter: {
            select: {
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: validatedData.limit,
      }),
      prisma.job.count({ where }),
    ])
    
    // Parse skills from JSON strings
    const jobs = jobsRaw.map(job => ({
      ...job,
      skills: job.skills ? JSON.parse(job.skills) : [],
    }))
    
    // Log search for analytics
    await prisma.jobSearch.create({
      data: {
        query: validatedData.query,
        filters: JSON.stringify(validatedData),
        results: total,
      },
    })
    
    return NextResponse.json({
      jobs,
      pagination: {
        page: validatedData.page,
        limit: validatedData.limit,
        total,
        pages: Math.ceil(total / validatedData.limit),
      },
    })
  } catch (error) {
    console.error('Jobs search error:', error)
    return NextResponse.json(
      { error: 'Failed to search jobs' },
      { status: 500 }
    )
  }
}

// POST /api/jobs - Create a new job (Recruiters only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'RECRUITER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const validatedData = jobSchema.parse(body)
    
    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true },
    })
    
    if (!user?.company) {
      return NextResponse.json(
        { error: 'Company profile required to post jobs' },
        { status: 400 }
      )
    }
    
    const job = await prisma.job.create({
      data: {
        ...validatedData,
        skills: JSON.stringify(validatedData.skills),
        companyId: user.company.id,
        recruiterId: session.user.id,
        status: 'PUBLISHED',
      },
      include: {
        company: true,
        recruiter: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    })
    
    // Log audit
    await prisma.audit.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        resource: 'job',
        resourceId: job.id,
        newData: JSON.stringify(job),
      },
    })
    
    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Job creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}
