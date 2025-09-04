import { PrismaClient } from '@prisma/client'
import { performance } from 'perf_hooks'
import { DatabaseErrorHandler, DatabaseRetryHandler } from './db-error-handler'

// Performance monitoring interface
interface QueryMetrics {
  query: string
  duration: number
  timestamp: Date
  success: boolean
  error?: string
}

// Database configuration with optimizations
const dbConfig = {
  // Connection pool settings
  connectionLimit: 10,
  // Query timeout in milliseconds
  queryTimeout: 30000,
  // Slow query threshold in milliseconds
  slowQueryThreshold: 5000,
  // Enable query logging in development
  enableLogging: process.env.NODE_ENV === 'development',
}

class OptimizedPrismaClient extends PrismaClient {
  private queryMetrics: QueryMetrics[] = []
  private slowQueries: QueryMetrics[] = []

  constructor() {
    super({
      log: dbConfig.enableLogging ? [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ] : ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    })

    // Set up query monitoring
    this.setupQueryMonitoring()
  }

  private setupQueryMonitoring() {
    if (dbConfig.enableLogging) {
      // Use type assertion for Prisma event listener
      (this as any).$on('query', (e: any) => {
        const duration = e.duration || 0
        const isSlowQuery = duration > dbConfig.slowQueryThreshold

        const metric: QueryMetrics = {
          query: e.query || 'Unknown query',
          duration,
          timestamp: new Date(e.timestamp || Date.now()),
          success: true,
        }

        this.queryMetrics.push(metric)
        
        if (isSlowQuery) {
          this.slowQueries.push(metric)
          console.warn(`Slow query detected (${duration}ms):`, e.query || 'Unknown query')
        }

        // Keep only last 1000 metrics to prevent memory leaks
        if (this.queryMetrics.length > 1000) {
          this.queryMetrics = this.queryMetrics.slice(-500)
        }
      })
    }
  }

  // Enhanced query execution with timeout and error handling
  async executeWithTimeout<T>(
    queryFn: () => Promise<T>,
    timeoutMs: number = dbConfig.queryTimeout
  ): Promise<T> {
    const startTime = performance.now()
    
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Query timeout after ${timeoutMs}ms`))
        }, timeoutMs)
      })

      const result = await Promise.race([queryFn(), timeoutPromise])
      
      const duration = performance.now() - startTime
      
      // Log successful query
      if (dbConfig.enableLogging && duration > dbConfig.slowQueryThreshold) {
        console.warn(`Slow query completed in ${duration.toFixed(2)}ms`)
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      // Log failed query
      const metric: QueryMetrics = {
        query: 'Unknown query',
        duration,
        timestamp: new Date(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
      
      this.queryMetrics.push(metric)
      
      const dbError = DatabaseErrorHandler.handle(error)
      console.error(`Database query failed after ${duration.toFixed(2)}ms:`, dbError.message)
      throw dbError
    }
  }

  // Execute with retry mechanism
  async executeWithRetry<T>(
    queryFn: () => Promise<T>,
    maxRetries = 3,
    timeoutMs: number = dbConfig.queryTimeout
  ): Promise<T> {
    return DatabaseRetryHandler.withRetry(
      () => this.executeWithTimeout(queryFn, timeoutMs),
      maxRetries
    )
  }

  // Get performance metrics
  getPerformanceMetrics() {
    const totalQueries = this.queryMetrics.length
    const successfulQueries = this.queryMetrics.filter(m => m.success).length
    const failedQueries = totalQueries - successfulQueries
    const avgDuration = totalQueries > 0 
      ? this.queryMetrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries 
      : 0

    return {
      totalQueries,
      successfulQueries,
      failedQueries,
      avgDuration: Math.round(avgDuration * 100) / 100,
      slowQueries: this.slowQueries.length,
      slowQueryThreshold: dbConfig.slowQueryThreshold,
      recentSlowQueries: this.slowQueries.slice(-10),
    }
  }

  // Clear metrics (useful for testing)
  clearMetrics() {
    this.queryMetrics = []
    this.slowQueries = []
  }

  // Graceful shutdown
  async gracefulShutdown() {
    console.log('Shutting down database connection...')
    await this.$disconnect()
    console.log('Database connection closed')
  }
}

// Global instance management
const globalForPrisma = globalThis as unknown as {
  prisma: OptimizedPrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new OptimizedPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

// Connection health check
export async function checkDatabaseHealth(): Promise<{
  connected: boolean
  responseTime: number
  error?: string
}> {
  const startTime = performance.now()
  
  try {
    await db.$queryRaw`SELECT 1 as health_check`
    const responseTime = performance.now() - startTime
    
    return {
      connected: true,
      responseTime: Math.round(responseTime * 100) / 100,
    }
  } catch (error) {
    const responseTime = performance.now() - startTime
    
    return {
      connected: false,
      responseTime: Math.round(responseTime * 100) / 100,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Query optimization helpers
export const queryHelpers = {
  // Paginated query with performance optimization
  async paginatedQuery<T>(
    model: any,
    options: {
      where?: any
      orderBy?: any
      page?: number
      limit?: number
      include?: any
      select?: any
    }
  ): Promise<{ data: T[]; total: number; page: number; totalPages: number }> {
    const { where, orderBy, page = 1, limit = 10, include, select } = options
    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      model.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include,
        select,
      }),
      model.count({ where }),
    ])

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  },

  // Batch operations for better performance
  async batchCreate<T>(model: any, data: T[], batchSize: number = 100): Promise<void> {
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      await model.createMany({
        data: batch,
        skipDuplicates: true,
      })
    }
  },

  // Optimized search with full-text search simulation
  buildSearchQuery(searchTerm: string, fields: string[]) {
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
  },
}

// Export the optimized client
export { OptimizedPrismaClient }