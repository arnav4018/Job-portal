import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ReferralsContent from './referrals-content'

export default async function ReferralsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Get user's referrals and stats
  const [referrals, stats] = await Promise.all([
    prisma.referral.findMany({
      where: { referrerId: session.user.id },
      include: {
        job: {
          include: {
            company: {
              select: {
                name: true,
                logo: true,
              },
            },
          },
        },
        referred: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.referral.groupBy({
      by: ['status'],
      where: { referrerId: session.user.id },
      _count: true,
    }),
  ])

  // Calculate stats
  const referralStats = {
    total: referrals.length,
    pending: stats.find(s => s.status === 'PENDING')?._count || 0,
    applied: stats.find(s => s.status === 'APPLIED')?._count || 0,
    hired: stats.find(s => s.status === 'HIRED')?._count || 0,
    totalEarnings: referrals
      .filter(r => r.status === 'HIRED')
      .reduce((sum, r) => sum + (r.reward || 0), 0),
  }

  return <ReferralsContent referrals={referrals} stats={referralStats} />
}