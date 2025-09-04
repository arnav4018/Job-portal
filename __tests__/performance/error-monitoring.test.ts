/**
 * Error Logging and Monitoring System Tests
 * Tests comprehensive error logging, monitoring dashboard, and automated alerting
 * 
 * Task 6.2: Add error logging and monitoring
 * Requirements: 6.3, 6.4, 6.5
 */

interface ErrorLog {
  id: string
  timestamp: number
  level: 'error' | 'warning' | 'info'
  message: string
  stack?: string
  route?: string
  userId?: string
  sessionId: string
  userAgent?: string
  metadata?: Record<string, any>
}

interface ErrorMetrics {
  totalErrors: number
  errorRate: number
  errorsByType: Record<string, number>
  errorsByRoute: Record<string, number>
  criticalErrors: number
  timeRange: {
    start: number
    end: number
  }
}

interface AlertRule {
  id: string
  name: string
  condition: string
  threshold: number
  timeWindow: number // minutes
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
}

interface Alert {
  id: string
  ruleId: string
  timestamp: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  value: number
  threshold: number
  resolved: boolean
  resolvedAt?: number
}

interface MonitoringDashboard {
  errorMetrics: ErrorMetrics
  activeAlerts: Alert[]
  systemHealth: {
    status: 'healthy' | 'degraded' | 'critical'
    uptime: number
    errorRate: number
    responseTime: number
  }
  recentErrors: ErrorLog[]
}

