import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ResumeEditor } from '@/components/resume/resume-editor'

interface ResumeEditPageProps {
  params: {
    id: string
  }
}

export default async function ResumeEditPage({ params }: ResumeEditPageProps) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Resume</h1>
          <p className="text-muted-foreground">
            Update your resume: {resume.title}
          </p>
        </div>

        <ResumeEditor resume={resume} />
      </div>
    </div>
  )
}