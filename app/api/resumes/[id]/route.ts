import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

// GET /api/resumes/[id] - Get specific resume
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resume = await prisma.resume.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id // Ensure user owns this resume
      }
    })

    if (!resume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(resume)
  } catch (error) {
    console.error('Resume fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resume' },
      { status: 500 }
    )
  }
}

// PUT /api/resumes/[id] - Update resume
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, content, template, isDefault } = body

    // Verify ownership
    const existingResume = await prisma.resume.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingResume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      )
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.resume.updateMany({
        where: { 
          userId: session.user.id,
          id: { not: params.id }
        },
        data: { isDefault: false }
      })
    }

    const updatedResume = await prisma.resume.update({
      where: { id: params.id },
      data: {
        title: title || existingResume.title,
        content: content ? JSON.stringify(content) : existingResume.content,
        template: template || existingResume.template,
        isDefault: isDefault !== undefined ? isDefault : existingResume.isDefault,
      }
    })

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      resource: 'resume',
      resourceId: params.id,
      oldData: JSON.stringify(existingResume),
      newData: JSON.stringify(updatedResume),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json(updatedResume)
  } catch (error) {
    console.error('Resume update error:', error)
    return NextResponse.json(
      { error: 'Failed to update resume' },
      { status: 500 }
    )
  }
}

// DELETE /api/resumes/[id] - Delete resume
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify ownership
    const existingResume = await prisma.resume.findUnique({
      where: { 
        id: params.id,
        userId: session.user.id
      }
    })

    if (!existingResume) {
      return NextResponse.json(
        { error: 'Resume not found' },
        { status: 404 }
      )
    }

    await prisma.resume.delete({
      where: { id: params.id }
    })

    // If deleted resume was default, make another one default
    if (existingResume.isDefault) {
      const nextResume = await prisma.resume.findFirst({
        where: { userId: session.user.id },
        orderBy: { updatedAt: 'desc' }
      })

      if (nextResume) {
        await prisma.resume.update({
          where: { id: nextResume.id },
          data: { isDefault: true }
        })
      }
    }

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'DELETE',
      resource: 'resume',
      resourceId: params.id,
      oldData: JSON.stringify(existingResume),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resume deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    )
  }
}