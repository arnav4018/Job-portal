import React from 'react'

interface ErrorReport {
  errorId: string
  message: string
  stack?: string
  componentStack?: string
  timestamp: string
  userAgent: string
  url: string
  userId?: string
  sessionId?: string
  componentName?: string
  level: 'page' | 'section' | 'component'
  retryCount: number
  additionalContext?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'javascript' | 'network' | 'render' | 'data' | 'auth' | 'unknown'
  filename?: string
  lineno?: number
  colno?: number
}

interface ErrorMetrics {
  totalErrors: number
  errorsByCategory: Record<string, number>
  errorsByComponent: Record<string, number>
  errorsByLevel: Record<string, number>
  recentErrors: ErrorReport[]
}

class ErrorReportingService {
  private static instance: ErrorReportingService
  private errorQueue: ErrorReport[] = []
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByCategory: {},
    errorsByComponent: {},
    errorsByLevel: {},
    recentErrors: []
  }
  private isOnline = navigator.onLine
  private maxQueueSize = 100
  private maxRecentErrors = 50

  constructor() {
    this.setupNetworkListeners()
    this.setupUnhandledErrorListeners()
    this.startPeriodicFlush()
  }

  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService()
    }
    return ErrorReportingService.instance
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.flushErrorQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  private setupUnhandledErrorListeners() {
    // Catch unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename || undefined,
        lineno: event.lineno,
        colno: event.colno,
        category: 'javascript',
        severity: 'high'
      })
    })

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        category: 'javascript',
        severity: 'medium'
      })
    })

    // Catch resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const target = event.target as HTMLElement
        this.reportError({
          message: `Resource failed to load: ${target.tagName}`,
          url: (target as any).src || (target as any).href,
          category: 'network',
          severity: 'low'
        })
      }
    }, true)
  }

  private startPeriodicFlush() {
    // Flush errors every 30 seconds
    setInterval(() => {
      if (this.errorQueue.length > 0 && this.isOnline) {
        this.flushErrorQueue()
      }
    }, 30000)
  }

  reportError(errorData: Partial<ErrorReport> & { message: string }) {
    const errorReport: ErrorReport = {
      errorId: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: 'component',
      retryCount: 0,
      severity: 'medium',
      category: 'unknown',
      ...errorData
    }

    // Add to queue
    this.addToQueue(errorReport)

    // Update metrics
    this.updateMetrics(errorReport)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(errorReport)
    }

    // Try to send immediately if online
    if (this.isOnline) {
      this.flushErrorQueue()
    }

    return errorReport.errorId
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private addToQueue(errorReport: ErrorReport) {
    this.errorQueue.push(errorReport)

    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }
  }

  private updateMetrics(errorReport: ErrorReport) {
    this.metrics.totalErrors++
    
    // Update category metrics
    this.metrics.errorsByCategory[errorReport.category] = 
      (this.metrics.errorsByCategory[errorReport.category] || 0) + 1
    
    // Update component metrics
    if (errorReport.componentName) {
      this.metrics.errorsByComponent[errorReport.componentName] = 
        (this.metrics.errorsByComponent[errorReport.componentName] || 0) + 1
    }
    
    // Update level metrics
    this.metrics.errorsByLevel[errorReport.level] = 
      (this.metrics.errorsByLevel[errorReport.level] || 0) + 1
    
    // Add to recent errors
    this.metrics.recentErrors.unshift(errorReport)
    if (this.metrics.recentErrors.length > this.maxRecentErrors) {
      this.metrics.recentErrors.pop()
    }
  }

  private logToConsole(errorReport: ErrorReport) {
    const style = this.getConsoleStyle(errorReport.severity)
    
    console.group(`%c🚨 Error Report (${errorReport.errorId})`, style)
    console.log('Message:', errorReport.message)
    console.log('Category:', errorReport.category)
    console.log('Severity:', errorReport.severity)
    console.log('Component:', errorReport.componentName || 'Unknown')
    console.log('Level:', errorReport.level)
    
    if (errorReport.stack) {
      console.log('Stack:', errorReport.stack)
    }
    
    if (errorReport.additionalContext) {
      console.log('Context:', errorReport.additionalContext)
    }
    
    console.groupEnd()
  }

  private getConsoleStyle(severity: string): string {
    const styles = {
      low: 'color: #f59e0b; font-weight: bold;',
      medium: 'color: #f97316; font-weight: bold;',
      high: 'color: #dc2626; font-weight: bold;',
      critical: 'color: #991b1b; font-weight: bold; background: #fef2f2;'
    }
    return styles[severity as keyof typeof styles] || styles.medium
  }

  private async flushErrorQueue() {
    if (this.errorQueue.length === 0) return

    const errorsToSend = [...this.errorQueue]
    this.errorQueue = []

    try {
      await this.sendErrorsToServer(errorsToSend)
    } catch (error) {
      console.error('Failed to send error reports:', error)
      
      // Put errors back in queue if sending failed
      this.errorQueue.unshift(...errorsToSend)
      
      // Limit queue size after re-adding
      if (this.errorQueue.length > this.maxQueueSize) {
        this.errorQueue = this.errorQueue.slice(0, this.maxQueueSize)
      }
    }
  }

  private async sendErrorsToServer(errors: ErrorReport[]): Promise<void> {
    // In a real application, send to your error reporting service
    // Examples: Sentry, LogRocket, Bugsnag, or custom endpoint
    
    const response = await fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ errors })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }

  getMetrics(): ErrorMetrics {
    return { ...this.metrics }
  }

  clearMetrics() {
    this.metrics = {
      totalErrors: 0,
      errorsByCategory: {},
      errorsByComponent: {},
      errorsByLevel: {},
      recentErrors: []
    }
  }

  // Method to add user context to future error reports
  setUserContext(userId: string, sessionId?: string) {
    this.userId = userId
    this.sessionId = sessionId
  }

  // Method to add additional context to error reports
  addContext(key: string, value: any) {
    if (!this.globalContext) {
      this.globalContext = {}
    }
    this.globalContext[key] = value
  }

  private userId?: string
  private sessionId?: string
  private globalContext?: Record<string, any>
}

