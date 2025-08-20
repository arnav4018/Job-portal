import { NextRequest, NextResponse } from "next/server"
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log("Signup request received")
    
    const body = await request.json()
    console.log("Request body:", body)
    
    const { email, name, password, role } = body

    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    console.log("Checking for existing user...")
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log("User already exists")
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    console.log("Hashing password...")
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    console.log("Creating user...")
    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || 'CANDIDATE',
      }
    })

    console.log("User created:", user.id)

    // Skip profile creation for now - can be done later
    console.log("User created successfully, skipping profile creation for now")

    console.log("Signup successful")
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      } 
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined 
      },
      { status: 500 }
    )
  }
}
