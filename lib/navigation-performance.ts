// Navigation Performance Monitoring and Optimization

interface NavigationMetrics {
  route: string
  loadTime: number
  renderTime: number
  timestamp: Date
  userAgent: string
  connectionType?: string
}

interface RoutePreloadConfig {
  route: string
  priority: 'high' | 'medium' | 'low'
  preloadData?: boolean
  preloadComponents?: boolean
}

class NavigationPerformanceMonitor {
  private metrics: NavigationMetrics[] = []
  private preloadedRoutes = new Set<string>()
  private routeCache = new Map<string, any>()
  private performanceObserver?: PerformanceObserver

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializePerformanceObserver()
      this.setupNavigationTracking()
    }
  }

  private initializePerformanceObserver() {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.recordNavigationMetric(entry as PerformanceNavigationTiming)
          }
        })
      })

      this.performanceObserver.observe({ entryTypes: ['navigation'] })
    }
  }

  private setupNavigationTracking() {
    // Track route changes in Next.js
    if (typeof window !== 'undefined' && window.history) {
      const originalPushState = window.history.pushState
      const originalReplaceState = window.history.replaceState

      window.history.pushState = (...args) => {
        this.onRouteChange(args[2] as string)
        return originalPushState.apply(window.history, args)
      }

      window.history.replaceState = (...args) => {
        this.onRouteChange(args[2] as string)
        return originalReplaceState.apply(window.history, args)
      }

      window.addEventListener('popstate', (event) => {
        this.onRouteChange(window.location.pathname)
      })
    }
  }

  private onRouteChange(route: string) {
    const startTime = performance.now()
    
    // Record route change
    requestAnimationFrame(() => {
      const endTime = performance.now()
      const loadTime = endTime - startTime

      this.recordMetric({
        route,
        loadTime,
        renderTime: loadTime,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        connectionType: this.getConnectionType()
      })
    })
  }

  private recordNavigationMetric(entry: PerformanceNavigationTiming) {
    const metric: NavigationMetrics = {
      route: window.location.pathname,
      loadTime: entry.loadEventEnd - entry.loadEventStart,
      renderTime: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      connectionType: this.getConnectionType()
    }

    this.recordMetric(metric)
  }

  private getConnectionType(): string {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      return connection?.effectiveType || 'unknown'
    }
    return 'unknown'
  }

  recordMetric(metric: NavigationMetrics) {
    this.metrics.push(metric)
    
    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100)
    }

    // Log slow navigation
    if (metric.loadTime > 3000) {
      console.warn('Slow navigation detected:', metric)
      this.reportSlowNavigation(metric)
    }

    // Store in localStorage for persistence
    try {
      localStorage.setItem('navigation_metrics', JSON.stringify(this.metrics.slice(-10)))
    } catch (error) {
      console.warn('Failed to store navigation metrics:', error)
    }
  }

  private reportSlowNavigation(metric: NavigationMetrics) {
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to monitoring service
      // monitoringService.reportSlowNavigation(metric)
    }
  }

  getMetrics(): NavigationMetrics[] {
    return [...this.metrics]
  }

  getAverageLoadTime(route?: string): number {
    const filteredMetrics = route 
      ? this.metrics.filter(m => m.route === route)
      : this.metrics

    if (filteredMetrics.length === 0) return 0

    const totalTime = filteredMetrics.reduce((sum, metric) => sum + metric.loadTime, 0)
    return totalTime / filteredMetrics.length
  }

  getSlowRoutes(threshold = 3000): string[] {
    const routeStats = new Map<string, { total: number, count: number }>()

    this.metrics.forEach(metric => {
      const stats = routeStats.get(metric.route) || { total: 0, count: 0 }
      stats.total += metric.loadTime
      stats.count += 1
      routeStats.set(metric.route, stats)
    })

    const slowRoutes: string[] = []
    routeStats.forEach((stats, route) => {
      const average = stats.total / stats.count
      if (average > threshold) {
        slowRoutes.push(route)
      }
    })

    return slowRoutes
  }

  // Route preloading functionality
  preloadRoute(route: string, config: RoutePreloadConfig = { route, priority: 'medium' }) {
    if (this.preloadedRoutes.has(route)) {
      return Promise.resolve()
    }

    this.preloadedRoutes.add(route)

    const promises: Promise<any>[] = []

    // Preload the route component
    if (config.preloadComponents !== false) {
      promises.push(this.preloadComponent(route, config.priority))
    }

    // Preload route data
    if (config.preloadData) {
      promises.push(this.preloadData(route))
    }

    return Promise.all(promises)
  }

  private async preloadComponent(route: string, priority: 'high' | 'medium' | 'low') {
    try {
      // Use Next.js router prefetch if available
      if (typeof window !== 'undefined' && (window as any).next?.router) {
        const router = (window as any).next.router
        await router.prefetch(route)
      } else {
        // Fallback: create a link element for preloading
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = route
        link.as = 'document'
        
        if (priority === 'high') {
          link.rel = 'preload'
        }
        
        document.head.appendChild(link)
      }
    } catch (error) {
      console.warn('Failed to preload component for route:', route, error)
    }
  }

  private async preloadData(route: string) {
    try {
      // Check if data is already cached
      if (this.routeCache.has(route)) {
        return this.routeCache.get(route)
      }

      // Determine API endpoint based on route
      const apiEndpoint = this.getApiEndpointForRoute(route)
      if (!apiEndpoint) return

      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        this.routeCache.set(route, data)
        return data
      }
    } catch (error) {
      console.warn('Failed to preload data for route:', route, error)
    }
  }

  private getApiEndpointForRoute(route: string): string | null {
    // Map routes to their corresponding API endpoints
    const routeApiMap: Record<string, string> = {
      '/jobs': '/api/jobs',
      '/dashboard': '/api/dashboard',
      '/profile': '/api/profile',
      '/resume-builder': '/api/resumes',
      '/companies': '/api/companies',
    }

    // Handle dynamic routes
    if (route.startsWith('/jobs/')) {
      const jobId = route.split('/')[2]
      return `/api/jobs/${jobId}`
    }

    if (route.startsWith('/companies/')) {
      const companyId = route.split('/')[2]
      return `/api/companies/${companyId}`
    }

    if (route.startsWith('/resume-builder/')) {
      const resumeId = route.split('/')[2]
      return `/api/resumes/${resumeId}`
    }

    return routeApiMap[route] || null
  }

  getCachedData(route: string) {
    return this.routeCache.get(route)
  }

  clearCache(route?: string) {
    if (route) {
      this.routeCache.delete(route)
    } else {
      this.routeCache.clear()
    }
  }

  // Intelligent preloading based on user behavior
  setupIntelligentPreloading() {
    if (typeof window === 'undefined') return

    // Preload on hover with delay
    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (link && link.href && this.isInternalLink(link.href)) {
        const route = new URL(link.href).pathname
        
        // Delay preloading to avoid unnecessary requests
        setTimeout(() => {
          this.preloadRoute(route, { route, priority: 'low' })
        }, 100)
      }
    })

    // Preload on focus for keyboard navigation
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'A' && (target as HTMLAnchorElement).href) {
        const link = target as HTMLAnchorElement
        if (this.isInternalLink(link.href)) {
          const route = new URL(link.href).pathname
          this.preloadRoute(route, { route, priority: 'medium' })
        }
      }
    })

    // Preload high-priority routes on idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.preloadHighPriorityRoutes()
      })
    } else {
      setTimeout(() => {
        this.preloadHighPriorityRoutes()
      }, 2000)
    }
  }

  private isInternalLink(href: string): boolean {
    try {
      const url = new URL(href)
      return url.origin === window.location.origin
    } catch {
      return false
    }
  }

  private preloadHighPriorityRoutes() {
    const highPriorityRoutes = [
      '/dashboard',
      '/jobs',
      '/profile'
    ]

    highPriorityRoutes.forEach(route => {
      this.preloadRoute(route, { 
        route, 
        priority: 'high',
        preloadData: true 
      })
    })
  }

  // Performance reporting
  generatePerformanceReport() {
    const metrics = this.getMetrics()
    const averageLoadTime = this.getAverageLoadTime()
    const slowRoutes = this.getSlowRoutes()

    return {
      totalNavigations: metrics.length,
      averageLoadTime: Math.round(averageLoadTime),
      slowRoutes,
      recentMetrics: metrics.slice(-10),
      cacheSize: this.routeCache.size,
      preloadedRoutes: Array.from(this.preloadedRoutes),
      connectionType: this.getConnectionType(),
      timestamp: new Date().toISOString()
    }
  }

  destroy() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect()
    }
    this.metrics = []
    this.routeCache.clear()
    this.preloadedRoutes.clear()
  }
}

