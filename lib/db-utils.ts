import { db } from './db-optimized'
import { Prisma } from '@prisma/client'

// Common database operations with optimizations
export class DatabaseUtils {
  // Optimized user queries with caching considerations
  static async findUserWithProfile(userId: string) {
    return db.executeWithTimeout(async () => {
      return db.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          company: true,
        },
      })
    })
  }

  // Optimized job search with pagination and filtering
  static async searchJobs(params: {
    query?: string
    location?: string
    type?: string
    experienceLevel?: string
    salaryMin?: number
    salaryMax?: number
    page?: number
    limit?: number
  }) {
    const {
      query,
      location,
      type,
      experienceLevel,
      salaryMin,
      salaryMax,
      page = 1,
      limit = 10,
    } = params

    const where: Prisma.JobWhereInput = {
      status: 'PUBLISHED',
      ...(query && {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { skills: { contains: query } },
        ],
      }),
      ...(location && {
        location: { contains: location },
      }),
      ...(type && { type }),
      ...(experienceLevel && { experienceLevel }),
      ...(salaryMin && { salaryMin: { gte: salaryMin } }),
      ...(salaryMax && { salaryMax: { lte: salaryMax } }),
    }

    return db.executeWithTimeout(async () => {
      const [jobs, total] = await Promise.all([
        db.job.findMany({
          where,
          include: {
            company: {
              select: {
                name: true,
                logo: true,
                location: true,
              },
            },
            _count: {
              select: {
                applications: true,
              },
            },
          },
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' },
          ],
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.job.count({ where }),
      ])

      return {
        jobs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      }
    })
  }

  // Optimized application queries with status tracking
  static async getUserApplications(userId: string, page = 1, limit = 10) {
    return db.executeWithTimeout(async () => {
      const [applications, total] = await Promise.all([
        db.application.findMany({
          where: { candidateId: userId },
          include: {
            job: {
              include: {
                company: {
                  select: {
                    name: true,
                    logo: true,
                  },
                },
              },
            },
            interviews: {
              orderBy: { scheduledAt: 'desc' },
              take: 1,
            },
          },
          orderBy: { appliedAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.application.count({ where: { candidateId: userId } }),
      ])

      return {
        applications,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      }
    })
  }

  // Optimized recruiter dashboard data
  static async getRecruiterStats(recruiterId: string) {
    return db.executeWithTimeout(async () => {
      const [
        totalJobs,
        activeJobs,
        totalApplications,
        pendingInterviews,
        pendingApplications,
      ] = await Promise.all([
        db.job.count({
          where: { recruiterId },
        }),
        db.job.count({
          where: { 
            recruiterId,
            status: 'PUBLISHED',
          },
        }),
        db.application.count({
          where: {
            job: {
              recruiterId,
            },
          },
        }),
        db.interview.count({
          where: {
            application: {
              job: {
                recruiterId,
              },
            },
            status: 'SCHEDULED',
          },
        }),
        db.application.count({
          where: {
            job: {
              recruiterId,
            },
            status: 'APPLIED',
          },
        }),
      ])

      return {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingInterviews,
        pendingApplications,
      }
    }, 10000) // 10 second timeout for dashboard queries
  }

  // Batch operations for better performance
  static async batchUpdateApplicationStatus(
    applicationIds: string[],
    status: string,
    notes?: string
  ) {
    return db.executeWithTimeout(async () => {
      return db.application.updateMany({
        where: {
          id: { in: applicationIds },
        },
        data: {
          status,
          ...(notes && { notes }),
          updatedAt: new Date(),
        },
      })
    })
  }

  // Optimized search with full-text simulation
  static buildSearchConditions(searchTerm: string, fields: string[]) {
    if (!searchTerm) return {}
    
    const searchConditions = fields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as const,
      },
    }))

    return {
      OR: searchConditions,
    }
  }

  // Connection pool health check
  static async healthCheck() {
    return db.executeWithTimeout(async () => {
      const result = await db.$queryRaw`SELECT 1 as health`
      return { healthy: true, result }
    }, 5000) // 5 second timeout for health checks
  }

  // Clean up old data (for maintenance)
  static async cleanupOldData() {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    return db.executeWithTimeout(async () => {
      // Clean up old job searches
      const deletedSearches = await db.jobSearch.deleteMany({
        where: {
          createdAt: { lt: thirtyDaysAgo },
        },
      })

      // Clean up old notifications
      const deletedNotifications = await db.notification.deleteMany({
        where: {
          createdAt: { lt: thirtyDaysAgo },
          read: true,
        },
      })

      return {
        deletedSearches: deletedSearches.count,
        deletedNotifications: deletedNotifications.count,
      }
    }, 30000) // 30 second timeout for cleanup operations
  }
}

// Export utility functions
export const dbUtils = DatabaseUtils