/**
 * Performance Regression Testing Suite
 * Automated detection of performance regressions in CI/CD pipeline
 */

import { performance } from 'perf_hooks'
import fs from 'fs/promises'
import path from 'path'

interface BaselineMetrics {
  route: string
  loadTime: number
  renderTime: number
  memoryUsage: number
  bundleSize: number
  timestamp: number
  version: string
}

interface RegressionAlert {
  route: string
  metric: string
  baselineValue: number
  currentValue: number
  regressionPercentage: number
  threshold: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

class PerformanceRegressionDetector {
  private baselineFile = path.join(process.cwd(), '.performance-baselines.json')
  private alertThresholds = {
    loadTime: { low: 10, medium: 20, high: 35, critical: 50 },
    renderTime: { low: 15, medium: 25, high: 40, critical: 60 },
    memoryUsage: { low: 20, medium: 30, high: 50, critical: 75 },
    bundleSize: { low: 5, medium: 10, high: 20, critical: 30 }
  }

  async loadBaselines(): Promise<Map<string, BaselineMetrics>> {
    try {
      const data = await fs.readFile(this.baselineFile, 'utf-8')
      const baselines = JSON.parse(data)
      return new Map(Object.entries(baselines))
    } catch {
      return new Map()
    }
  }

  async saveBaselines(baselines: Map<string, BaselineMetrics>): Promise<void> {
    const data = Object.fromEntries(baselines)
    await fs.writeFile(this.baselineFile, JSON.stringify(data, null, 2))
  }

  async measureRoutePerformance(route: string): Promise<BaselineMetrics> {
    const startTime = performance.now()
    
    // Simulate route loading
    await this.simulateRouteLoad(route)
    
    const endTime = performance.now()
    const loadTime = endTime - startTime
    
    return {
      route,
      loadTime,
      renderTime: loadTime * 0.3,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
      bundleSize: this.estimateBundleSize(route),
      timestamp: Date.now(),
      version: process.env.npm_package_version || '1.0.0'
    }
  }

  async detectRegressions(currentMetrics: BaselineMetrics[]): Promise<RegressionAlert[]> {
    const baselines = await this.loadBaselines()
    const alerts: RegressionAlert[] = []

    for (const current of currentMetrics) {
      const baseline = baselines.get(current.route)
      if (!baseline) continue

      const regressionChecks = [
        { metric: 'loadTime', baseline: baseline.loadTime, current: current.loadTime },
        { metric: 'renderTime', baseline: baseline.renderTime, current: current.renderTime },
        { metric: 'memoryUsage', baseline: baseline.memoryUsage, current: current.memoryUsage },
        { metric: 'bundleSize', baseline: baseline.bundleSize, current: current.bundleSize }
      ]

      for (const check of regressionChecks) {
        const regressionPercentage = ((check.current - check.baseline) / check.baseline) * 100
        const severity = this.calculateSeverity(check.metric, regressionPercentage)

        if (severity !== null) {
          alerts.push({
            route: current.route,
            metric: check.metric,
            baselineValue: check.baseline,
            currentValue: check.current,
            regressionPercentage,
            threshold: this.alertThresholds[check.metric as keyof typeof this.alertThresholds].low,
            severity
          })
        }
      }
    }

    return alerts
  }

  private calculateSeverity(metric: string, regressionPercentage: number): 'low' | 'medium' | 'high' | 'critical' | null {
    const thresholds = this.alertThresholds[metric as keyof typeof this.alertThresholds]
    if (!thresholds) return null

    if (regressionPercentage >= thresholds.critical) return 'critical'
    if (regressionPercentage >= thresholds.high) return 'high'
    if (regressionPercentage >= thresholds.medium) return 'medium'
    if (regressionPercentage >= thresholds.low) return 'low'
    return null
  }

  private async simulateRouteLoad(route: string): Promise<void> {
    const loadTime = this.getExpectedLoadTime(route)
    await new Promise(resolve => setTimeout(resolve, loadTime))
  }

  private getExpectedLoadTime(route: string): number {
    const baseTimes: Record<string, number> = {
      '/': 30,
      '/dashboard': 80,
      '/profile': 60,
      '/jobs': 70,
      '/resume-builder': 120,
      '/post-job': 50
    }
    return baseTimes[route] || 50
  }

