import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Calculate profile completeness percentage
function calculateProfileCompleteness(profile: any): number {
  const requiredFields = [
    'firstName', 'lastName', 'phone', 'city', 'state', 'country',
    'currentDesignation', 'totalExperience', 'currentCTC', 'expectedCTC',
    'skills', 'education', 'workExperience'
  ]
  
  const optionalFields = [
    'dateOfBirth', 'gender', 'maritalStatus', 'nationality', 'alternatePhone',
    'address', 'pincode', 'currentCompany', 'relevantExperience', 'noticePeriod',
    'reasonForChange', 'preferredLocations', 'workMode', 'primarySkills',
    'secondarySkills', 'certifications', 'languages', 'highestQualification',
    'specialization', 'instituteName', 'graduationYear', 'projects',
    'achievements', 'resumeUrl', 'profilePhotoUrl', 'linkedinProfile',
    'githubProfile', 'portfolioUrl', 'website'
  ]

  let completedRequired = 0
  let completedOptional = 0

  // Check required fields
  requiredFields.forEach(field => {
    if (profile[field]) {
      completedRequired++
    }
  })

  // Check optional fields
  optionalFields.forEach(field => {
    if (profile[field]) {
      completedOptional++
    }
  })

  // Weight: Required fields = 70%, Optional fields = 30%
  const requiredScore = (completedRequired / requiredFields.length) * 70
  const optionalScore = (completedOptional / optionalFields.length) * 30

  return Math.round(requiredScore + optionalScore)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get enhanced user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId }
    })

    if (!userProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const profile = {
      ...userProfile,
      skills: userProfile.skills ? JSON.parse(userProfile.skills) : [],
      primarySkills: userProfile.primarySkills ? JSON.parse(userProfile.primarySkills) : [],
      secondarySkills: userProfile.secondarySkills ? JSON.parse(userProfile.secondarySkills) : [],
      certifications: userProfile.certifications ? JSON.parse(userProfile.certifications) : [],
      languages: userProfile.languages ? JSON.parse(userProfile.languages) : [],
      education: userProfile.education ? JSON.parse(userProfile.education) : [],
      workExperience: userProfile.workExperience ? JSON.parse(userProfile.workExperience) : [],
      projects: userProfile.projects ? JSON.parse(userProfile.projects) : [],
      achievements: userProfile.achievements ? JSON.parse(userProfile.achievements) : [],
      preferredLocations: userProfile.preferredLocations || [],
      jobAlertPreferences: userProfile.jobAlertPreferences ? JSON.parse(userProfile.jobAlertPreferences) : {},
      privacySettings: userProfile.privacySettings ? JSON.parse(userProfile.privacySettings) : {},
      communicationPreferences: userProfile.communicationPreferences ? JSON.parse(userProfile.communicationPreferences) : {}
    }

    return NextResponse.json({
      success: true,
      data: profile
    })

  } catch (error) {
    console.error('User Profile GET Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const userId = session.user.id

    // Prepare data for database insertion
    const profileData = {
      ...body,
      skills: body.skills ? JSON.stringify(body.skills) : null,
      primarySkills: body.primarySkills ? JSON.stringify(body.primarySkills) : null,
      secondarySkills: body.secondarySkills ? JSON.stringify(body.secondarySkills) : null,
      certifications: body.certifications ? JSON.stringify(body.certifications) : null,
      languages: body.languages ? JSON.stringify(body.languages) : null,
      education: body.education ? JSON.stringify(body.education) : null,
      workExperience: body.workExperience ? JSON.stringify(body.workExperience) : null,
      projects: body.projects ? JSON.stringify(body.projects) : null,
      achievements: body.achievements ? JSON.stringify(body.achievements) : null,
      preferredLocations: body.preferredLocations || [],
      jobAlertPreferences: body.jobAlertPreferences ? JSON.stringify(body.jobAlertPreferences) : null,
      privacySettings: body.privacySettings ? JSON.stringify(body.privacySettings) : null,
      communicationPreferences: body.communicationPreferences ? JSON.stringify(body.communicationPreferences) : null
    }

    // Calculate profile completeness
    const profileCompleteness = calculateProfileCompleteness(body)
    profileData.profileCompleteness = profileCompleteness

    // Create or update user profile
    const userProfile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...profileData,
        updatedAt: new Date()
      },
      create: {
        userId,
        ...profileData
      }
    })

    // Update last active timestamp
    await prisma.userProfile.update({
      where: { userId },
      data: { lastActiveAt: new Date() }
    })

    // Parse JSON fields for response
    const responseProfile = {
      ...userProfile,
      skills: userProfile.skills ? JSON.parse(userProfile.skills) : [],
      primarySkills: userProfile.primarySkills ? JSON.parse(userProfile.primarySkills) : [],
      secondarySkills: userProfile.secondarySkills ? JSON.parse(userProfile.secondarySkills) : [],
      certifications: userProfile.certifications ? JSON.parse(userProfile.certifications) : [],
      languages: userProfile.languages ? JSON.parse(userProfile.languages) : [],
      education: userProfile.education ? JSON.parse(userProfile.education) : [],
      workExperience: userProfile.workExperience ? JSON.parse(userProfile.workExperience) : [],
      projects: userProfile.projects ? JSON.parse(userProfile.projects) : [],
      achievements: userProfile.achievements ? JSON.parse(userProfile.achievements) : [],
      jobAlertPreferences: userProfile.jobAlertPreferences ? JSON.parse(userProfile.jobAlertPreferences) : {},
      privacySettings: userProfile.privacySettings ? JSON.parse(userProfile.privacySettings) : {},
      communicationPreferences: userProfile.communicationPreferences ? JSON.parse(userProfile.communicationPreferences) : {}
    }

    return NextResponse.json({
      success: true,
      data: responseProfile,
      message: `Profile updated successfully (${profileCompleteness}% complete)`
    })

  } catch (error) {
    console.error('User Profile POST Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, data } = body
    const userId = session.user.id

    if (action === 'incrementProfileViews') {
      // Increment profile views
      const userProfile = await prisma.userProfile.upsert({
        where: { userId },
        update: {
          profileViews: { increment: 1 },
          lastActiveAt: new Date()
        },
        create: {
          userId,
          profileViews: 1,
          lastActiveAt: new Date()
        }
      })

      return NextResponse.json({
        success: true,
        data: { profileViews: userProfile.profileViews }
      })
    }

    if (action === 'incrementSearchAppearances') {
      // Increment search appearances
      const userProfile = await prisma.userProfile.upsert({
        where: { userId },
        update: {
          searchAppearances: { increment: 1 }
        },
        create: {
          userId,
          searchAppearances: 1
        }
      })

      return NextResponse.json({
        success: true,
        data: { searchAppearances: userProfile.searchAppearances }
      })
    }

    if (action === 'updateVerification') {
      // Update verification status
      const { verificationLevel, isVerified } = data

      const userProfile = await prisma.userProfile.upsert({
        where: { userId },
        update: {
          verificationLevel: verificationLevel || 'BASIC',
          isVerified: isVerified || false,
          updatedAt: new Date()
        },
        create: {
          userId,
          verificationLevel: verificationLevel || 'BASIC',
          isVerified: isVerified || false
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          verificationLevel: userProfile.verificationLevel,
          isVerified: userProfile.isVerified
        },
        message: 'Verification status updated'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action parameter' },
      { status: 400 }
    )

  } catch (error) {
    console.error('User Profile PATCH Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
