import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import RecruiterApplicationsContent from './recruiter-applications-content'

export default async function RecruiterApplicationsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'RECRUITER') {
    redirect('/dashboard')
  }

  return <RecruiterApplicationsContent />
}