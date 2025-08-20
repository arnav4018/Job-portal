import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ResumeBuilder } from '@/components/resume/resume-builder'

export default async function ResumeBuilderPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'CANDIDATE') {
    redirect('/dashboard')
  }

  // Get user's existing resumes
  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Resume Builder</h1>
          <p className="text-muted-foreground">
            Create a professional resume that stands out to employers
          </p>
        </div>

        <ResumeBuilder existingResumes={resumes} />
      </div>
    </div>
  )
}