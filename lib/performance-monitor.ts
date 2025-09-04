import { performance, PerformanceObserver } from 'perf_hooks'
import React from 'react'

// Performance metrics interface
interface PerformanceMetric {
  id: string
  name: string
  type: 'page-load' | 'component-render' | 'api-call' | 'database-query' | 'navigation'
  startTime: number
  endTime: number
  duration: number
  metadata?: Record<string, any>
  timestamp: Date
  url?: string
  userAgent?: string
}

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  PAGE_LOAD: 3000, // 3 seconds
  COMPONENT_RENDER: 100, // 100ms
  API_CALL: 2000, // 2 seconds
  DATABASE_QUERY: 5000, // 5 seconds
  NAVIGATION: 1000, // 1 second
}

// Performance monitoring class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []
  private observers: PerformanceObserver[] = []
  private isMonitoring = false

  private constructor() {
    this.setupPerformanceObservers()
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Start performance monitoring
  startMonitoring() {
    if (this.isMonitoring) {
      console.log('Performance monitoring is already active')
      return
    }

    this.isMonitoring = true
    console.log('Performance monitoring started')

    // Start observing performance entries
    this.observers.forEach((observer, index) => {
      try {
        // Different observers for different entry types
        if (index === 0) {
          observer.observe({ type: 'resource', buffered: true })
        } else if (index === 1) {
          observer.observe({ type: 'measure', buffered: true })
        }
      } catch (error) {
        console.warn('Failed to start performance observer:', error)
        // Fallback to legacy entryTypes if available
        try {
          observer.observe({ entryTypes: ['resource', 'measure'] })
        } catch (fallbackError) {
          console.warn('Fallback observer also failed:', fallbackError)
        }
      }
    })
    
    // Handle navigation timing separately
    this.checkNavigationTiming()
  }

  // Stop performance monitoring
  stopMonitoring() {
    if (!this.isMonitoring) {
      return
    }

    this.isMonitoring = false
    console.log('Performance monitoring stopped')

    // Disconnect all observers
    this.observers.forEach(observer => {
      observer.disconnect()
    })
  }

  // Setup performance observers
  private setupPerformanceObservers() {
    // Only set up observers in browser environment and avoid TypeScript issues
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Resource timing observer
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              this.recordResourceMetric(entry as any)
            }
          })
        })
        
        this.observers.push(resourceObserver)
      } catch (error) {
        console.warn('Resource observer not supported:', error)
      }

      // Measure observer for custom metrics
      try {
        const measureObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.entryType === 'measure') {
              this.recordCustomMetric(entry as any)
            }
          })
        })
        
        this.observers.push(measureObserver)
      } catch (error) {
        console.warn('Measure observer not supported:', error)
      }
    }
  }

  // Record navigation metrics
  private recordNavigationMetric(entry: PerformanceNavigationTiming) {
    const metric: PerformanceMetric = {
      id: `nav-${Date.now()}`,
      name: 'page-navigation',
      type: 'navigation',
      startTime: entry.startTime || 0,
      endTime: entry.loadEventEnd || 0,
      duration: (entry.loadEventEnd || 0) - (entry.startTime || 0),
      timestamp: new Date(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      metadata: {
        domContentLoaded: (entry.domContentLoadedEventEnd || 0) - (entry.startTime || 0),
        firstPaint: (entry.responseEnd || 0) - (entry.startTime || 0),
        domInteractive: (entry.domInteractive || 0) - (entry.startTime || 0),
        redirectCount: entry.redirectCount,
        type: entry.type,
      },
    }

    this.addMetric(metric)
  }

  // Record resource loading metrics
  private recordResourceMetric(entry: PerformanceResourceTiming) {
    // Only track significant resources
    if (entry.duration > 100) {
      const metric: PerformanceMetric = {
        id: `resource-${Date.now()}-${Math.random()}`,
        name: entry.name,
        type: 'page-load',
        startTime: entry.startTime,
        endTime: entry.responseEnd,
        duration: entry.duration,
        timestamp: new Date(),
        metadata: {
          initiatorType: entry.initiatorType,
          transferSize: entry.transferSize,
          encodedBodySize: entry.encodedBodySize,
          decodedBodySize: entry.decodedBodySize,
        },
      }

      this.addMetric(metric)
    }
  }

  // Record custom performance measures
  private recordCustomMetric(entry: PerformanceMeasure) {
    const metric: PerformanceMetric = {
      id: `custom-${Date.now()}-${Math.random()}`,
      name: entry.name,
      type: this.getMetricTypeFromName(entry.name),
      startTime: entry.startTime,
      endTime: entry.startTime + entry.duration,
      duration: entry.duration,
      timestamp: new Date(),
    }

    this.addMetric(metric)
  }

  // Determine metric type from name
  private getMetricTypeFromName(name: string): PerformanceMetric['type'] {
    if (name.includes('component')) return 'component-render'
    if (name.includes('api')) return 'api-call'
    if (name.includes('db') || name.includes('database')) return 'database-query'
    if (name.includes('nav') || name.includes('route')) return 'navigation'
    return 'page-load'
  }

  // Add metric to collection
  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)

    // Check for performance issues
    this.checkPerformanceThreshold(metric)

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500)
    }
  }

  // Check if metric exceeds performance thresholds
  private checkPerformanceThreshold(metric: PerformanceMetric) {
    let threshold: number

    switch (metric.type) {
      case 'page-load':
        threshold = PERFORMANCE_THRESHOLDS.PAGE_LOAD
        break
      case 'component-render':
        threshold = PERFORMANCE_THRESHOLDS.COMPONENT_RENDER
        break
      case 'api-call':
        threshold = PERFORMANCE_THRESHOLDS.API_CALL
        break
      case 'database-query':
        threshold = PERFORMANCE_THRESHOLDS.DATABASE_QUERY
        break
      case 'navigation':
        threshold = PERFORMANCE_THRESHOLDS.NAVIGATION
        break
      default:
        return
    }

    if (metric.duration > threshold) {
      console.warn(`⚠️ Performance threshold exceeded for ${metric.type}:`, {
        name: metric.name,
        duration: `${metric.duration.toFixed(2)}ms`,
        threshold: `${threshold}ms`,
        url: metric.url,
      })
    }
  }

  // Manual performance tracking methods
  startMeasure(name: string, metadata?: Record<string, any>) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${name}-start`)
      
      // Store metadata for later use
      if (metadata) {
        (globalThis as any).__performanceMetadata = {
          ...(globalThis as any).__performanceMetadata,
          [name]: metadata,
        }
      }
    }
  }

  endMeasure(name: string) {
    if (typeof performance !== 'undefined') {
      try {
        performance.mark(`${name}-end`)
        performance.measure(name, `${name}-start`, `${name}-end`)
        
        // Clean up marks
        performance.clearMarks(`${name}-start`)
        performance.clearMarks(`${name}-end`)
      } catch (error) {
        console.warn(`Failed to end measure for ${name}:`, error)
      }
    }
  }

  // Track page load time
  trackPageLoad(pageName: string, loadTime: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      id: `page-${Date.now()}`,
      name: pageName,
      type: 'page-load',
      startTime: performance.now() - loadTime,
      endTime: performance.now(),
      duration: loadTime,
      timestamp: new Date(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      metadata,
    }

    this.addMetric(metric)
  }

  // Track component render time
  trackComponentRender(componentName: string, renderTime: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      id: `component-${Date.now()}`,
      name: componentName,
      type: 'component-render',
      startTime: performance.now() - renderTime,
      endTime: performance.now(),
      duration: renderTime,
      timestamp: new Date(),
      metadata,
    }

    this.addMetric(metric)
  }

  // Track API call performance
  trackApiCall(endpoint: string, duration: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      id: `api-${Date.now()}`,
      name: endpoint,
      type: 'api-call',
      startTime: performance.now() - duration,
      endTime: performance.now(),
      duration,
      timestamp: new Date(),
      metadata,
    }

    this.addMetric(metric)
  }

  // Get performance summary
  getPerformanceSummary() {
    const now = Date.now()
    const last5Minutes = this.metrics.filter(m => 
      now - m.timestamp.getTime() < 5 * 60 * 1000
    )

    const summary = {
      totalMetrics: this.metrics.length,
      recentMetrics: last5Minutes.length,
      averageDurations: {} as Record<string, number>,
      slowestOperations: this.metrics
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10),
      thresholdViolations: this.metrics.filter(m => {
        const threshold = PERFORMANCE_THRESHOLDS[m.type.toUpperCase().replace('-', '_') as keyof typeof PERFORMANCE_THRESHOLDS]
        return threshold && m.duration > threshold
      }).length,
    }

    // Calculate average durations by type
    const typeGroups = this.groupBy(last5Minutes, 'type')
    Object.entries(typeGroups).forEach(([type, metrics]) => {
      const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length
      summary.averageDurations[type] = Math.round(avgDuration * 100) / 100
    })

    return summary
  }

  // Get metrics by type
  getMetricsByType(type: PerformanceMetric['type'], limit = 50) {
    return this.metrics
      .filter(m => m.type === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  // Clear all metrics
  clearMetrics() {
    this.metrics = []
    console.log('Performance metrics cleared')
  }

  // Check navigation timing separately (since 'navigation' is not a valid EntryType for PerformanceObserver)
  private checkNavigationTiming() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        // Get navigation timing from performance.getEntriesByType
        // Use type assertion to bypass TypeScript type checking for browser API
        const navigationEntries = (performance as any).getEntriesByType('navigation') as PerformanceNavigationTiming[]
        
        navigationEntries.forEach(entry => {
          this.recordNavigationMetric(entry)
        })
      } catch (error) {
        console.warn('Failed to get navigation timing:', error)
      }
    }
  }

  // Helper method to group array by property
  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = String(item[key])
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {} as Record<string, T[]>)
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Auto-start monitoring in browser
if (typeof window !== 'undefined') {
  performanceMonitor.startMonitoring()
}

// Performance tracking utilities
export const performanceUtils = {
  // Higher-order component for tracking component render time
  withPerformanceTracking: <P extends object>(
    Component: React.ComponentType<P>,
    componentName: string
  ) => {
    return (props: P) => {
      const startTime = performance.now()
      
      React.useEffect(() => {
        const endTime = performance.now()
        performanceMonitor.trackComponentRender(
          componentName,
          endTime - startTime
        )
      })

      return React.createElement(Component, props)
    }
  },

  // Async function wrapper for performance tracking
  withAsyncPerformanceTracking: <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    operationName: string
  ) => {
    return async (...args: T): Promise<R> => {
      const startTime = performance.now()
      
      try {
        const result = await fn(...args)
        const duration = performance.now() - startTime
        
        performanceMonitor.trackApiCall(operationName, duration, {
          success: true,
        })
        
        return result
      } catch (error) {
        const duration = performance.now() - startTime
        
        performanceMonitor.trackApiCall(operationName, duration, {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        
        throw error
      }
    }
  },
}