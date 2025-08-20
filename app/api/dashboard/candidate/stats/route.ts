import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get candidate statistics
    const [appliedJobs, resumeCount, profileViews] = await Promise.all([
      prisma.application.count({
        where: { candidateId: session.user.id }
      }),
      prisma.resume.count({
        where: { userId: session.user.id }
      }),
      // For now, return mock data for profile views
      Promise.resolve(12)
    ])

    // Get total resume downloads
    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      select: { downloadCount: true }
    })

    const resumeDownloads = resumes.reduce((total, resume) => total + resume.downloadCount, 0)

    return NextResponse.json({
      appliedJobs,
      savedJobs: 0, // TODO: Implement saved jobs feature
      profileViews,
      resumeDownloads
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}