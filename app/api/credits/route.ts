import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/credits - Get hiring credits balance and history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's company
    const company = await prisma.company.findUnique({
      where: { userId: session.user.id }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company profile not found' },
        { status: 404 }
      )
    }

    // Get hiring credits with transaction history
    const [credits, transactions] = await Promise.all([
      prisma.hiringCredit.findFirst({
        where: { companyId: company.id }
      }),
      prisma.creditTransaction.findMany({
        where: {
          credit: {
            companyId: company.id
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50 // Last 50 transactions
      })
    ])

    if (!credits) {
      // Create initial credits if not exist
      const newCredits = await prisma.hiringCredit.create({
        data: {
          companyId: company.id,
          credits: 5, // 5 free credits
          totalPurchased: 0,
          totalUsed: 0,
        }
      })

      return NextResponse.json({
        balance: newCredits.credits,
        totalPurchased: newCredits.totalPurchased,
        totalUsed: newCredits.totalUsed,
        expiresAt: newCredits.expiresAt,
        transactions: []
      })
    }

    return NextResponse.json({
      balance: credits.credits,
      totalPurchased: credits.totalPurchased,
      totalUsed: credits.totalUsed,
      expiresAt: credits.expiresAt,
      transactions
    })
  } catch (error) {
    console.error('Credits fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    )
  }
}

// POST /api/credits - Purchase or use credits
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { action, amount, description, jobId, paymentId } = data

    // Get user's company
    const company = await prisma.company.findUnique({
      where: { userId: session.user.id }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Company profile not found' },
        { status: 404 }
      )
    }

    // Get or create hiring credits
    let credits = await prisma.hiringCredit.findFirst({
      where: { companyId: company.id }
    })

    if (!credits) {
      credits = await prisma.hiringCredit.create({
        data: {
          companyId: company.id,
          credits: 5, // 5 free credits
          totalPurchased: 0,
          totalUsed: 0,
        }
      })
    }

    if (action === 'PURCHASE') {
      // Purchase credits
      const updatedCredits = await prisma.hiringCredit.update({
        where: { id: credits.id },
        data: {
          credits: credits.credits + amount,
          totalPurchased: credits.totalPurchased + amount,
        }
      })

      // Create transaction record
      await prisma.creditTransaction.create({
        data: {
          creditId: credits.id,
          type: 'PURCHASE',
          amount,
          description: description || `Purchased ${amount} credits`,
          metadata: paymentId ? JSON.stringify({ paymentId }) : null
        }
      })

      return NextResponse.json({
        message: `Successfully purchased ${amount} credits`,
        newBalance: updatedCredits.credits
      })

    } else if (action === 'USE') {
      // Use credits (for job posting, featuring, etc.)
      if (credits.credits < amount) {
        return NextResponse.json(
          { error: 'Insufficient credits' },
          { status: 400 }
        )
      }

      const updatedCredits = await prisma.hiringCredit.update({
        where: { id: credits.id },
        data: {
          credits: credits.credits - amount,
          totalUsed: credits.totalUsed + amount,
        }
      })

      // Create transaction record
      await prisma.creditTransaction.create({
        data: {
          creditId: credits.id,
          type: 'USAGE',
          amount,
          description: description || `Used ${amount} credits`,
          metadata: jobId ? JSON.stringify({ jobId }) : null
        }
      })

      return NextResponse.json({
        message: `Successfully used ${amount} credits`,
        newBalance: updatedCredits.credits
      })

    } else if (action === 'REFUND') {
      // Refund credits (if job posting was cancelled, etc.)
      const updatedCredits = await prisma.hiringCredit.update({
        where: { id: credits.id },
        data: {
          credits: credits.credits + amount,
          totalUsed: Math.max(0, credits.totalUsed - amount),
        }
      })

      // Create transaction record
      await prisma.creditTransaction.create({
        data: {
          creditId: credits.id,
          type: 'REFUND',
          amount,
          description: description || `Refunded ${amount} credits`,
          metadata: jobId ? JSON.stringify({ jobId }) : null
        }
      })

      return NextResponse.json({
        message: `Successfully refunded ${amount} credits`,
        newBalance: updatedCredits.credits
      })

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use PURCHASE, USE, or REFUND' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Credits transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to process credits transaction' },
      { status: 500 }
    )
  }
}

// Helper function to get credit pricing information
async function getPricing() {
  const pricingTiers = [
    {
      credits: 10,
      price: 999, // ₹9.99
      pricePerCredit: 99.9,
      popular: false,
      features: [
        '10 job postings',
        'Basic candidate matching',
        'Email support'
      ]
    },
    {
      credits: 25,
      price: 2199, // ₹21.99
      pricePerCredit: 87.96,
      popular: true,
      savings: '12% off',
      features: [
        '25 job postings',
        'Advanced candidate matching',
        'Priority support',
        'Job posting optimization'
      ]
    },
    {
      credits: 50,
      price: 3999, // ₹39.99
      pricePerCredit: 79.98,
      popular: false,
      savings: '20% off',
      features: [
        '50 job postings',
        'Premium candidate matching',
        'Dedicated account manager',
        'Custom hiring workflows',
        'Analytics dashboard'
      ]
    },
    {
      credits: 100,
      price: 6999, // ₹69.99
      pricePerCredit: 69.99,
      popular: false,
      savings: '30% off',
      features: [
        '100 job postings',
        'Enterprise matching',
        '24/7 priority support',
        'Custom integrations',
        'Advanced analytics',
        'Bulk hiring tools'
      ]
    }
  ]

  return NextResponse.json({ pricingTiers })
}
