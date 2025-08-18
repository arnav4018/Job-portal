import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    const { email, name, role } = await request.json()

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Create new user
    const user = await db.user.create({
      data: {
        email,
        name,
        role: role as UserRole,
      }
    })

    // Create profile based on role
    if (role === "candidate") {
      await db.profile.create({
        data: {
          userId: user.id,
          firstName: name?.split(" ")[0] || "",
          lastName: name?.split(" ").slice(1).join(" ") || "",
        }
      })
    } else if (role === "recruiter") {
      await db.company.create({
        data: {
          userId: user.id,
          name: `${name}'s Company`, // Placeholder
        }
      })
    }

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}