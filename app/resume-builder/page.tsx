import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ResumeBuilder } from '@/components/resume/resume-builder'
import ResumeErrorBoundary from '@/components/resume/resume-error-boundary'

async function getResumes(userId: string) {
  try {
    const resumes = await prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    })
    return resumes
  } catch (error) {
    console.error('Error fetching resume data:', error)
    throw error
  }
}

export default async function ResumeBuilderPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/resume-builder')
  }

  if (session.user.role !== 'CANDIDATE') {
    redirect('/dashboard?error=access_denied&message=Only candidates can access the resume builder')
  }

  let resumes = []
  try {
    resumes = await getResumes(session.user.id)
  } catch (error) {
    console.error('Resume fetch error:', error)
    throw new Error(`Failed to load resumes: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return (
    <ResumeErrorBoundary>
    
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
    </ResumeErrorBoundary>
  )
}