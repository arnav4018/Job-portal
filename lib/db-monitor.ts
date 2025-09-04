import { db } from './db-optimized'

// Database performance monitoring service
export class DatabaseMonitor {
  private static instance: DatabaseMonitor
  private monitoringInterval: NodeJS.Timeout | null = null
  private isMonitoring = false

  private constructor() {}

  static getInstance(): DatabaseMonitor {
    if (!DatabaseMonitor.instance) {
      DatabaseMonitor.instance = new DatabaseMonitor()
    }
    return DatabaseMonitor.instance
  }

  // Start monitoring database performance
  startMonitoring(intervalMs: number = 60000) {
    if (this.isMonitoring) {
      console.log('Database monitoring is already running')
      return
    }

    this.isMonitoring = true
    console.log(`Starting database performance monitoring (interval: ${intervalMs}ms)`)

    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics()
    }, intervalMs)

    // Initial metrics collection
    this.collectMetrics()
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
      this.isMonitoring = false
      console.log('Database monitoring stopped')
    }
  }

  // Collect and log performance metrics
  private async collectMetrics() {
    try {
      const healthCheck = await this.checkDatabaseHealth()
      const performanceMetrics = db.getPerformanceMetrics()
      
      const metrics = {
        timestamp: new Date().toISOString(),
        health: healthCheck,
        performance: performanceMetrics,
        memoryUsage: process.memoryUsage(),
      }

      // Log metrics (in production, you'd send this to a monitoring service)
      if (process.env.NODE_ENV === 'development') {
        console.log('Database Metrics:', JSON.stringify(metrics, null, 2))
      }

      // Alert on performance issues
      this.checkForAlerts(metrics)

      return metrics
    } catch (error) {
      console.error('Failed to collect database metrics:', error)
    }
  }

  // Check database health
  private async checkDatabaseHealth() {
    const startTime = Date.now()
    
    try {
      await db.$queryRaw`SELECT 1 as health_check`
      const responseTime = Date.now() - startTime
      
      return {
        status: 'healthy',
        responseTime,
        connected: true,
      }
    } catch (error) {
      const responseTime = Date.now() - startTime
      
      return {
        status: 'unhealthy',
        responseTime,
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  // Check for performance alerts
  private checkForAlerts(metrics: any) {
    const { health, performance } = metrics

    // Alert thresholds
    const SLOW_RESPONSE_THRESHOLD = 1000 // 1 second
    const HIGH_ERROR_RATE_THRESHOLD = 0.05 // 5%
    const HIGH_SLOW_QUERY_THRESHOLD = 10 // 10 slow queries

    // Health alerts
    if (!health.connected) {
      console.error('🚨 DATABASE ALERT: Database connection lost!')
    } else if (health.responseTime > SLOW_RESPONSE_THRESHOLD) {
      console.warn(`⚠️ DATABASE ALERT: Slow response time (${health.responseTime}ms)`)
    }

    // Performance alerts
    if (performance.totalQueries > 0) {
      const errorRate = performance.failedQueries / performance.totalQueries
      
      if (errorRate > HIGH_ERROR_RATE_THRESHOLD) {
        console.error(`🚨 DATABASE ALERT: High error rate (${(errorRate * 100).toFixed(2)}%)`)
      }
      
      if (performance.slowQueries > HIGH_SLOW_QUERY_THRESHOLD) {
        console.warn(`⚠️ DATABASE ALERT: High number of slow queries (${performance.slowQueries})`)
      }
    }
  }

  // Get current metrics
  async getCurrentMetrics() {
    const healthCheck = await this.checkDatabaseHealth()
    const performanceMetrics = db.getPerformanceMetrics()
    
    return {
      timestamp: new Date().toISOString(),
      health: healthCheck,
      performance: performanceMetrics,
      memoryUsage: process.memoryUsage(),
    }
  }

  // Reset performance counters
  resetMetrics() {
    db.clearMetrics()
    console.log('Database performance metrics reset')
  }
}

// Export singleton instance
export const dbMonitor = DatabaseMonitor.getInstance()

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  dbMonitor.startMonitoring(30000) // Monitor every 30 seconds in dev
}

// Graceful shutdown handling
process.on('SIGTERM', () => {
  dbMonitor.stopMonitoring()
  db.gracefulShutdown()
})

process.on('SIGINT', () => {
  dbMonitor.stopMonitoring()
  db.gracefulShutdown()
})