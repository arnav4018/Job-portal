import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ResumePreview from './resume-preview'

interface ResumePreviewPageProps {
  params: {
    id: string
  }
}

export default async function ResumePreviewPage({ params }: ResumePreviewPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'CANDIDATE') {
    redirect('/dashboard')
  }

  // Get the resume
  const resume = await prisma.resume.findUnique({
    where: { 
      id: params.id,
      userId: session.user.id // Ensure user owns this resume
    }
  })

  if (!resume) {
    notFound()
  }

  return <ResumePreview resume={resume} />
}