// Utility functions for error categorization
export function categorizeError(error: Error): ErrorReport['category'] {
  const message = error.message.toLowerCase()
  const stack = error.stack?.toLowerCase() || ''

  if (message.includes('network') || message.includes('fetch') || message.includes('xhr')) {
    return 'network'
  }

  if (message.includes('render') || stack.includes('render')) {
    return 'render'
  }

  if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
    return 'auth'
  }

  if (message.includes('data') || message.includes('parse') || message.includes('json')) {
    return 'data'
  }

  return 'javascript'
}

export function determineSeverity(error: Error, componentLevel: string): ErrorReport['severity'] {
  const message = error.message.toLowerCase()

  // Critical errors
  if (componentLevel === 'page' || message.includes('critical') || message.includes('fatal')) {
    return 'critical'
  }

  // High severity errors
  if (message.includes('auth') || message.includes('security') || message.includes('crash')) {
    return 'high'
  }

  // Low severity errors
  if (message.includes('warning') || message.includes('deprecated') || componentLevel === 'component') {
    return 'low'
  }

  return 'medium'
}

// React hook for error reporting
export function useErrorReporting() {
  const errorService = ErrorReportingService.getInstance()

  const reportError = React.useCallback((
    error: Error,
    additionalContext?: Record<string, any>
  ) => {
    return errorService.reportError({
      message: error.message,
      stack: error.stack,
      category: categorizeError(error),
      severity: 'medium',
      additionalContext
    })
  }, [errorService])

  const reportCustomError = React.useCallback((
    message: string,
    options?: Partial<ErrorReport>
  ) => {
    return errorService.reportError({
      message,
      ...options
    })
  }, [errorService])

  const getMetrics = React.useCallback(() => {
    return errorService.getMetrics()
  }, [errorService])

  return {
    reportError,
    reportCustomError,
    getMetrics
  }
}

// Export singleton instance
export const errorReporter = ErrorReportingService.getInstance()

// Export types
export type { ErrorReport, ErrorMetrics }