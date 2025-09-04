import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function PostJobRedirectPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'RECRUITER') {
    redirect('/dashboard')
  }

  // Redirect to the actual job posting page
  redirect('/recruiter/jobs/post')
}
