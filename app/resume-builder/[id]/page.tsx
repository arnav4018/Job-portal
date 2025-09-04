import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ResumeEditor } from '@/components/resume/resume-editor'
import ResumeErrorBoundary from '@/components/resume/resume-error-boundary'

interface ResumeEditPageProps {
  params: {
    id: string
  }
}

// Validate resume ID format
function isValidResumeId(id: string): boolean {
  // Check if it's a valid UUID or your ID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id) || /^[a-zA-Z0-9_-]+$/.test(id)
}

async function getResumeData(resumeId: string, userId: string) {
  try {
    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: userId // Ensure user owns this resume
      }
    })
    return resume
  } catch (error) {
    console.error('Error fetching resume data:', error)
    throw error
  }
}

export default async function ResumeEditPage({ params }: ResumeEditPageProps) {
  // Validate resume ID format first
  if (!isValidResumeId(params.id)) {
    notFound()
  }

  // Await the session to ensure it's a valid Session object or null.
  const session = await getServerSession(authOptions)

  // Redirect if no session or user is found
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/resume-builder/${params.id}`)
  }

  // Redirect if the user is not a candidate
  if (session.user.role !== 'CANDIDATE') {
    redirect('/dashboard?error=access_denied&message=Only candidates can access the resume builder')
  }

  // Use a single try/catch block for the resume data fetch
  try {
    const resume = await getResumeData(params.id, session.user.id)

    if (!resume) {
      notFound()
    }

    return (
      <ResumeErrorBoundary
        resumeId={params.id}
      >
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
      </ResumeErrorBoundary>
    )
  } catch (error) {
    console.error('Resume fetch error:', error)
    throw new Error(`Failed to load resume: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}