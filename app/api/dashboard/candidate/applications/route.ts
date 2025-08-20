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

    // Get recent applications (last 5)
    const applications = await prisma.application.findMany({
      where: { candidateId: session.user.id },
      include: {
        job: {
          include: {
            company: true
          }
        }
      },
      orderBy: { appliedAt: 'desc' },
      take: 5
    })

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Dashboard applications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}