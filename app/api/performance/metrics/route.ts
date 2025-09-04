import { NextRequest, NextResponse } from 'next/server'
import { performanceMonitor } from '@/lib/performance-monitor'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as any
    const limit = parseInt(searchParams.get('limit') || '50')

    let data
    
    if (type) {
      data = performanceMonitor.getMetricsByType(type, limit)
    } else {
      data = performanceMonitor.getPerformanceSummary()
    }

    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      data,
    })
  } catch (error) {
    console.error('Failed to get performance metrics:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to retrieve performance metrics',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, duration, metadata } = body

    // Validate required fields
    if (!name || !type || typeof duration !== 'number') {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Missing required fields: name, type, duration',
        },
        { status: 400 }
      )
    }

    // Track the performance metric
    switch (type) {
      case 'page-load':
        performanceMonitor.trackPageLoad(name, duration, metadata)
        break
      case 'component-render':
        performanceMonitor.trackComponentRender(name, duration, metadata)
        break
      case 'api-call':
        performanceMonitor.trackApiCall(name, duration, metadata)
        break
      default:
        return NextResponse.json(
          {
            status: 'error',
            message: 'Invalid metric type',
          },
          { status: 400 }
        )
    }

    return NextResponse.json({
      status: 'success',
      message: 'Performance metric recorded',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to record performance metric:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to record performance metric',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    performanceMonitor.clearMetrics()
    
    return NextResponse.json({
      status: 'success',
      message: 'Performance metrics cleared',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Failed to clear performance metrics:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to clear performance metrics',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}