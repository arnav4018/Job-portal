// Bundle Optimization and Code Splitting Utilities
import React from 'react'

interface BundleAnalytics {
  route: string
  bundleSize: number
  loadTime: number
  components: string[]
  timestamp: Date
}

interface LazyComponentConfig {
  component: () => Promise<any>
  fallback?: React.ComponentType
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>
  preload?: boolean
  priority?: 'high' | 'medium' | 'low'
}

class BundleOptimizer {
  private analytics: BundleAnalytics[] = []
  private lazyComponents = new Map<string, LazyComponentConfig>()
  private preloadedBundles = new Set<string>()

  // Register a lazy component for optimization
  registerLazyComponent(name: string, config: LazyComponentConfig) {
    this.lazyComponents.set(name, config)
    
    if (config.preload) {
      this.preloadComponent(name, config.priority || 'medium')
    }
  }

  // Preload component bundle
  async preloadComponent(name: string, priority: 'high' | 'medium' | 'low' = 'medium') {
    if (this.preloadedBundles.has(name)) {
      return
    }

    const config = this.lazyComponents.get(name)
    if (!config) {
      console.warn(`Component ${name} not registered for lazy loading`)
      return
    }

    try {
      const startTime = performance.now()
      
      // Preload the component
      await config.component()
      
      const loadTime = performance.now() - startTime
      this.preloadedBundles.add(name)
      
      console.log(`Preloaded component ${name} in ${Math.round(loadTime)}ms`)
      
      // Record analytics
      this.recordBundleAnalytics({
        route: name,
        bundleSize: 0, // Would need actual bundle size measurement
        loadTime,
        components: [name],
        timestamp: new Date()
      })
      
    } catch (error) {
      console.error(`Failed to preload component ${name}:`, error)
    }
  }

  // Record bundle analytics
  recordBundleAnalytics(analytics: BundleAnalytics) {
    this.analytics.push(analytics)
    
    // Keep only last 100 entries
    if (this.analytics.length > 100) {
      this.analytics = this.analytics.slice(-100)
    }
  }

  // Get bundle performance metrics
  getBundleMetrics(route?: string) {
    const filteredAnalytics = route 
      ? this.analytics.filter(a => a.route === route)
      : this.analytics

    if (filteredAnalytics.length === 0) {
      return {
        averageLoadTime: 0,
        totalBundles: 0,
        preloadedCount: this.preloadedBundles.size
      }
    }

    const totalLoadTime = filteredAnalytics.reduce((sum, a) => sum + a.loadTime, 0)
    const averageLoadTime = totalLoadTime / filteredAnalytics.length

    return {
      averageLoadTime: Math.round(averageLoadTime),
      totalBundles: filteredAnalytics.length,
      preloadedCount: this.preloadedBundles.size,
      slowestBundle: filteredAnalytics.reduce((slowest, current) => 
        current.loadTime > slowest.loadTime ? current : slowest
      )
    }
  }

