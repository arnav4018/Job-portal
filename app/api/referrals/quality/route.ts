import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Calculate referral quality score based on multiple factors
function calculateQualityScore(data: {
  profileMatch: number
  experienceMatch: number
  skillsMatch: number
  responseTime: number // in hours
  interviewPerformance?: number
  hireSuccess: boolean
}) {
  const {
    profileMatch,
    experienceMatch,
    skillsMatch,
    responseTime,
    interviewPerformance = 0,
    hireSuccess
  } = data

  // Base score calculation (weighted average)
  let baseScore = (
    profileMatch * 0.3 +
    experienceMatch * 0.25 +
    skillsMatch * 0.25 +
    Math.max(0, 100 - (responseTime / 24 * 10)) * 0.2 // Faster response = higher score
  )

  // Bonus for interview performance
  if (interviewPerformance > 0) {
    baseScore = (baseScore * 0.8) + (interviewPerformance * 0.2)
  }

  // Major bonus for successful hire
  if (hireSuccess) {
    baseScore = Math.min(100, baseScore * 1.2)
  }

  return Math.round(baseScore)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const referralId = searchParams.get('referralId')
    const period = searchParams.get('period') || '30' // days
    const userId = session.user.id

    if (referralId) {
      // Get specific referral quality data
      const referralQuality = await prisma.referralQuality.findUnique({
        where: { referralId },
        include: {
          referral: {
            include: {
              job: {
                select: {
                  title: true,
                  company: { select: { name: true } }
                }
              },
              referred: {
                select: { name: true, email: true }
              }
            }
          }
        }
      })

      if (!referralQuality) {
        return NextResponse.json(
          { error: 'Referral quality data not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: referralQuality
      })
    }

    // Get quality analytics for user's referrals
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    const [
      averageQualityScore,
      totalReferrals,
      successfulReferrals,
      qualityDistribution,
      topPerformingReferrals,
      qualityTrends
    ] = await Promise.all([
      // Average quality score
      prisma.referralQuality.aggregate({
        where: {
          referral: {
            referrerId: userId,
            createdAt: { gte: startDate }
          }
        },
        _avg: { qualityScore: true }
      }),

      // Total referrals count
      prisma.referral.count({
        where: {
          referrerId: userId,
          createdAt: { gte: startDate }
        }
      }),

      // Successful referrals (hired)
      prisma.referralQuality.count({
        where: {
          referral: {
            referrerId: userId,
            createdAt: { gte: startDate }
          },
          hireSuccess: true
        }
      }),

      // Quality score distribution
      prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN quality_score >= 80 THEN 'Excellent (80-100)'
            WHEN quality_score >= 60 THEN 'Good (60-79)'
            WHEN quality_score >= 40 THEN 'Average (40-59)'
            ELSE 'Below Average (0-39)'
          END as score_range,
          COUNT(*) as count
        FROM referral_quality rq
        INNER JOIN referrals r ON rq.referral_id = r.id
        WHERE r.referrer_id = ${userId}
          AND r.created_at >= ${startDate}
        GROUP BY score_range
        ORDER BY MIN(quality_score) DESC
      `,

      // Top performing referrals
      prisma.referralQuality.findMany({
        where: {
          referral: {
            referrerId: userId,
            createdAt: { gte: startDate }
          }
        },
        include: {
          referral: {
            include: {
              job: {
                select: {
                  title: true,
                  company: { select: { name: true } }
                }
              },
              referred: {
                select: { name: true, email: true }
              }
            }
          }
        },
        orderBy: { qualityScore: 'desc' },
        take: 5
      }),

      // Quality trends over time
      prisma.$queryRaw`
        SELECT 
          DATE(r.created_at) as date,
          AVG(rq.quality_score) as avg_score,
          COUNT(*) as referral_count
        FROM referrals r
        LEFT JOIN referral_quality rq ON r.id = rq.referral_id
        WHERE r.referrer_id = ${userId}
          AND r.created_at >= ${startDate}
        GROUP BY DATE(r.created_at)
        ORDER BY date ASC
      `
    ])

    const analytics = {
      averageQualityScore: averageQualityScore._avg.qualityScore || 0,
      totalReferrals,
      successfulReferrals,
      successRate: totalReferrals > 0 ? 
        ((successfulReferrals / totalReferrals) * 100).toFixed(1) : '0',
      qualityDistribution,
      topPerformingReferrals,
      qualityTrends
    }

    return NextResponse.json({
      success: true,
      data: analytics
    })

  } catch (error) {
    console.error('Referral Quality GET Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      referralId,
      profileMatch,
      experienceMatch,
      skillsMatch,
      responseTime,
      interviewPerformance,
      hireSuccess
    } = body

    if (!referralId) {
      return NextResponse.json(
        { error: 'Referral ID is required' },
        { status: 400 }
      )
    }

    // Verify referral exists and belongs to user's job
    const referral = await prisma.referral.findFirst({
      where: {
        id: referralId,
        job: {
          recruiterId: session.user.id
        }
      }
    })

    if (!referral) {
      return NextResponse.json(
        { error: 'Referral not found' },
        { status: 404 }
      )
    }

    // Calculate quality score
    const qualityScore = calculateQualityScore({
      profileMatch,
      experienceMatch,
      skillsMatch,
      responseTime,
      interviewPerformance,
      hireSuccess
    })

    // Create or update referral quality
    const referralQuality = await prisma.referralQuality.upsert({
      where: { referralId },
      update: {
        qualityScore,
        profileMatch,
        experienceMatch,
        skillsMatch,
        responseTime,
        interviewPerformance,
        hireSuccess,
        updatedAt: new Date()
      },
      create: {
        referralId,
        qualityScore,
        profileMatch,
        experienceMatch,
        skillsMatch,
        responseTime,
        interviewPerformance,
        hireSuccess
      }
    })

    // Update referral status if hired
    if (hireSuccess && referral.status !== 'HIRED') {
      await prisma.referral.update({
        where: { id: referralId },
        data: { status: 'HIRED' }
      })
    }

    return NextResponse.json({
      success: true,
      data: referralQuality,
      message: 'Referral quality score updated successfully'
    })

  } catch (error) {
    console.error('Referral Quality POST Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
