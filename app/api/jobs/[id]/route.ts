import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { jobSchema } from '@/lib/validations'

// GET /api/jobs/[id] - Get job details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
        applications: {
          select: {
            id: true,
            candidateId: true,
            status: true,
            appliedAt: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    })
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }
    
    // Parse skills from JSON string
    const jobWithParsedSkills = {
      ...job,
      skills: job.skills ? JSON.parse(job.skills) : [],
    }
    
    // Increment view count
    await prisma.job.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    })
    
    return NextResponse.json(jobWithParsedSkills)
  } catch (error) {
    console.error('Job fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    )
  }
}

// PATCH /api/jobs/[id] - Update job (Recruiter only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'RECRUITER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const job = await prisma.job.findUnique({
      where: { id: params.id },
    })
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }
    
    if (job.recruiterId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const validatedData = jobSchema.partial().parse(body)
    
    // Convert skills array to JSON string if present
    const updateData: any = {
      ...validatedData,
    };
    
    if (validatedData.skills !== undefined) {
      updateData.skills = JSON.stringify(validatedData.skills);
    }
    
    const updatedJob = await prisma.job.update({
      where: { id: params.id },
      data: updateData,
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
        action: 'UPDATE',
        resource: 'job',
        resourceId: job.id,
        oldData: JSON.stringify(job),
        newData: JSON.stringify(updatedJob),
      },
    })
    
    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error('Job update error:', error)
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    )
  }
}

// DELETE /api/jobs/[id] - Delete job (Recruiter only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'RECRUITER') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const job = await prisma.job.findUnique({
      where: { id: params.id },
    })
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }
    
    if (job.recruiterId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    await prisma.job.delete({
      where: { id: params.id },
    })
    
    // Log audit
    await prisma.audit.create({
      data: {
        userId: session.user.id,
        action: 'DELETE',
        resource: 'job',
        resourceId: job.id,
        oldData: JSON.stringify(job),
      },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Job deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    )
  }
}