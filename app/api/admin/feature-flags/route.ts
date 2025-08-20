import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const flags = await prisma.featureFlag.findMany()
    
    const featureFlags = {
      paymentsEnabled: flags.find(f => f.key === 'payments_enabled')?.enabled || false,
      commissionsEnabled: flags.find(f => f.key === 'commissions_enabled')?.enabled || false,
      expertConsultingEnabled: flags.find(f => f.key === 'expert_consulting_enabled')?.enabled || false,
      interviewSchedulingEnabled: flags.find(f => f.key === 'interview_scheduling_enabled')?.enabled || false,
      quizSystemEnabled: flags.find(f => f.key === 'quiz_system_enabled')?.enabled || false,
    }

    return NextResponse.json(featureFlags)
  } catch (error) {
    console.error('Feature flags fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { key, enabled } = await request.json()

    // Map frontend keys to database keys
    const keyMap: Record<string, string> = {
      paymentsEnabled: 'payments_enabled',
      commissionsEnabled: 'commissions_enabled',
      expertConsultingEnabled: 'expert_consulting_enabled',
      interviewSchedulingEnabled: 'interview_scheduling_enabled',
      quizSystemEnabled: 'quiz_system_enabled',
    }

    const dbKey = keyMap[key]
    if (!dbKey) {
      return NextResponse.json(
        { error: 'Invalid feature flag key' },
        { status: 400 }
      )
    }

    // Update or create feature flag
    const flag = await prisma.featureFlag.upsert({
      where: { key: dbKey },
      update: { enabled },
      create: {
        key: dbKey,
        enabled,
        description: `Feature flag for ${key}`,
      },
    })

    // Create audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE',
      resource: 'feature_flag',
      resourceId: flag.id,
      newData: JSON.stringify({ key: dbKey, enabled }),
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Feature flag update error:', error)
    return NextResponse.json(
      { error: 'Failed to update feature flag' },
      { status: 500 }
    )
  }
}