// Singleton instance
let navigationMonitor: NavigationPerformanceMonitor | null = null

export function getNavigationMonitor(): NavigationPerformanceMonitor {
  if (!navigationMonitor) {
    navigationMonitor = new NavigationPerformanceMonitor()
  }
  return navigationMonitor
}

// React hook for using navigation performance monitoring
export function useNavigationPerformance() {
  const monitor = getNavigationMonitor()

  return {
    recordMetric: (metric: Omit<NavigationMetrics, 'timestamp' | 'userAgent'>) => {
      monitor.recordMetric({
        ...metric,
        timestamp: new Date(),
        userAgent: navigator.userAgent
      })
    },
    getMetrics: () => monitor.getMetrics(),
    getAverageLoadTime: (route?: string) => monitor.getAverageLoadTime(route),
    preloadRoute: (route: string, config?: RoutePreloadConfig) => monitor.preloadRoute(route, config),
    getCachedData: (route: string) => monitor.getCachedData(route),
    generateReport: () => monitor.generatePerformanceReport()
  }
}

// Utility function to setup navigation performance monitoring
export function initializeNavigationPerformance() {
  if (typeof window !== 'undefined') {
    const monitor = getNavigationMonitor()
    monitor.setupIntelligentPreloading()
    
    // Log performance report periodically in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        const report = monitor.generatePerformanceReport()
        console.log('Navigation Performance Report:', report)
      }, 30000) // Every 30 seconds
    }
  }
}

export type { NavigationMetrics, RoutePreloadConfig }