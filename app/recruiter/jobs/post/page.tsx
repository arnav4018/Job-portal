import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import JobPostForm from './job-post-form'

export default async function PostJobPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'RECRUITER') {
    redirect('/dashboard')
  }

  // Get or create company
  let company = await prisma.company.findUnique({
    where: { userId: session.user.id }
  })

  if (!company) {
    // Create a basic company profile
    company = await prisma.company.create({
      data: {
        userId: session.user.id,
        name: `${session.user.name}'s Company`,
        description: 'Please update your company description',
      }
    })
  }

  return <JobPostForm company={company} />
}