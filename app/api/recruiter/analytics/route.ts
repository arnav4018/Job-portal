import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get("days") || "30")
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get basic stats
    const totalJobs = await prisma.job.count({
      where: { recruiterId: session.user.id }
    })

    const activeJobs = await prisma.job.count({
      where: { 
        recruiterId: session.user.id,
        status: "ACTIVE"
      }
    })

    const totalApplications = await prisma.application.count({
      where: {
        job: {
          recruiterId: session.user.id
        },
        appliedAt: {
          gte: startDate
        }
      }
    })

    const totalViews = await prisma.job.aggregate({
      where: { 
        recruiterId: session.user.id,
        createdAt: {
          gte: startDate
        }
      },
      _sum: {
        views: true
      }
    })

    const averageApplicationsPerJob = totalJobs > 0 ? totalApplications / totalJobs : 0

    // Get top performing jobs
    const topPerformingJobs = await prisma.job.findMany({
      where: {
        recruiterId: session.user.id,
        createdAt: {
          gte: startDate
        }
      },
      include: {
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: {
        applications: {
          _count: "desc"
        }
      },
      take: 5
    })

    // Get recent activity
    const recentApplications = await prisma.application.findMany({
      where: {
        job: {
          recruiterId: session.user.id
        },
        appliedAt: {
          gte: startDate
        }
      },
      include: {
        job: {
          select: {
            title: true
          }
        },
        candidate: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        appliedAt: "desc"
      },
      take: 10
    })

    const recentActivity = recentApplications.map(app => ({
      type: "application",
      description: `${app.candidate.name} applied to ${app.job.title}`,
      date: app.appliedAt.toISOString()
    }))

    const analytics = {
      totalJobs,
      activeJobs,
      totalApplications,
      totalViews: totalViews._sum.views || 0,
      averageApplicationsPerJob,
      topPerformingJobs: topPerformingJobs.map(job => ({
        id: job.id,
        title: job.title,
        applications: job._count.applications,
        views: job.views
      })),
      recentActivity
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
