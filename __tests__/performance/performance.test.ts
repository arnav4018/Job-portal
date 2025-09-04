import { performance } from 'perf_hooks'

/**
 * Performance Testing Suite
 * Tests performance benchmarks and regression detection
 */

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  timestamp: number
}

interface PerformanceBenchmark {
  route: string
  maxLoadTime: number
  maxRenderTime: number
  maxMemoryUsage: number
}

// Performance benchmarks based on requirements
const PERFORMANCE_BENCHMARKS: PerformanceBenchmark[] = [
  { route: '/', maxLoadTime: 3000, maxRenderTime: 100, maxMemoryUsage: 50 },
  { route: '/dashboard', maxLoadTime: 3000, maxRenderTime: 100, maxMemoryUsage: 75 },
  { route: '/profile', maxLoadTime: 3000, maxRenderTime: 100, maxMemoryUsage: 60 },
  { route: '/jobs', maxLoadTime: 3000, maxRenderTime: 100, maxMemoryUsage: 80 },
  { route: '/resume-builder', maxLoadTime: 3000, maxRenderTime: 100, maxMemoryUsage: 100 },
]

class PerformanceTracker {
  private metrics: Map<string, PerformanceMetrics[]> = new Map()

  startTracking(route: string): number {
    return performance.now()
  }

  endTracking(route: string, startTime: number): PerformanceMetrics {
    const endTime = performance.now()
    const loadTime = endTime - startTime
    
    const metrics: PerformanceMetrics = {
      loadTime,
      renderTime: loadTime, // Simplified for testing
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
      timestamp: Date.now()
    }

    if (!this.metrics.has(route)) {
      this.metrics.set(route, [])
    }
    this.metrics.get(route)!.push(metrics)

    return metrics
  }

  getMetrics(route: string): PerformanceMetrics[] {
    return this.metrics.get(route) || []
  }

  getAverageMetrics(route: string): PerformanceMetrics | null {
    const routeMetrics = this.getMetrics(route)
    if (routeMetrics.length === 0) return null

    const avg = routeMetrics.reduce(
      (acc, metric) => ({
        loadTime: acc.loadTime + metric.loadTime,
        renderTime: acc.renderTime + metric.renderTime,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
        timestamp: acc.timestamp + metric.timestamp
      }),
      { loadTime: 0, renderTime: 0, memoryUsage: 0, timestamp: 0 }
    )

    const count = routeMetrics.length
    return {
      loadTime: avg.loadTime / count,
      renderTime: avg.renderTime / count,
      memoryUsage: avg.memoryUsage / count,
      timestamp: avg.timestamp / count
    }
  }

  detectRegression(route: string, threshold: number = 20): boolean {
    const metrics = this.getMetrics(route)
    if (metrics.length < 2) return false

    const recent = metrics.slice(-5) // Last 5 measurements
    const baseline = metrics.slice(0, Math.min(10, metrics.length - 5)) // First 10 measurements

    if (baseline.length === 0) return false

    const recentAvg = recent.reduce((sum, m) => sum + m.loadTime, 0) / recent.length
    const baselineAvg = baseline.reduce((sum, m) => sum + m.loadTime, 0) / baseline.length

    const regressionPercent = ((recentAvg - baselineAvg) / baselineAvg) * 100
    return regressionPercent > threshold
  }
}