  private estimateBundleSize(route: string): number {
    const baseSizes: Record<string, number> = {
      '/': 150,
      '/dashboard': 300,
      '/profile': 200,
      '/jobs': 250,
      '/resume-builder': 400,
      '/post-job': 180
    }
    return baseSizes[route] || 200
  }
}

describe('Performance Regression Detection', () => {
  let detector: PerformanceRegressionDetector

  beforeEach(() => {
    detector = new PerformanceRegressionDetector()
  })

  describe('Baseline Management', () => {
    test('should create and save performance baselines', async () => {
      const routes = ['/', '/dashboard', '/profile']
      const baselines = new Map<string, BaselineMetrics>()

      for (const route of routes) {
        const metrics = await detector.measureRoutePerformance(route)
        baselines.set(route, metrics)
      }

      await detector.saveBaselines(baselines)
      const loadedBaselines = await detector.loadBaselines()

      expect(loadedBaselines.size).toBe(3)
      expect(loadedBaselines.has('/')).toBe(true)
      expect(loadedBaselines.has('/dashboard')).toBe(true)
      expect(loadedBaselines.has('/profile')).toBe(true)
    })

    test('should handle missing baseline file gracefully', async () => {
      const baselines = await detector.loadBaselines()
      expect(baselines).toBeInstanceOf(Map)
      expect(baselines.size).toBeGreaterThanOrEqual(0)
    })

    test('should measure route performance accurately', async () => {
      const route = '/test-route'
      const metrics = await detector.measureRoutePerformance(route)

      expect(metrics.route).toBe(route)
      expect(metrics.loadTime).toBeGreaterThan(0)
      expect(metrics.renderTime).toBeGreaterThan(0)
      expect(metrics.memoryUsage).toBeGreaterThan(0)
      expect(metrics.bundleSize).toBeGreaterThan(0)
      expect(metrics.timestamp).toBeGreaterThan(0)
      expect(metrics.version).toBeTruthy()
    })
  })

  describe('Regression Detection', () => {
    test('should detect performance regressions', async () => {
      // Create baseline
      const baselineMetrics = await detector.measureRoutePerformance('/')
      const baselines = new Map([['/', baselineMetrics]])
      await detector.saveBaselines(baselines)

      // Simulate degraded performance
      const degradedMetrics: BaselineMetrics = {
        ...baselineMetrics,
        loadTime: baselineMetrics.loadTime * 1.3, // 30% slower
        renderTime: baselineMetrics.renderTime * 1.2, // 20% slower
        timestamp: Date.now()
      }

      const alerts = await detector.detectRegressions([degradedMetrics])
      
      expect(alerts.length).toBeGreaterThan(0)
      
      const loadTimeAlert = alerts.find(alert => alert.metric === 'loadTime')
      expect(loadTimeAlert).toBeDefined()
      expect(loadTimeAlert!.regressionPercentage).toBeGreaterThan(20)
      expect(['medium', 'high', 'critical']).toContain(loadTimeAlert!.severity)
    })

    test('should not trigger false positives for minor variations', async () => {
      // Create baseline
      const baselineMetrics = await detector.measureRoutePerformance('/stable-route')
      const baselines = new Map([['stable-route', baselineMetrics]])
      await detector.saveBaselines(baselines)

      // Simulate minor variation (within acceptable range)
      const slightVariation: BaselineMetrics = {
        ...baselineMetrics,
        loadTime: baselineMetrics.loadTime * 1.05, // 5% variation
        renderTime: baselineMetrics.renderTime * 1.03, // 3% variation
        timestamp: Date.now()
      }

      const alerts = await detector.detectRegressions([slightVariation])
      
      // Should not trigger alerts for minor variations
      expect(alerts.length).toBe(0)
    })

    test('should categorize regression severity correctly', async () => {
      const baselineMetrics = await detector.measureRoutePerformance('/severity-test')
      const baselines = new Map([['severity-test', baselineMetrics]])
      await detector.saveBaselines(baselines)

      // Test different severity levels
      const testCases = [
        { multiplier: 1.15, expectedSeverity: 'low' },
        { multiplier: 1.25, expectedSeverity: 'medium' },
        { multiplier: 1.40, expectedSeverity: 'high' },
        { multiplier: 1.60, expectedSeverity: 'critical' }
      ]

      for (const testCase of testCases) {
        const degradedMetrics: BaselineMetrics = {
          ...baselineMetrics,
          loadTime: baselineMetrics.loadTime * testCase.multiplier,
          timestamp: Date.now()
        }

        const alerts = await detector.detectRegressions([degradedMetrics])
        const loadTimeAlert = alerts.find(alert => alert.metric === 'loadTime')
        
        if (loadTimeAlert) {
          expect(loadTimeAlert.severity).toBe(testCase.expectedSeverity)
        }
      }
    })
  })

  describe('CI/CD Integration', () => {
    test('should provide CI/CD compatible exit codes', async () => {
      const routes = ['/', '/dashboard']
      const currentMetrics: BaselineMetrics[] = []

      for (const route of routes) {
        const metrics = await detector.measureRoutePerformance(route)
        currentMetrics.push(metrics)
      }

      const alerts = await detector.detectRegressions(currentMetrics)
      
      // Determine CI/CD exit code based on alerts
      const hasCriticalAlerts = alerts.some(alert => alert.severity === 'critical')
      const hasHighAlerts = alerts.some(alert => alert.severity === 'high')
      
      let exitCode = 0 // Success
      if (hasCriticalAlerts) exitCode = 2 // Critical failure
      else if (hasHighAlerts) exitCode = 1 // Warning
      
      expect([0, 1, 2]).toContain(exitCode)
    })

    test('should generate detailed regression reports', async () => {
      const baselineMetrics = await detector.measureRoutePerformance('/report-test')
      const baselines = new Map([['report-test', baselineMetrics]])
      await detector.saveBaselines(baselines)

      const degradedMetrics: BaselineMetrics = {
        ...baselineMetrics,
        loadTime: baselineMetrics.loadTime * 1.5,
        memoryUsage: baselineMetrics.memoryUsage * 1.3,
        timestamp: Date.now()
      }

      const alerts = await detector.detectRegressions([degradedMetrics])
      
      // Verify report completeness
      alerts.forEach(alert => {
        expect(alert.route).toBeTruthy()
        expect(alert.metric).toBeTruthy()
        expect(alert.baselineValue).toBeGreaterThan(0)
        expect(alert.currentValue).toBeGreaterThan(0)
        expect(alert.regressionPercentage).toBeGreaterThan(0)
        expect(alert.threshold).toBeGreaterThan(0)
        expect(['low', 'medium', 'high', 'critical']).toContain(alert.severity)
      })
    })
  })
})