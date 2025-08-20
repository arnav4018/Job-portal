import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProfileContent from './profile-content'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Get user profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      company: true
    }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  return <ProfileContent user={user} />
}