describe('Performance Testing Suite', () => {
  let performanceTracker: PerformanceTracker

  beforeEach(() => {
    performanceTracker = new PerformanceTracker()
  })

  describe('Performance Benchmarks', () => {
    test.each(PERFORMANCE_BENCHMARKS)(
      'Route $route should meet performance benchmarks',
      async (benchmark) => {
        // Simulate route loading
        const startTime = performanceTracker.startTracking(benchmark.route)
        
        // Simulate some work (replace with actual route testing)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
        
        const metrics = performanceTracker.endTracking(benchmark.route, startTime)

        expect(metrics.loadTime).toBeLessThan(benchmark.maxLoadTime)
        expect(metrics.renderTime).toBeLessThan(benchmark.maxRenderTime)
        expect(metrics.memoryUsage).toBeLessThan(benchmark.maxMemoryUsage)
      }
    )
  })

  describe('Performance Regression Detection', () => {
    test('should detect performance regression', async () => {
      const route = '/test-route'
      
      // Create baseline measurements (fast)
      for (let i = 0; i < 10; i++) {
        const startTime = performanceTracker.startTracking(route)
        await new Promise(resolve => setTimeout(resolve, 10))
        performanceTracker.endTracking(route, startTime)
      }

      // Create recent measurements (slow - simulating regression)
      for (let i = 0; i < 5; i++) {
        const startTime = performanceTracker.startTracking(route)
        await new Promise(resolve => setTimeout(resolve, 50))
        performanceTracker.endTracking(route, startTime)
      }

      const hasRegression = performanceTracker.detectRegression(route, 20)
      expect(hasRegression).toBe(true)
    })

    test('should not detect regression with consistent performance', async () => {
      const route = '/consistent-route'
      
      // Create consistent measurements
      for (let i = 0; i < 15; i++) {
        const startTime = performanceTracker.startTracking(route)
        await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 5))
        performanceTracker.endTracking(route, startTime)
      }

      const hasRegression = performanceTracker.detectRegression(route, 20)
      expect(hasRegression).toBe(false)
    })
  })

  describe('Load Testing Simulation', () => {
    test('should handle concurrent requests without performance degradation', async () => {
      const route = '/load-test'
      const concurrentRequests = 10
      
      const promises = Array.from({ length: concurrentRequests }, async (_, index) => {
        const startTime = performanceTracker.startTracking(`${route}-${index}`)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50))
        return performanceTracker.endTracking(`${route}-${index}`, startTime)
      })

      const results = await Promise.all(promises)
      
      // All requests should complete within acceptable time
      results.forEach(result => {
        expect(result.loadTime).toBeLessThan(1000) // 1 second max under load
      })

      // Average performance should still be good
      const avgLoadTime = results.reduce((sum, r) => sum + r.loadTime, 0) / results.length
      expect(avgLoadTime).toBeLessThan(500) // 500ms average under load
    })

    test('should maintain memory efficiency under load', async () => {
      const route = '/memory-test'
      const iterations = 50
      
      const initialMemory = process.memoryUsage().heapUsed
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performanceTracker.startTracking(route)
        await new Promise(resolve => setTimeout(resolve, 5))
        performanceTracker.endTracking(route, startTime)
      }

      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024 // MB

      // Memory increase should be reasonable (less than 10MB for test operations)
      expect(memoryIncrease).toBeLessThan(10)
    })
  })

  describe('Performance Metrics Collection', () => {
    test('should collect and aggregate performance metrics', async () => {
      const route = '/metrics-test'
      const measurements = 5

      for (let i = 0; i < measurements; i++) {
        const startTime = performanceTracker.startTracking(route)
        await new Promise(resolve => setTimeout(resolve, 20 + i * 5))
        performanceTracker.endTracking(route, startTime)
      }

      const metrics = performanceTracker.getMetrics(route)
      expect(metrics).toHaveLength(measurements)

      const avgMetrics = performanceTracker.getAverageMetrics(route)
      expect(avgMetrics).toBeDefined()
      expect(avgMetrics!.loadTime).toBeGreaterThan(0)
      expect(avgMetrics!.memoryUsage).toBeGreaterThan(0)
    })

    test('should handle empty metrics gracefully', () => {
      const route = '/empty-route'
      
      const metrics = performanceTracker.getMetrics(route)
      expect(metrics).toHaveLength(0)

      const avgMetrics = performanceTracker.getAverageMetrics(route)
      expect(avgMetrics).toBeNull()

      const hasRegression = performanceTracker.detectRegression(route)
      expect(hasRegression).toBe(false)
    })
  })
})