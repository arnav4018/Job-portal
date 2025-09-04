// Navigation Performance and Error Handling Initialization

import { initializeNavigationPerformance } from './navigation-performance'
import { initializeBundleOptimization } from './bundle-optimization'
import { initializeClientCache } from './client-cache'

interface NavigationConfig {
  enablePerformanceMonitoring?: boolean
  enableBundleOptimization?: boolean
  enableClientCache?: boolean
  enableErrorLogging?: boolean
  performanceReportInterval?: number
}

class NavigationSystem {
  private config: Required<NavigationConfig>
  private cleanupFunctions: (() => void)[] = []
  private isInitialized = false

  constructor(config: NavigationConfig = {}) {
    this.config = {
      enablePerformanceMonitoring: config.enablePerformanceMonitoring ?? true,
      enableBundleOptimization: config.enableBundleOptimization ?? true,
      enableClientCache: config.enableClientCache ?? true,
      enableErrorLogging: config.enableErrorLogging ?? true,
      performanceReportInterval: config.performanceReportInterval ?? 60000 // 1 minute
    }
  }

  initialize() {
    if (this.isInitialized || typeof window === 'undefined') {
      return
    }

    console.log('Initializing Navigation Performance System...')

    try {
      // Initialize performance monitoring
      if (this.config.enablePerformanceMonitoring) {
        initializeNavigationPerformance()
        this.setupPerformanceReporting()
        console.log('✓ Navigation performance monitoring enabled')
      }

      // Initialize bundle optimization
      if (this.config.enableBundleOptimization) {
        const cleanup = initializeBundleOptimization()
        if (cleanup) {
          this.cleanupFunctions.push(cleanup)
        }
        console.log('✓ Bundle optimization enabled')
      }

      // Initialize client-side caching
      if (this.config.enableClientCache) {
        const cleanup = initializeClientCache()
        if (cleanup) {
          this.cleanupFunctions.push(cleanup)
        }
        console.log('✓ Client-side caching enabled')
      }

      // Setup error logging
      if (this.config.enableErrorLogging) {
        this.setupGlobalErrorHandling()
        console.log('✓ Global error handling enabled')
      }

      // Setup cleanup on page unload
      this.setupCleanup()

      this.isInitialized = true
      console.log('Navigation Performance System initialized successfully')

    } catch (error) {
      console.error('Failed to initialize Navigation Performance System:', error)
    }
  }

  private setupPerformanceReporting() {
    if (process.env.NODE_ENV === 'development') {
      // Regular performance reporting in development
      const reportInterval = setInterval(() => {
        try {
          const { getNavigationMonitor } = require('./navigation-performance')
          const monitor = getNavigationMonitor()
          const report = monitor.generatePerformanceReport()
          
          if (report.totalNavigations > 0) {
            console.group('🚀 Navigation Performance Report')
            console.log('Average Load Time:', `${report.averageLoadTime}ms`)
            console.log('Total Navigations:', report.totalNavigations)
            console.log('Slow Routes:', report.slowRoutes)
            console.log('Cache Size:', report.cacheSize)
            console.log('Preloaded Routes:', report.preloadedRoutes.length)
            console.groupEnd()
          }
        } catch (error) {
          console.warn('Failed to generate performance report:', error)
        }
      }, this.config.performanceReportInterval)

      this.cleanupFunctions.push(() => clearInterval(reportInterval))
    }
  }

  private setupGlobalErrorHandling() {
    // Global error handler for unhandled JavaScript errors
    const handleError = (event: ErrorEvent) => {
      const errorData = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        type: 'javascript_error'
      }

      console.error('Global JavaScript Error:', errorData)

      // In production, send to error monitoring service
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to monitoring service
        // errorMonitoringService.captureException(event.error, errorData)
      }
    }

    // Global handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorData = {
        reason: event.reason,
        promise: event.promise,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        type: 'unhandled_promise_rejection'
      }

      console.error('Unhandled Promise Rejection:', errorData)

      // In production, send to error monitoring service
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to monitoring service
        // errorMonitoringService.captureException(event.reason, errorData)
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    this.cleanupFunctions.push(() => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    })
  }

  private setupCleanup() {
    const cleanup = () => {
      this.cleanupFunctions.forEach(fn => {
        try {
          fn()
        } catch (error) {
          console.warn('Error during cleanup:', error)
        }
      })
    }

    window.addEventListener('beforeunload', cleanup)
    window.addEventListener('pagehide', cleanup)

    // Also cleanup on visibility change (for mobile)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        cleanup()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    this.cleanupFunctions.push(() => {
      window.removeEventListener('beforeunload', cleanup)
      window.removeEventListener('pagehide', cleanup)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })
  }

  destroy() {
    this.cleanupFunctions.forEach(fn => {
      try {
        fn()
      } catch (error) {
        console.warn('Error during navigation system cleanup:', error)
      }
    })
    this.cleanupFunctions = []
    this.isInitialized = false
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      config: this.config,
      cleanupFunctionsCount: this.cleanupFunctions.length
    }
  }
}

// Singleton instance
let navigationSystem: NavigationSystem | null = null

export function getNavigationSystem(config?: NavigationConfig): NavigationSystem {
  if (!navigationSystem) {
    navigationSystem = new NavigationSystem(config)
  }
  return navigationSystem
}

// Convenience function to initialize with default config
export function initializeNavigationSystem(config?: NavigationConfig) {
  const system = getNavigationSystem(config)
  system.initialize()
  return system
}

// React hook for navigation system status
export function useNavigationSystem() {
  const system = getNavigationSystem()
  
  return {
    initialize: (config?: NavigationConfig) => {
      const newSystem = getNavigationSystem(config)
      newSystem.initialize()
      return newSystem
    },
    getStatus: () => system.getStatus(),
    destroy: () => system.destroy()
  }
}

export { NavigationSystem }
export type { NavigationConfig }