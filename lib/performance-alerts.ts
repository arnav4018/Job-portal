import { performanceMonitor } from './performance-monitor'

// Alert severity levels
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Alert types
export enum AlertType {
  SLOW_PAGE_LOAD = 'slow_page_load',
  SLOW_COMPONENT_RENDER = 'slow_component_render',
  SLOW_API_CALL = 'slow_api_call',
  SLOW_DATABASE_QUERY = 'slow_database_query',
  HIGH_ERROR_RATE = 'high_error_rate',
  MEMORY_USAGE = 'memory_usage',
  PERFORMANCE_DEGRADATION = 'performance_degradation',
}

// Performance alert interface
interface PerformanceAlert {
  id: string
  type: AlertType
  severity: AlertSeverity
  message: string
  details: Record<string, any>
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
}

// Alert thresholds configuration
const ALERT_THRESHOLDS = {
  [AlertType.SLOW_PAGE_LOAD]: {
    medium: 3000, // 3 seconds
    high: 5000,   // 5 seconds
    critical: 10000, // 10 seconds
  },
  [AlertType.SLOW_COMPONENT_RENDER]: {
    medium: 100,  // 100ms
    high: 500,    // 500ms
    critical: 1000, // 1 second
  },
  [AlertType.SLOW_API_CALL]: {
    medium: 2000, // 2 seconds
    high: 5000,   // 5 seconds
    critical: 10000, // 10 seconds
  },
  [AlertType.SLOW_DATABASE_QUERY]: {
    medium: 1000, // 1 second
    high: 5000,   // 5 seconds
    critical: 10000, // 10 seconds
  },
  [AlertType.HIGH_ERROR_RATE]: {
    medium: 0.05, // 5%
    high: 0.10,   // 10%
    critical: 0.20, // 20%
  },
}

// Performance alert manager
export class PerformanceAlertManager {
  private static instance: PerformanceAlertManager
  private alerts: PerformanceAlert[] = []
  private alertCallbacks: ((alert: PerformanceAlert) => void)[] = []
  private isMonitoring = false
  private monitoringInterval: NodeJS.Timeout | null = null

  private constructor() {}

  static getInstance(): PerformanceAlertManager {
    if (!PerformanceAlertManager.instance) {
      PerformanceAlertManager.instance = new PerformanceAlertManager()
    }
    return PerformanceAlertManager.instance
  }

  // Start alert monitoring
  startMonitoring(intervalMs: number = 30000) {
    if (this.isMonitoring) {
      console.log('Performance alert monitoring is already active')
      return
    }

    this.isMonitoring = true
    console.log(`Starting performance alert monitoring (interval: ${intervalMs}ms)`)

    this.monitoringInterval = setInterval(() => {
      this.checkPerformanceAlerts()
    }, intervalMs)

    // Initial check
    this.checkPerformanceAlerts()
  }