  // Intelligent bundle preloading based on route patterns
  setupIntelligentBundlePreloading() {
    if (typeof window === 'undefined') return

    // Preload bundles on idle
    const preloadOnIdle = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          this.preloadCriticalBundles()
        })
      } else {
        setTimeout(() => {
          this.preloadCriticalBundles()
        }, 2000)
      }
    }

    // Preload based on user interaction patterns
    let interactionCount = 0
    const handleUserInteraction = () => {
      interactionCount++
      
      // After some interactions, preload more bundles
      if (interactionCount === 3) {
        this.preloadSecondaryBundles()
      }
    }

    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)
    document.addEventListener('scroll', handleUserInteraction, { once: true })

    // Initial preload
    preloadOnIdle()

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
      document.removeEventListener('scroll', handleUserInteraction)
    }
  }

  private preloadCriticalBundles() {
    // Define critical components that should be preloaded
    const criticalComponents = [
      'JobCard',
      'CompanyCard', 
      'UserProfile',
      'Dashboard'
    ]

    criticalComponents.forEach(component => {
      if (this.lazyComponents.has(component)) {
        this.preloadComponent(component, 'high')
      }
    })
  }

  private preloadSecondaryBundles() {
    // Define secondary components for engaged users
    const secondaryComponents = [
      'ResumeBuilder',
      'JobApplication',
      'MessageCenter',
      'Settings'
    ]

    secondaryComponents.forEach(component => {
      if (this.lazyComponents.has(component)) {
        this.preloadComponent(component, 'medium')
      }
    })
  }

  // Generate bundle optimization report
  generateOptimizationReport() {
    const metrics = this.getBundleMetrics()
    const slowBundles = this.analytics
      .filter(a => a.loadTime > 1000)
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 5)

    return {
      ...metrics,
      slowBundles,
      preloadedBundles: Array.from(this.preloadedBundles),
      registeredComponents: Array.from(this.lazyComponents.keys()),
      recommendations: this.generateOptimizationRecommendations()
    }
  }

  private generateOptimizationRecommendations() {
    const recommendations: string[] = []
    const metrics = this.getBundleMetrics()

    if (metrics.averageLoadTime > 2000) {
      recommendations.push('Consider code splitting large components')
    }

    if (this.preloadedBundles.size < 3) {
      recommendations.push('Increase preloading of critical components')
    }

    const slowBundles = this.analytics.filter(a => a.loadTime > 3000)
    if (slowBundles.length > 0) {
      recommendations.push('Optimize slow-loading bundles: ' + 
        slowBundles.map(b => b.route).join(', '))
    }

    if (recommendations.length === 0) {
      recommendations.push('Bundle performance is optimal')
    }

    return recommendations
  }

  // Clear analytics and cache
  clearCache() {
    this.analytics = []
    this.preloadedBundles.clear()
  }
}

// Singleton instance
let bundleOptimizer: BundleOptimizer | null = null

export function getBundleOptimizer(): BundleOptimizer {
  if (!bundleOptimizer) {
    bundleOptimizer = new BundleOptimizer()
  }
  return bundleOptimizer
}

// React hook for bundle optimization
export function useBundleOptimization() {
  const optimizer = getBundleOptimizer()

  return {
    registerLazyComponent: (name: string, config: LazyComponentConfig) => 
      optimizer.registerLazyComponent(name, config),
    preloadComponent: (name: string, priority?: 'high' | 'medium' | 'low') => 
      optimizer.preloadComponent(name, priority),
    getBundleMetrics: (route?: string) => optimizer.getBundleMetrics(route),
    generateReport: () => optimizer.generateOptimizationReport()
  }
}

// Utility function to create optimized lazy components
export function createOptimizedLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    name: string
    fallback?: React.ComponentType
    errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>
    preload?: boolean
    priority?: 'high' | 'medium' | 'low'
  }
) {
  const optimizer = getBundleOptimizer()
  
  // Register the component
  optimizer.registerLazyComponent(options.name, {
    component: importFn,
    fallback: options.fallback,
    errorBoundary: options.errorBoundary,
    preload: options.preload,
    priority: options.priority
  })

  // Return the lazy component
  return React.lazy(() => {
    const startTime = performance.now()
    
    return importFn().then(module => {
      const loadTime = performance.now() - startTime
      
      // Record analytics
      optimizer.recordBundleAnalytics({
        route: options.name,
        bundleSize: 0, // Would need actual measurement
        loadTime,
        components: [options.name],
        timestamp: new Date()
      })
      
      return module
    })
  })
}

// Initialize bundle optimization
export function initializeBundleOptimization() {
  if (typeof window !== 'undefined') {
    const optimizer = getBundleOptimizer()
    return optimizer.setupIntelligentBundlePreloading()
  }
}

export type { BundleAnalytics, LazyComponentConfig }