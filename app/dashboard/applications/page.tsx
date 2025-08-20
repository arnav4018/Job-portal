import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ApplicationsContent from './applications-content'

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'CANDIDATE') {
    redirect('/dashboard')
  }

  // Get user's applications
  const applications = await prisma.application.findMany({
    where: { candidateId: session.user.id },
    include: {
      job: {
        include: {
          company: true
        }
      }
    },
    orderBy: { appliedAt: 'desc' }
  })

  return <ApplicationsContent applications={applications} />
}