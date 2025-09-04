import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/company - Get company profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
      include: {
        hiringCredits: true,
        _count: {
          select: {
            jobs: true
          }
        }
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Parse JSON fields
    const companyWithParsedData = {
      ...company,
      products: company.products ? JSON.parse(company.products) : [],
      benefits: company.benefits ? JSON.parse(company.benefits) : [],
      workTimings: company.workTimings ? JSON.parse(company.workTimings) : null,
      officeImages: company.officeImages ? JSON.parse(company.officeImages) : [],
    }

    return NextResponse.json(companyWithParsedData)
  } catch (error) {
    console.error('Company fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}

// POST /api/company - Create company profile
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      name,
      description,
      website,
      logo,
      location,
      size,
      industry,
      // Enhanced company fields
      businessDetails,
      products,
      turnover,
      teamSize,
      erpSystem,
      leavesPolicy,
      workingDays,
      travelRequired,
      workTimings,
      benefits,
      culture,
      officeImages
    } = data

    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: { userId: session.user.id }
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company profile already exists' },
        { status: 400 }
      )
    }

    const company = await prisma.company.create({
      data: {
        userId: session.user.id,
        name,
        description,
        website,
        logo,
        location,
        size,
        industry,
        businessDetails,
        products: products ? JSON.stringify(products) : null,
        turnover,
        teamSize,
        erpSystem,
        leavesPolicy,
        workingDays: workingDays || 5,
        travelRequired: travelRequired || false,
        workTimings: workTimings ? JSON.stringify(workTimings) : null,
        benefits: benefits ? JSON.stringify(benefits) : null,
        culture,
        officeImages: officeImages ? JSON.stringify(officeImages) : null,
      }
    })

    // Initialize hiring credits with 5 free credits
    await prisma.hiringCredit.create({
      data: {
        companyId: company.id,
        credits: 5,
        totalPurchased: 0,
        totalUsed: 0,
      }
    })

    // Log audit
    await prisma.audit.create({
      data: {
        userId: session.user.id,
        action: 'CREATE',
        resource: 'company',
        resourceId: company.id,
        newData: JSON.stringify(company),
      }
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('Company creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}

// PUT /api/company - Update company profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const {
      name,
      description,
      website,
      logo,
      location,
      size,
      industry,
      // Enhanced company fields
      businessDetails,
      products,
      turnover,
      teamSize,
      erpSystem,
      leavesPolicy,
      workingDays,
      travelRequired,
      workTimings,
      benefits,
      culture,
      officeImages
    } = data

    const updatedCompany = await prisma.company.update({
      where: { userId: session.user.id },
      data: {
        name,
        description,
        website,
        logo,
        location,
        size,
        industry,
        businessDetails,
        products: products ? JSON.stringify(products) : null,
        turnover,
        teamSize,
        erpSystem,
        leavesPolicy,
        workingDays: workingDays || 5,
        travelRequired: travelRequired || false,
        workTimings: workTimings ? JSON.stringify(workTimings) : null,
        benefits: benefits ? JSON.stringify(benefits) : null,
        culture,
        officeImages: officeImages ? JSON.stringify(officeImages) : null,
      }
    })

    // Log audit
    await prisma.audit.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE',
        resource: 'company',
        resourceId: updatedCompany.id,
        newData: JSON.stringify(updatedCompany),
      }
    })

    return NextResponse.json(updatedCompany)
  } catch (error) {
    console.error('Company update error:', error)
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    )
  }
}
