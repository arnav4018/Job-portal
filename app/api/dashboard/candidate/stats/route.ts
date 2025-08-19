import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get candidate stats
    const [appliedJobs, savedJobs, profileViews, resumeDownloads] = await Promise.all([
      db.application.count({
        where: { candidateId: userId }
      }),
      db.jobSearch.count({
        where: { userId }
      }),
      // Mock profile views for now
      Promise.resolve(Math.floor(Math.random() * 100) + 50),
      db.resume.aggregate({
        where: { userId },
        _sum: { downloadCount: true }
      })
    ])

    return NextResponse.json({
      appliedJobs,
      savedJobs,
      profileViews,
      resumeDownloads: resumeDownloads._sum.downloadCount || 0
    })
  } catch (error) {
    console.error("Error fetching candidate stats:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}