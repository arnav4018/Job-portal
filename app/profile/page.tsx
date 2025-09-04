import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProfileContent from './profile-content'
import ProfileSkeleton from './profile-skeleton'
import ProfileErrorBoundary from './profile-error-boundary'

async function ProfileData() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/profile')
  }

  try {
    // Get user profile with timeout handling
    const user = await Promise.race([
      prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          profile: true,
          company: true
        }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 10000)
      )
    ]) as any

    if (!user) {
      throw new Error('User not found')
    }

    return <ProfileContent user={user} />
  } catch (error) {
    console.error('Profile page error:', error)
    throw error
  }
}

export default function ProfilePage() {
  return (
    <ProfileErrorBoundary>
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileData />
      </Suspense>
    </ProfileErrorBoundary>
  )
}