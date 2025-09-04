import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  description: z.string().min(1, "Description is required"),
  website: z.string().url().optional().or(z.literal("")),
  logo: z.string().nullable().optional(),
  location: z.string().min(1, "Location is required"),
  size: z.string().optional(),
  industry: z.string().min(1, "Industry is required"),
  businessDetails: z.string().optional().nullable(),
  products: z.string().optional().nullable(),
  turnover: z.string().optional().nullable(),
  teamSize: z.string().optional().nullable(),
  erpSystem: z.string().optional().nullable(),
  leavesPolicy: z.string().optional().nullable(),
  workingDays: z.string().optional().nullable(),
  travelRequired: z.string().optional().nullable(),
  workTimings: z.string().optional().nullable(),
  benefits: z.string().optional().nullable(),
  culture: z.string().optional().nullable(),
  officeImages: z.array(z.string()).optional().nullable()
})

// Helper function to safely parse numbers
function parseNumber(value: string | null | undefined): number | null {
  if (!value || value.trim() === '') return null
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : parsed
}

// Helper function to safely parse integers
function parseInt(value: string | null | undefined): number | null {
  if (!value || value.trim() === '') return null
  const parsed = Number.parseInt(value, 10)
  return isNaN(parsed) ? null : parsed
}

// Helper function to parse boolean
function parseBoolean(value: string | null | undefined): boolean {
  if (!value) return false
  return value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes'
}

type CompanyData = z.infer<typeof companySchema>

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const company = await prisma.company.findUnique({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json({ company })
  } catch (error) {
    console.error("Error fetching company:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = companySchema.parse(body)

    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: {
        userId: session.user.id
      }
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: "Company profile already exists" },
        { status: 400 }
      )
    }

    // Transform data for Prisma
    const companyData = {
      name: validatedData.name,
      description: validatedData.description,
      website: validatedData.website || null,
      logo: validatedData.logo,
      location: validatedData.location,
      size: validatedData.size || null,
      industry: validatedData.industry,
      businessDetails: validatedData.businessDetails,
      products: validatedData.products,
      turnover: parseNumber(validatedData.turnover),
      teamSize: parseInt(validatedData.teamSize),
      erpSystem: validatedData.erpSystem,
      leavesPolicy: validatedData.leavesPolicy,
      workingDays: parseInt(validatedData.workingDays),
      travelRequired: parseBoolean(validatedData.travelRequired),
      workTimings: validatedData.workTimings,
      benefits: validatedData.benefits,
      culture: validatedData.culture,
      officeImages: validatedData.officeImages ? JSON.stringify(validatedData.officeImages) : null,
      userId: session.user.id,
      verified: false
    }

    const company = await prisma.company.create({
      data: companyData
    })

    return NextResponse.json({ company }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creating company:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = companySchema.parse(body)

    // Transform data for Prisma
    const companyData = {
      name: validatedData.name,
      description: validatedData.description,
      website: validatedData.website || null,
      logo: validatedData.logo,
      location: validatedData.location,
      size: validatedData.size || null,
      industry: validatedData.industry,
      businessDetails: validatedData.businessDetails,
      products: validatedData.products,
      turnover: parseNumber(validatedData.turnover),
      teamSize: parseInt(validatedData.teamSize),
      erpSystem: validatedData.erpSystem,
      leavesPolicy: validatedData.leavesPolicy,
      workingDays: parseInt(validatedData.workingDays),
      travelRequired: parseBoolean(validatedData.travelRequired),
      workTimings: validatedData.workTimings,
      benefits: validatedData.benefits,
      culture: validatedData.culture,
      officeImages: validatedData.officeImages ? JSON.stringify(validatedData.officeImages) : null
    }

    const company = await prisma.company.upsert({
      where: {
        userId: session.user.id
      },
      update: companyData,
      create: {
        ...companyData,
        userId: session.user.id,
        verified: false
      }
    })

    return NextResponse.json({ company })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating company:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
