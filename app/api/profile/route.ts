import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/profile - Get user profile with completeness
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Parse JSON fields
    const profileWithParsedData = {
      ...profile,
      achievements: profile.achievements ? JSON.parse(profile.achievements) : [],
    }

    return NextResponse.json(profileWithParsedData)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

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
      skills,
      // Enhanced profile fields
      noticePeriod,
      uanNumber,
      linkedinProfile,
      achievements,
      buyoutOption,
      currentCTC,
      salarySlipUrl,
      expectedCTC,
      willingToRelocate,
      numberOfReportees,
      reportingTo,
      lastHikePercentage,
      incrementLetterUrl,
      degree,
      aadharNumber,
      panNumber
    } = data

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    })

    // Calculate profile completeness
    const profileData = {
      firstName,
      lastName,
      phone,
      location,
      bio,
      website,
      linkedin,
      github,
      experience,
      skills,
      noticePeriod,
      uanNumber,
      linkedinProfile,
      achievements: achievements ? JSON.stringify(achievements) : null,
      buyoutOption: buyoutOption || false,
      currentCTC,
      salarySlipUrl,
      expectedCTC,
      willingToRelocate: willingToRelocate || false,
      numberOfReportees,
      reportingTo,
      lastHikePercentage,
      incrementLetterUrl,
      degree,
      aadharNumber,
      panNumber
    }

    // Calculate profile completeness percentage
    const totalFields = Object.keys(profileData).length
    const filledFields = Object.values(profileData).filter(value => 
      value !== null && value !== undefined && value !== ''
    ).length
    const profileCompleteness = (filledFields / totalFields) * 100

    if (existingProfile) {
      // Update existing profile
      const updatedProfile = await prisma.profile.update({
        where: { userId: session.user.id },
        data: {
          ...profileData,
          profileCompleteness
        }
      })
      return NextResponse.json(updatedProfile)
    } else {
      // Create new profile
      const newProfile = await prisma.profile.create({
        data: {
          userId: session.user.id,
          ...profileData,
          profileCompleteness
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