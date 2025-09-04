import { NextRequest, NextResponse } from 'next/server'
import { checkDatabaseHealth, db } from '@/lib/db-optimized'
import { dbMonitor } from '@/lib/db-monitor'

export async function GET(request: NextRequest) {
  try {
    // Get comprehensive database health information
    const [healthCheck, performanceMetrics, currentMetrics] = await Promise.all([
      checkDatabaseHealth(),
      db.getPerformanceMetrics(),
      dbMonitor.getCurrentMetrics(),
    ])

    const response = {
      status: healthCheck.connected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: healthCheck.connected,
        responseTime: healthCheck.responseTime,
        error: healthCheck.error,
      },
      performance: performanceMetrics,
      system: {
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
        nodeVersion: process.version,
      },
      monitoring: {
        isActive: true,
        lastCheck: currentMetrics.timestamp,
      },
    }

    // Return appropriate HTTP status based on health
    const status = healthCheck.connected ? 200 : 503

    return NextResponse.json(response, { status })
  } catch (error) {
    console.error('Database health check failed:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        database: {
          connected: false,
          responseTime: 0,
        },
      },
      { status: 500 }
    )
  }
}

// Reset performance metrics (useful for testing)
export async function DELETE(request: NextRequest) {
  try {
    dbMonitor.resetMetrics()
    
    return NextResponse.json({
      status: 'success',
      message: 'Database performance metrics reset',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to reset metrics:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to reset metrics',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}