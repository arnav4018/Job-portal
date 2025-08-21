import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import EarningsContent from './earnings-content'

export default async function EarningsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Get user's earnings and payment history
  const [payments, referrals] = await Promise.all([
    prisma.payment.findMany({
      where: { 
        userId: session.user.id,
        type: 'REFERRAL_PAYOUT'
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.referral.findMany({
      where: { 
        referrerId: session.user.id,
        status: 'HIRED'
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
              },
            },
          },
        },
        referred: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { paidAt: 'desc' },
    }),
  ])

  const totalEarnings = referrals.reduce((sum, r) => sum + (r.reward || 0), 0)
  const paidEarnings = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0)
  const pendingEarnings = totalEarnings - paidEarnings

  return (
    <EarningsContent 
      payments={payments}
      referrals={referrals}
      stats={{
        totalEarnings,
        paidEarnings,
        pendingEarnings,
        successfulReferrals: referrals.length,
      }}
    />
  )
}