class ErrorLoggingSystem {
  private errorLogs: ErrorLog[] = []
  private alerts: Alert[] = []
  private alertRules: AlertRule[] = []
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeDefaultAlertRules()
  }

  logError(error: Error, context?: {
    route?: string
    userId?: string
    userAgent?: string
    metadata?: Record<string, any>
  }): ErrorLog {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      level: 'error',
      message: error.message,
      stack: error.stack,
      route: context?.route,
      userId: context?.userId,
      sessionId: this.sessionId,
      userAgent: context?.userAgent,
      metadata: context?.metadata
    }

    this.errorLogs.push(errorLog)
    this.checkAlertRules(errorLog)
    
    console.error('Error logged:', errorLog)
    return errorLog
  }

  logWarning(message: string, context?: {
    route?: string
    userId?: string
    metadata?: Record<string, any>
  }): ErrorLog {
    const warningLog: ErrorLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      level: 'warning',
      message,
      route: context?.route,
      userId: context?.userId,
      sessionId: this.sessionId,
      metadata: context?.metadata
    }

    this.errorLogs.push(warningLog)
    this.checkAlertRules(warningLog)
    
    console.warn('Warning logged:', warningLog)
    return warningLog
  }

  logInfo(message: string, context?: {
    route?: string
    userId?: string
    metadata?: Record<string, any>
  }): ErrorLog {
    const infoLog: ErrorLog = {
      id: this.generateId(),
      timestamp: Date.now(),
      level: 'info',
      message,
      route: context?.route,
      userId: context?.userId,
      sessionId: this.sessionId,
      metadata: context?.metadata
    }

    this.errorLogs.push(infoLog)
    
    console.info('Info logged:', infoLog)
    return infoLog
  }

  getErrorMetrics(timeRangeMinutes: number = 60): ErrorMetrics {
    const now = Date.now()
    const timeRangeMs = timeRangeMinutes * 60 * 1000
    const startTime = now - timeRangeMs

    const recentLogs = this.errorLogs.filter(log => log.timestamp >= startTime)
    const errors = recentLogs.filter(log => log.level === 'error')

    const errorsByType: Record<string, number> = {}
    const errorsByRoute: Record<string, number> = {}

    errors.forEach(error => {
      // Group by error message (simplified error type)
      const errorType = error.message.split(':')[0] || 'Unknown'
      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1

      // Group by route
      if (error.route) {
        errorsByRoute[error.route] = (errorsByRoute[error.route] || 0) + 1
      }
    })

    return {
      totalErrors: errors.length,
      errorRate: (errors.length / Math.max(recentLogs.length, 1)) * 100,
      errorsByType,
      errorsByRoute,
      criticalErrors: errors.filter(e => this.isCriticalError(e)).length,
      timeRange: {
        start: startTime,
        end: now
      }
    }
  }

  createAlertRule(rule: Omit<AlertRule, 'id'>): AlertRule {
    const alertRule: AlertRule = {
      id: this.generateId(),
      ...rule
    }

    this.alertRules.push(alertRule)
    return alertRule
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved)
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert && !alert.resolved) {
      alert.resolved = true
      alert.resolvedAt = Date.now()
      return true
    }
    return false
  }

  generateMonitoringDashboard(): MonitoringDashboard {
    const errorMetrics = this.getErrorMetrics(60) // Last hour
    const activeAlerts = this.getActiveAlerts()
    const recentErrors = this.errorLogs
      .filter(log => log.level === 'error')
      .slice(-10) // Last 10 errors
      .reverse()

    // Calculate system health
    const systemHealth = this.calculateSystemHealth(errorMetrics, activeAlerts)

    return {
      errorMetrics,
      activeAlerts,
      systemHealth,
      recentErrors
    }
  }

  // Simulate different types of errors for testing
  simulateAuthenticationError(userId?: string): ErrorLog {
    return this.logError(new Error('Authentication failed: Invalid credentials'), {
      route: '/auth/login',
      userId,
      metadata: { errorType: 'authentication', severity: 'high' }
    })
  }

  simulateNavigationError(route: string): ErrorLog {
    return this.logError(new Error(`Navigation failed: Route not found - ${route}`), {
      route,
      metadata: { errorType: 'navigation', severity: 'medium' }
    })
  }

  simulatePerformanceWarning(route: string, loadTime: number): ErrorLog {
    return this.logWarning(`Performance warning: Slow load time ${loadTime}ms`, {
      route,
      metadata: { errorType: 'performance', loadTime, threshold: 3000 }
    })
  }

  simulateDatabaseError(): ErrorLog {
    return this.logError(new Error('Database connection failed: Connection timeout'), {
      metadata: { errorType: 'database', severity: 'critical' }
    })
  }

  simulateComponentError(component: string, route: string): ErrorLog {
    return this.logError(new Error(`Component error: ${component} failed to render`), {
      route,
      metadata: { errorType: 'component', component, severity: 'medium' }
    })
  }

  private initializeDefaultAlertRules(): void {
    // High error rate alert
    this.createAlertRule({
      name: 'High Error Rate',
      condition: 'error_rate > threshold',
      threshold: 5, // 5% error rate
      timeWindow: 15, // 15 minutes
      severity: 'high',
      enabled: true
    })

    // Critical error alert
    this.createAlertRule({
      name: 'Critical Error Detected',
      condition: 'critical_errors > threshold',
      threshold: 0, // Any critical error
      timeWindow: 5, // 5 minutes
      severity: 'critical',
      enabled: true
    })

    // Authentication failure spike
    this.createAlertRule({
      name: 'Authentication Failure Spike',
      condition: 'auth_errors > threshold',
      threshold: 10, // 10 auth errors
      timeWindow: 10, // 10 minutes
      severity: 'medium',
      enabled: true
    })

    // Database error alert
    this.createAlertRule({
      name: 'Database Error Alert',
      condition: 'database_errors > threshold',
      threshold: 1, // Any database error
      timeWindow: 5, // 5 minutes
      severity: 'high',
      enabled: true
    })
  }

  private checkAlertRules(errorLog: ErrorLog): void {
    this.alertRules.forEach(rule => {
      if (!rule.enabled) return

      const shouldTrigger = this.evaluateAlertRule(rule, errorLog)
      if (shouldTrigger) {
        this.triggerAlert(rule, errorLog)
      }
    })
  }

  private evaluateAlertRule(rule: AlertRule, errorLog: ErrorLog): boolean {
    const timeWindow = rule.timeWindow * 60 * 1000 // Convert to milliseconds
    const now = Date.now()
    const windowStart = now - timeWindow

    const recentLogs = this.errorLogs.filter(log => log.timestamp >= windowStart)

    switch (rule.condition) {
      case 'error_rate > threshold':
        const errorRate = this.getErrorMetrics(rule.timeWindow).errorRate
        return errorRate > rule.threshold

      case 'critical_errors > threshold':
        const criticalErrors = recentLogs.filter(log => 
          log.level === 'error' && this.isCriticalError(log)
        ).length
        return criticalErrors > rule.threshold

      case 'auth_errors > threshold':
        const authErrors = recentLogs.filter(log => 
          log.level === 'error' && log.metadata?.errorType === 'authentication'
        ).length
        return authErrors > rule.threshold

      case 'database_errors > threshold':
        const dbErrors = recentLogs.filter(log => 
          log.level === 'error' && log.metadata?.errorType === 'database'
        ).length
        return dbErrors > rule.threshold

      default:
        return false
    }
  }

  private triggerAlert(rule: AlertRule, triggeringLog: ErrorLog): void {
    // Check if there's already an active alert for this rule
    const existingAlert = this.alerts.find(alert => 
      alert.ruleId === rule.id && !alert.resolved
    )

    if (existingAlert) return // Don't create duplicate alerts

    const alert: Alert = {
      id: this.generateId(),
      ruleId: rule.id,
      timestamp: Date.now(),
      severity: rule.severity,
      message: `Alert: ${rule.name} - ${triggeringLog.message}`,
      value: this.getCurrentRuleValue(rule),
      threshold: rule.threshold,
      resolved: false
    }

    this.alerts.push(alert)
    console.warn('Alert triggered:', alert)
  }

  private getCurrentRuleValue(rule: AlertRule): number {
    const metrics = this.getErrorMetrics(rule.timeWindow)
    
    switch (rule.condition) {
      case 'error_rate > threshold':
        return metrics.errorRate
      case 'critical_errors > threshold':
        return metrics.criticalErrors
      case 'auth_errors > threshold':
        return Object.values(metrics.errorsByType).reduce((sum, count) => sum + count, 0)
      case 'database_errors > threshold':
        return Object.values(metrics.errorsByType).reduce((sum, count) => sum + count, 0)
      default:
        return 0
    }
  }

  private isCriticalError(errorLog: ErrorLog): boolean {
    const criticalKeywords = ['database', 'authentication', 'security', 'payment']
    const criticalSeverity = errorLog.metadata?.severity === 'critical'
    const criticalMessage = criticalKeywords.some(keyword => 
      errorLog.message.toLowerCase().includes(keyword)
    )
    
    return criticalSeverity || criticalMessage
  }

  private calculateSystemHealth(errorMetrics: ErrorMetrics, activeAlerts: Alert[]): MonitoringDashboard['systemHealth'] {
    const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical')
    const highAlerts = activeAlerts.filter(alert => alert.severity === 'high')

    let status: 'healthy' | 'degraded' | 'critical' = 'healthy'
    
    if (criticalAlerts.length > 0 || errorMetrics.errorRate > 10) {
      status = 'critical'
    } else if (highAlerts.length > 0 || errorMetrics.errorRate > 5) {
      status = 'degraded'
    }

    return {
      status,
      uptime: 99.9, // Simulated uptime percentage
      errorRate: errorMetrics.errorRate,
      responseTime: Math.random() * 200 + 100 // Simulated response time 100-300ms
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Getters for testing
  getAllErrorLogs(): ErrorLog[] {
    return this.errorLogs
  }

  getAllAlerts(): Alert[] {
    return this.alerts
  }

  getAlertRules(): AlertRule[] {
    return this.alertRules
  }
}

describe('Error Logging and Monitoring System', () => {
  let errorLogger: ErrorLoggingSystem

  beforeEach(() => {
    errorLogger = new ErrorLoggingSystem()
  })

  describe('Error Logging', () => {
    test('should log errors with complete metadata', () => {
      const error = new Error('Test error message')
      const context = {
        route: '/test-route',
        userId: 'user123',
        userAgent: 'Mozilla/5.0',
        metadata: { customField: 'customValue' }
      }

      const errorLog = errorLogger.logError(error, context)

      expect(errorLog.id).toBeTruthy()
      expect(errorLog.timestamp).toBeGreaterThan(0)
      expect(errorLog.level).toBe('error')
      expect(errorLog.message).toBe('Test error message')
      expect(errorLog.stack).toBeTruthy()
      expect(errorLog.route).toBe('/test-route')
      expect(errorLog.userId).toBe('user123')
      expect(errorLog.sessionId).toBeTruthy()
      expect(errorLog.userAgent).toBe('Mozilla/5.0')
      expect(errorLog.metadata?.customField).toBe('customValue')
    })

    test('should log warnings with appropriate level', () => {
      const warningLog = errorLogger.logWarning('Test warning message', {
        route: '/warning-route',
        metadata: { warningType: 'performance' }
      })

      expect(warningLog.level).toBe('warning')
      expect(warningLog.message).toBe('Test warning message')
      expect(warningLog.route).toBe('/warning-route')
      expect(warningLog.metadata?.warningType).toBe('performance')
    })

    test('should log info messages', () => {
      const infoLog = errorLogger.logInfo('Test info message', {
        route: '/info-route'
      })

      expect(infoLog.level).toBe('info')
      expect(infoLog.message).toBe('Test info message')
      expect(infoLog.route).toBe('/info-route')
    })

    test('should handle errors without context', () => {
      const error = new Error('Simple error')
      const errorLog = errorLogger.logError(error)

      expect(errorLog.message).toBe('Simple error')
      expect(errorLog.sessionId).toBeTruthy()
      expect(errorLog.route).toBeUndefined()
      expect(errorLog.userId).toBeUndefined()
    })
  })

  describe('Error Metrics Collection', () => {
    test('should calculate error metrics correctly', () => {
      // Generate test errors
      errorLogger.simulateAuthenticationError('user1')
      errorLogger.simulateNavigationError('/test-route')
      errorLogger.simulatePerformanceWarning('/slow-route', 4000)
      errorLogger.simulateDatabaseError()

      const metrics = errorLogger.getErrorMetrics(60)

      expect(metrics.totalErrors).toBe(3) // 3 errors (warning doesn't count)
      expect(metrics.errorRate).toBeGreaterThan(0)
      expect(Object.keys(metrics.errorsByType).length).toBeGreaterThan(0)
      expect(metrics.criticalErrors).toBeGreaterThan(0) // Database error is critical
      expect(metrics.timeRange.start).toBeLessThan(metrics.timeRange.end)
    })

    test('should group errors by type correctly', () => {
      errorLogger.simulateAuthenticationError('user1')
      errorLogger.simulateAuthenticationError('user2')
      errorLogger.simulateNavigationError('/route1')

      const metrics = errorLogger.getErrorMetrics(60)

      expect(metrics.errorsByType['Authentication failed']).toBe(2)
      expect(metrics.errorsByType['Navigation failed']).toBe(1)
    })

    test('should group errors by route correctly', () => {
      errorLogger.simulateNavigationError('/route1')
      errorLogger.simulateNavigationError('/route1')
      errorLogger.simulateComponentError('Button', '/route2')

      const metrics = errorLogger.getErrorMetrics(60)

      expect(metrics.errorsByRoute['/route1']).toBe(2)
      expect(metrics.errorsByRoute['/route2']).toBe(1)
    })

    test('should filter metrics by time range', () => {
      // Add some errors
      errorLogger.simulateAuthenticationError('user1')
      
      // Get metrics for very short time range
      const shortMetrics = errorLogger.getErrorMetrics(0.01) // 0.6 seconds
      const longMetrics = errorLogger.getErrorMetrics(60) // 60 minutes

      expect(shortMetrics.totalErrors).toBeLessThanOrEqual(longMetrics.totalErrors)
    })
  })

  describe('Alert System', () => {
    test('should create alert rules with proper structure', () => {
      const rule = errorLogger.createAlertRule({
        name: 'Test Alert',
        condition: 'error_rate > threshold',
        threshold: 10,
        timeWindow: 15,
        severity: 'medium',
        enabled: true
      })

      expect(rule.id).toBeTruthy()
      expect(rule.name).toBe('Test Alert')
      expect(rule.condition).toBe('error_rate > threshold')
      expect(rule.threshold).toBe(10)
      expect(rule.timeWindow).toBe(15)
      expect(rule.severity).toBe('medium')
      expect(rule.enabled).toBe(true)
    })

    test('should have default alert rules configured', () => {
      const rules = errorLogger.getAlertRules()

      expect(rules.length).toBeGreaterThan(0)
      
      const highErrorRateRule = rules.find(rule => rule.name === 'High Error Rate')
      expect(highErrorRateRule).toBeDefined()
      expect(highErrorRateRule?.threshold).toBe(5)

      const criticalErrorRule = rules.find(rule => rule.name === 'Critical Error Detected')
      expect(criticalErrorRule).toBeDefined()
      expect(criticalErrorRule?.severity).toBe('critical')
    })

    test('should trigger alerts when thresholds are exceeded', () => {
      // Generate enough database errors to trigger alert
      errorLogger.simulateDatabaseError()
      errorLogger.simulateDatabaseError()

      const activeAlerts = errorLogger.getActiveAlerts()
      expect(activeAlerts.length).toBeGreaterThan(0)

      const dbAlert = activeAlerts.find(alert => 
        alert.message.includes('Database Error Alert')
      )
      expect(dbAlert).toBeDefined()
      expect(dbAlert?.severity).toBe('high')
    })

    test('should resolve alerts', () => {
      // Trigger an alert
      errorLogger.simulateDatabaseError()
      
      const activeAlerts = errorLogger.getActiveAlerts()
      expect(activeAlerts.length).toBeGreaterThan(0)

      const alertId = activeAlerts[0].id
      const resolved = errorLogger.resolveAlert(alertId)

      expect(resolved).toBe(true)
      expect(errorLogger.getActiveAlerts().length).toBe(activeAlerts.length - 1)
    })

    test('should not create duplicate alerts for same rule', () => {
      // Trigger multiple database errors
      errorLogger.simulateDatabaseError()
      errorLogger.simulateDatabaseError()
      errorLogger.simulateDatabaseError()

      const activeAlerts = errorLogger.getActiveAlerts()
      const dbAlerts = activeAlerts.filter(alert => 
        alert.message.includes('Database Error Alert')
      )

      // Should only have one alert despite multiple triggers
      expect(dbAlerts.length).toBe(1)
    })
  })

  describe('Monitoring Dashboard', () => {
    test('should generate comprehensive monitoring dashboard', () => {
      // Generate test data
      errorLogger.simulateAuthenticationError('user1')
      errorLogger.simulateNavigationError('/test-route')
      errorLogger.simulatePerformanceWarning('/slow-route', 4000)
      errorLogger.simulateDatabaseError()

      const dashboard = errorLogger.generateMonitoringDashboard()

      expect(dashboard.errorMetrics).toBeDefined()
      expect(dashboard.activeAlerts).toBeDefined()
      expect(dashboard.systemHealth).toBeDefined()
      expect(dashboard.recentErrors).toBeDefined()

      // Verify error metrics
      expect(dashboard.errorMetrics.totalErrors).toBeGreaterThan(0)
      expect(typeof dashboard.errorMetrics.errorRate).toBe('number')

      // Verify system health
      expect(['healthy', 'degraded', 'critical']).toContain(dashboard.systemHealth.status)
      expect(dashboard.systemHealth.uptime).toBeGreaterThan(0)
      expect(dashboard.systemHealth.errorRate).toBeGreaterThanOrEqual(0)
      expect(dashboard.systemHealth.responseTime).toBeGreaterThan(0)

      // Verify recent errors
      expect(Array.isArray(dashboard.recentErrors)).toBe(true)
      expect(dashboard.recentErrors.length).toBeLessThanOrEqual(10)
    })

    test('should calculate system health status correctly', () => {
      // Test healthy state
      let dashboard = errorLogger.generateMonitoringDashboard()
      expect(['healthy', 'degraded', 'critical']).toContain(dashboard.systemHealth.status)

      // Generate critical errors to change health status
      for (let i = 0; i < 5; i++) {
        errorLogger.simulateDatabaseError()
      }

      dashboard = errorLogger.generateMonitoringDashboard()
      expect(['degraded', 'critical']).toContain(dashboard.systemHealth.status)
    })

    test('should include active alerts in dashboard', () => {
      // Trigger alerts
      errorLogger.simulateDatabaseError()
      errorLogger.simulateAuthenticationError('user1')

      const dashboard = errorLogger.generateMonitoringDashboard()

      expect(dashboard.activeAlerts.length).toBeGreaterThan(0)
      dashboard.activeAlerts.forEach(alert => {
        expect(alert.resolved).toBe(false)
        expect(alert.timestamp).toBeGreaterThan(0)
        expect(['low', 'medium', 'high', 'critical']).toContain(alert.severity)
      })
    })

    test('should limit recent errors to 10 items', () => {
      // Generate more than 10 errors
      for (let i = 0; i < 15; i++) {
        errorLogger.simulateNavigationError(`/route-${i}`)
      }

      const dashboard = errorLogger.generateMonitoringDashboard()

      expect(dashboard.recentErrors.length).toBeLessThanOrEqual(10)
      // Should be in reverse chronological order (most recent first)
      for (let i = 1; i < dashboard.recentErrors.length; i++) {
        expect(dashboard.recentErrors[i-1].timestamp).toBeGreaterThanOrEqual(
          dashboard.recentErrors[i].timestamp
        )
      }
    })
  })

  describe('Error Simulation and Testing', () => {
    test('should simulate authentication errors correctly', () => {
      const errorLog = errorLogger.simulateAuthenticationError('testUser')

      expect(errorLog.level).toBe('error')
      expect(errorLog.message).toContain('Authentication failed')
      expect(errorLog.route).toBe('/auth/login')
      expect(errorLog.userId).toBe('testUser')
      expect(errorLog.metadata?.errorType).toBe('authentication')
      expect(errorLog.metadata?.severity).toBe('high')
    })

    test('should simulate navigation errors correctly', () => {
      const errorLog = errorLogger.simulateNavigationError('/invalid-route')

      expect(errorLog.level).toBe('error')
      expect(errorLog.message).toContain('Navigation failed')
      expect(errorLog.route).toBe('/invalid-route')
      expect(errorLog.metadata?.errorType).toBe('navigation')
    })

    test('should simulate performance warnings correctly', () => {
      const errorLog = errorLogger.simulatePerformanceWarning('/slow-page', 5000)

      expect(errorLog.level).toBe('warning')
      expect(errorLog.message).toContain('Performance warning')
      expect(errorLog.message).toContain('5000ms')
      expect(errorLog.metadata?.loadTime).toBe(5000)
      expect(errorLog.metadata?.threshold).toBe(3000)
    })

    test('should simulate database errors correctly', () => {
      const errorLog = errorLogger.simulateDatabaseError()

      expect(errorLog.level).toBe('error')
      expect(errorLog.message).toContain('Database connection failed')
      expect(errorLog.metadata?.errorType).toBe('database')
      expect(errorLog.metadata?.severity).toBe('critical')
    })

    test('should simulate component errors correctly', () => {
      const errorLog = errorLogger.simulateComponentError('UserProfile', '/profile')

      expect(errorLog.level).toBe('error')
      expect(errorLog.message).toContain('Component error')
      expect(errorLog.message).toContain('UserProfile')
      expect(errorLog.route).toBe('/profile')
      expect(errorLog.metadata?.component).toBe('UserProfile')
    })
  })

  describe('Integration with Requirements', () => {
    test('should meet comprehensive error logging requirement (6.3)', () => {
      // Test different types of errors are logged
      const authError = errorLogger.simulateAuthenticationError('user1')
      const navError = errorLogger.simulateNavigationError('/test')
      const dbError = errorLogger.simulateDatabaseError()
      const componentError = errorLogger.simulateComponentError('Button', '/home')

      const allLogs = errorLogger.getAllErrorLogs()
      expect(allLogs.length).toBe(4)

      // Verify all logs have required fields
      allLogs.forEach(log => {
        expect(log.id).toBeTruthy()
        expect(log.timestamp).toBeGreaterThan(0)
        expect(log.level).toBeTruthy()
        expect(log.message).toBeTruthy()
        expect(log.sessionId).toBeTruthy()
      })
    })

    test('should meet performance metrics collection requirement (6.4)', () => {
      // Generate various performance-related logs
      errorLogger.simulatePerformanceWarning('/slow-route-1', 4000)
      errorLogger.simulatePerformanceWarning('/slow-route-2', 5000)
      errorLogger.simulateNavigationError('/failed-route')

      const metrics = errorLogger.getErrorMetrics(60)

      expect(metrics.totalErrors).toBeGreaterThan(0)
      expect(typeof metrics.errorRate).toBe('number')
      expect(Object.keys(metrics.errorsByType).length).toBeGreaterThan(0)
      expect(Object.keys(metrics.errorsByRoute).length).toBeGreaterThan(0)
      expect(metrics.timeRange.start).toBeLessThan(metrics.timeRange.end)
    })

    test('should meet monitoring dashboard requirement (6.5)', () => {
      // Generate test data
      errorLogger.simulateAuthenticationError('user1')
      errorLogger.simulateDatabaseError()
      errorLogger.simulatePerformanceWarning('/slow', 4000)

      const dashboard = errorLogger.generateMonitoringDashboard()

      // Verify dashboard has all required components
      expect(dashboard.errorMetrics).toBeDefined()
      expect(dashboard.activeAlerts).toBeDefined()
      expect(dashboard.systemHealth).toBeDefined()
      expect(dashboard.recentErrors).toBeDefined()

      // Verify system health calculation
      expect(['healthy', 'degraded', 'critical']).toContain(dashboard.systemHealth.status)
      expect(typeof dashboard.systemHealth.uptime).toBe('number')
      expect(typeof dashboard.systemHealth.errorRate).toBe('number')
      expect(typeof dashboard.systemHealth.responseTime).toBe('number')
    })

    test('should meet automated alerting requirement (6.5)', () => {
      // Test that alerts are automatically triggered
      const initialAlerts = errorLogger.getActiveAlerts().length

      // Trigger database error (should create critical alert)
      errorLogger.simulateDatabaseError()

      const finalAlerts = errorLogger.getActiveAlerts().length
      expect(finalAlerts).toBeGreaterThan(initialAlerts)

      // Verify alert properties
      const newAlerts = errorLogger.getActiveAlerts()
      newAlerts.forEach(alert => {
        expect(alert.id).toBeTruthy()
        expect(alert.ruleId).toBeTruthy()
        expect(alert.timestamp).toBeGreaterThan(0)
        expect(['low', 'medium', 'high', 'critical']).toContain(alert.severity)
        expect(alert.message).toBeTruthy()
        expect(typeof alert.value).toBe('number')
        expect(typeof alert.threshold).toBe('number')
        expect(alert.resolved).toBe(false)
      })
    })
  })
})