  // Stop alert monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
      this.isMonitoring = false
      console.log('Performance alert monitoring stopped')
    }
  }

  // Add alert callback
  onAlert(callback: (alert: PerformanceAlert) => void) {
    this.alertCallbacks.push(callback)
  }

  // Remove alert callback
  removeAlertCallback(callback: (alert: PerformanceAlert) => void) {
    const index = this.alertCallbacks.indexOf(callback)
    if (index > -1) {
      this.alertCallbacks.splice(index, 1)
    }
  }

  // Check for performance alerts
  private checkPerformanceAlerts() {
    try {
      const summary = performanceMonitor.getPerformanceSummary()
      
      // Check average durations
      Object.entries(summary.averageDurations).forEach(([type, avgDuration]) => {
        this.checkDurationAlert(type, avgDuration)
      })

      // Check error rates
      this.checkErrorRates()

      // Check memory usage
      this.checkMemoryUsage()

      // Check for performance degradation
      this.checkPerformanceDegradation()

    } catch (error) {
      console.error('Failed to check performance alerts:', error)
    }
  }

  // Check duration-based alerts
  private checkDurationAlert(type: string, duration: number) {
    let alertType: AlertType
    
    switch (type) {
      case 'page-load':
        alertType = AlertType.SLOW_PAGE_LOAD
        break
      case 'component-render':
        alertType = AlertType.SLOW_COMPONENT_RENDER
        break
      case 'api-call':
        alertType = AlertType.SLOW_API_CALL
        break
      case 'database-query':
        alertType = AlertType.SLOW_DATABASE_QUERY
        break
      default:
        return
    }

    const thresholds = ALERT_THRESHOLDS[alertType]
    if (!thresholds) return

    let severity: AlertSeverity | null = null

    if (duration >= thresholds.critical) {
      severity = AlertSeverity.CRITICAL
    } else if (duration >= thresholds.high) {
      severity = AlertSeverity.HIGH
    } else if (duration >= thresholds.medium) {
      severity = AlertSeverity.MEDIUM
    }

    if (severity) {
      this.createAlert(alertType, severity, {
        type,
        duration,
        threshold: thresholds,
        message: `${type} performance is degraded (${duration.toFixed(2)}ms average)`,
      })
    }
  }

  // Check error rates
  private checkErrorRates() {
    const apiMetrics = performanceMonitor.getMetricsByType('api-call', 100)
    
    if (apiMetrics.length === 0) return

    const failedCalls = apiMetrics.filter(m => m.metadata?.success === false).length
    const errorRate = failedCalls / apiMetrics.length

    const thresholds = ALERT_THRESHOLDS[AlertType.HIGH_ERROR_RATE]
    let severity: AlertSeverity | null = null

    if (errorRate >= thresholds.critical) {
      severity = AlertSeverity.CRITICAL
    } else if (errorRate >= thresholds.high) {
      severity = AlertSeverity.HIGH
    } else if (errorRate >= thresholds.medium) {
      severity = AlertSeverity.MEDIUM
    }

    if (severity) {
      this.createAlert(AlertType.HIGH_ERROR_RATE, severity, {
        errorRate: errorRate * 100,
        failedCalls,
        totalCalls: apiMetrics.length,
        message: `High API error rate detected (${(errorRate * 100).toFixed(2)}%)`,
      })
    }
  }

  // Check memory usage
  private checkMemoryUsage() {
    if (typeof process !== 'undefined') {
      const memoryUsage = process.memoryUsage()
      const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024
      const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024
      const heapUsagePercent = (heapUsedMB / heapTotalMB) * 100

      let severity: AlertSeverity | null = null

      if (heapUsagePercent >= 90) {
        severity = AlertSeverity.CRITICAL
      } else if (heapUsagePercent >= 80) {
        severity = AlertSeverity.HIGH
      } else if (heapUsagePercent >= 70) {
        severity = AlertSeverity.MEDIUM
      }

      if (severity) {
        this.createAlert(AlertType.MEMORY_USAGE, severity, {
          heapUsedMB: heapUsedMB.toFixed(2),
          heapTotalMB: heapTotalMB.toFixed(2),
          heapUsagePercent: heapUsagePercent.toFixed(2),
          message: `High memory usage detected (${heapUsagePercent.toFixed(2)}%)`,
        })
      }
    }
  }

  // Check for performance degradation trends
  private checkPerformanceDegradation() {
    const recentMetrics = performanceMonitor.getMetricsByType('page-load', 50)
    
    if (recentMetrics.length < 10) return

    // Compare recent performance with baseline
    const recent = recentMetrics.slice(0, 10)
    const baseline = recentMetrics.slice(-10)

    const recentAvg = recent.reduce((sum, m) => sum + m.duration, 0) / recent.length
    const baselineAvg = baseline.reduce((sum, m) => sum + m.duration, 0) / baseline.length

    const degradationPercent = ((recentAvg - baselineAvg) / baselineAvg) * 100

    let severity: AlertSeverity | null = null

    if (degradationPercent >= 100) { // 100% slower
      severity = AlertSeverity.CRITICAL
    } else if (degradationPercent >= 50) { // 50% slower
      severity = AlertSeverity.HIGH
    } else if (degradationPercent >= 25) { // 25% slower
      severity = AlertSeverity.MEDIUM
    }

    if (severity) {
      this.createAlert(AlertType.PERFORMANCE_DEGRADATION, severity, {
        recentAvg: recentAvg.toFixed(2),
        baselineAvg: baselineAvg.toFixed(2),
        degradationPercent: degradationPercent.toFixed(2),
        message: `Performance degradation detected (${degradationPercent.toFixed(2)}% slower)`,
      })
    }
  }

  // Create and fire alert
  private createAlert(type: AlertType, severity: AlertSeverity, details: Record<string, any>) {
    // Check if similar alert already exists and is not resolved
    const existingAlert = this.alerts.find(alert => 
      alert.type === type && 
      !alert.resolved && 
      Date.now() - alert.timestamp.getTime() < 5 * 60 * 1000 // Within last 5 minutes
    )

    if (existingAlert) {
      // Update existing alert instead of creating duplicate
      existingAlert.details = { ...existingAlert.details, ...details }
      existingAlert.timestamp = new Date()
      return
    }

    const alert: PerformanceAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message: details.message || `Performance alert: ${type}`,
      details,
      timestamp: new Date(),
      resolved: false,
    }

    this.alerts.push(alert)

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-50)
    }

    // Fire alert callbacks
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert)
      } catch (error) {
        console.error('Alert callback failed:', error)
      }
    })

    // Log alert
    console.warn(`🚨 Performance Alert [${severity.toUpperCase()}]:`, alert.message, alert.details)
  }

  // Resolve alert
  resolveAlert(alertId: string) {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert && !alert.resolved) {
      alert.resolved = true
      alert.resolvedAt = new Date()
      console.log(`✅ Performance alert resolved: ${alert.message}`)
    }
  }

  // Get active alerts
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved)
  }

  // Get all alerts
  getAllAlerts(): PerformanceAlert[] {
    return [...this.alerts].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Clear resolved alerts
  clearResolvedAlerts() {
    const beforeCount = this.alerts.length
    this.alerts = this.alerts.filter(alert => !alert.resolved)
    const clearedCount = beforeCount - this.alerts.length
    console.log(`Cleared ${clearedCount} resolved alerts`)
  }

  // Get alert statistics
  getAlertStatistics() {
    const now = Date.now()
    const last24Hours = this.alerts.filter(alert => 
      now - alert.timestamp.getTime() < 24 * 60 * 60 * 1000
    )

    const severityCount = {
      [AlertSeverity.LOW]: 0,
      [AlertSeverity.MEDIUM]: 0,
      [AlertSeverity.HIGH]: 0,
      [AlertSeverity.CRITICAL]: 0,
    }

    const typeCount: Record<string, number> = {}

    last24Hours.forEach(alert => {
      severityCount[alert.severity]++
      typeCount[alert.type] = (typeCount[alert.type] || 0) + 1
    })

    return {
      total: this.alerts.length,
      active: this.getActiveAlerts().length,
      last24Hours: last24Hours.length,
      severityCount,
      typeCount,
    }
  }
}

// Export singleton instance
export const performanceAlerts = PerformanceAlertManager.getInstance()

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  performanceAlerts.startMonitoring(30000) // Check every 30 seconds in dev
}

// Default alert handler (logs to console)
performanceAlerts.onAlert((alert) => {
  // In production, you might want to send this to a monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to monitoring service
    // sendToMonitoringService(alert)
  }
})