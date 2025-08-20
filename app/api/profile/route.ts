import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      firstName,
      lastName,
      phone,
      location,
      bio,
      website,
      linkedin,
      github,
      experience,
      skills
    } = data

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    })

    if (existingProfile) {
      // Update existing profile
      const updatedProfile = await prisma.profile.update({
        where: { userId: session.user.id },
        data: {
          firstName,
          lastName,
          phone,
          location,
          bio,
          website,
          linkedin,
          github,
          experience,
          skills
        }
      })
      return NextResponse.json(updatedProfile)
    } else {
      // Create new profile
      const newProfile = await prisma.profile.create({
        data: {
          userId: session.user.id,
          firstName,
          lastName,
          phone,
          location,
          bio,
          website,
          linkedin,
          github,
          experience,
          skills
        }
      })
      return NextResponse.json(newProfile)
    }
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}