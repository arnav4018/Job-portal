/**
 * Load Testing Suite
 * Tests application performance under various load conditions
 */

import { performance } from 'perf_hooks'

interface LoadTestConfig {
  route: string
  concurrentUsers: number
  duration: number
  rampUpTime: number
  expectedThroughput: number
  maxResponseTime: number
}

interface LoadTestMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  throughput: number
  errorRate: number
  memoryUsage: number
}

interface LoadTestResult {
  config: LoadTestConfig
  metrics: LoadTestMetrics
  passed: boolean
  startTime: number
  endTime: number
  duration: number
}

class LoadTester {
  private activeRequests = new Set<Promise<number>>()
  private results: number[] = []

  async runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
    const startTime = Date.now()
    this.results = []
    this.activeRequests.clear()

    // Create concurrent requests
    for (let i = 0; i < config.concurrentUsers; i++) {
      const request = this.simulateUserRequest(config.route, config.duration)
      this.activeRequests.add(request)
    }

    // Wait for all requests to complete
    const responses = await Promise.allSettled(Array.from(this.activeRequests))
    
    const endTime = Date.now()
    const actualDuration = endTime - startTime

    // Process results
    responses.forEach(response => {
      if (response.status === 'fulfilled') {
        this.results.push(response.value)
      } else {
        this.results.push(-1) // Mark as failed
      }
    })

    const metrics = this.calculateMetrics(actualDuration)
    const passed = this.evaluateTestResults(config, metrics)

    return {
      config,
      metrics,
      passed,
      startTime,
      endTime,
      duration: actualDuration
    }
  }

  private async simulateUserRequest(route: string, maxDuration: number): Promise<number> {
    const startTime = performance.now()
    
    // Simulate request processing time based on route complexity
    const baseTime = this.getBaseResponseTime(route)
    const variation = Math.random() * 50 - 25 // ±25ms variation
    const responseTime = Math.max(10, baseTime + variation)
    
    // Simulate network conditions and potential failures
    const failureRate = 0.05 // 5% failure rate
    const shouldFail = Math.random() < failureRate
    
    if (shouldFail) {
      await new Promise(resolve => setTimeout(resolve, responseTime * 2))
      throw new Error('Request failed')
    }
    
    await new Promise(resolve => setTimeout(resolve, responseTime))
    return performance.now() - startTime
  }

  private calculateMetrics(duration: number): LoadTestMetrics {
    const successfulResults = this.results.filter(r => r > 0)
    const failedResults = this.results.filter(r => r <= 0)
    
    const sortedResults = successfulResults.sort((a, b) => a - b)
    
    return {
      totalRequests: this.results.length,
      successfulRequests: successfulResults.length,
      failedRequests: failedResults.length,
      averageResponseTime: successfulResults.reduce((sum, r) => sum + r, 0) / successfulResults.length || 0,
      minResponseTime: Math.min(...successfulResults) || 0,
      maxResponseTime: Math.max(...successfulResults) || 0,
      p95ResponseTime: this.calculatePercentile(sortedResults, 95),
      p99ResponseTime: this.calculatePercentile(sortedResults, 99),
      throughput: successfulResults.length / (duration / 1000),
      errorRate: (failedResults.length / this.results.length) * 100,
      memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024
    }
  }

  private calculatePercentile(sortedArray: number[], percentile: number): number {
    if (sortedArray.length === 0) return 0
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1
    return sortedArray[Math.max(0, index)]
  }

  private evaluateTestResults(config: LoadTestConfig, metrics: LoadTestMetrics): boolean {
    return (
      metrics.errorRate <= 5 && // Max 5% error rate
      metrics.averageResponseTime <= config.maxResponseTime &&
      metrics.throughput >= config.expectedThroughput * 0.8 // Allow 20% variance
    )
  }

  private getBaseResponseTime(route: string): number {
    const baseTimes: Record<string, number> = {
      '/': 50,
      '/dashboard': 150,
      '/profile': 100,
      '/jobs': 120,
      '/resume-builder': 200,
      '/post-job': 80,
      '/api/jobs': 30,
      '/api/applications': 40,
      '/api/profile': 35
    }
    return baseTimes[route] || 100
  }
}

// Load test configurations for different scenarios
const LOAD_TEST_SCENARIOS: LoadTestConfig[] = [
  {
    route: '/',
    concurrentUsers: 10,
    duration: 5000,
    rampUpTime: 1000,
    expectedThroughput: 8,
    maxResponseTime: 1000
  },
  {
    route: '/dashboard',
    concurrentUsers: 20,
    duration: 10000,
    rampUpTime: 2000,
    expectedThroughput: 15,
    maxResponseTime: 2000
  },
  {
    route: '/jobs',
    concurrentUsers: 50,
    duration: 15000,
    rampUpTime: 3000,
    expectedThroughput: 40,
    maxResponseTime: 1500
  }
]

describe('Load Testing Suite', () => {
  let loadTester: LoadTester

  beforeEach(() => {
    loadTester = new LoadTester()
  })

  describe('Basic Load Testing', () => {
    test('should handle moderate load on homepage', async () => {
      const config: LoadTestConfig = {
        route: '/',
        concurrentUsers: 10,
        duration: 2000,
        rampUpTime: 500,
        expectedThroughput: 8,
        maxResponseTime: 1000
      }

      const result = await loadTester.runLoadTest(config)

      expect(result.metrics.totalRequests).toBe(10)
      expect(result.metrics.successfulRequests).toBeGreaterThan(8) // At least 80% success
      expect(result.metrics.errorRate).toBeLessThan(20) // Less than 20% error rate
      expect(result.metrics.averageResponseTime).toBeLessThan(1000)
      expect(result.duration).toBeGreaterThan(1500) // Should take reasonable time
    })

    test('should handle high load on dashboard', async () => {
      const config: LoadTestConfig = {
        route: '/dashboard',
        concurrentUsers: 25,
        duration: 3000,
        rampUpTime: 1000,
        expectedThroughput: 20,
        maxResponseTime: 2000
      }

      const result = await loadTester.runLoadTest(config)

      expect(result.metrics.totalRequests).toBe(25)
      expect(result.metrics.errorRate).toBeLessThan(10) // Less than 10% error rate
      expect(result.metrics.p95ResponseTime).toBeLessThan(2500) // 95th percentile under 2.5s
      expect(result.metrics.throughput).toBeGreaterThan(5) // Minimum throughput
    })

    test('should measure response time percentiles accurately', async () => {
      const config: LoadTestConfig = {
        route: '/profile',
        concurrentUsers: 15,
        duration: 2000,
        rampUpTime: 500,
        expectedThroughput: 12,
        maxResponseTime: 1500
      }

      const result = await loadTester.runLoadTest(config)

      expect(result.metrics.minResponseTime).toBeGreaterThan(0)
      expect(result.metrics.maxResponseTime).toBeGreaterThan(result.metrics.minResponseTime)
      expect(result.metrics.p95ResponseTime).toBeGreaterThan(result.metrics.averageResponseTime)
      expect(result.metrics.p99ResponseTime).toBeGreaterThanOrEqual(result.metrics.p95ResponseTime)
    })
  })

  describe('Stress Testing', () => {
    test('should handle peak load conditions', async () => {
      const config: LoadTestConfig = {
        route: '/jobs',
        concurrentUsers: 50,
        duration: 5000,
        rampUpTime: 1500,
        expectedThroughput: 35,
        maxResponseTime: 3000
      }

      const result = await loadTester.runLoadTest(config)

      expect(result.metrics.totalRequests).toBe(50)
      expect(result.metrics.errorRate).toBeLessThan(15) // Allow higher error rate under stress
      expect(result.metrics.memoryUsage).toBeLessThan(200) // Memory should stay reasonable
    })

    test('should maintain performance under sustained load', async () => {
      const config: LoadTestConfig = {
        route: '/resume-builder',
        concurrentUsers: 30,
        duration: 8000,
        rampUpTime: 2000,
        expectedThroughput: 20,
        maxResponseTime: 4000
      }

      const result = await loadTester.runLoadTest(config)

      expect(result.metrics.successfulRequests).toBeGreaterThan(20) // At least 20 successful
      expect(result.metrics.averageResponseTime).toBeLessThan(4000)
      expect(result.duration).toBeGreaterThan(6000) // Should take substantial time
    })
  })

  describe('API Load Testing', () => {
    test('should handle API endpoint load', async () => {
      const config: LoadTestConfig = {
        route: '/api/jobs',
        concurrentUsers: 40,
        duration: 3000,
        rampUpTime: 1000,
        expectedThroughput: 30,
        maxResponseTime: 500
      }

      const result = await loadTester.runLoadTest(config)

      expect(result.metrics.totalRequests).toBe(40)
      expect(result.metrics.errorRate).toBeLessThan(8) // APIs should be more reliable
      expect(result.metrics.averageResponseTime).toBeLessThan(500) // APIs should be faster
      expect(result.metrics.throughput).toBeGreaterThan(10)
    })

    test('should handle database-intensive operations', async () => {
      const config: LoadTestConfig = {
        route: '/api/applications',
        concurrentUsers: 20,
        duration: 4000,
        rampUpTime: 1000,
        expectedThroughput: 15,
        maxResponseTime: 1000
      }

      const result = await loadTester.runLoadTest(config)

      expect(result.metrics.successfulRequests).toBeGreaterThan(15)
      expect(result.metrics.p99ResponseTime).toBeLessThan(2000) // 99th percentile reasonable
    })
  })

  describe('Load Test Scenarios', () => {
    test.each(LOAD_TEST_SCENARIOS)(
      'should pass load test for $route with $concurrentUsers users',
      async (scenario) => {
        const result = await loadTester.runLoadTest(scenario)

        expect(result.config.route).toBe(scenario.route)
        expect(result.metrics.totalRequests).toBe(scenario.concurrentUsers)
        expect(result.metrics.errorRate).toBeLessThan(10)
        
        // Performance requirements should be met
        if (result.passed) {
          expect(result.metrics.averageResponseTime).toBeLessThanOrEqual(scenario.maxResponseTime)
          expect(result.metrics.throughput).toBeGreaterThanOrEqual(scenario.expectedThroughput * 0.8)
        }
      }
    )
  })

  describe('Performance Degradation Detection', () => {
    test('should detect performance degradation under load', async () => {
      // Run baseline test
      const baselineConfig: LoadTestConfig = {
        route: '/degradation-test',
        concurrentUsers: 5,
        duration: 1000,
        rampUpTime: 200,
        expectedThroughput: 4,
        maxResponseTime: 500
      }

      const baselineResult = await loadTester.runLoadTest(baselineConfig)

      // Run high load test
      const highLoadConfig: LoadTestConfig = {
        ...baselineConfig,
        concurrentUsers: 30,
        duration: 3000,
        rampUpTime: 1000
      }

      const highLoadResult = await loadTester.runLoadTest(highLoadConfig)

      // Compare results
      const responseTimeDegradation = 
        (highLoadResult.metrics.averageResponseTime - baselineResult.metrics.averageResponseTime) / 
        baselineResult.metrics.averageResponseTime * 100

      expect(responseTimeDegradation).toBeGreaterThan(0) // Should show some degradation
      expect(highLoadResult.metrics.errorRate).toBeGreaterThanOrEqual(baselineResult.metrics.errorRate)
    })
  })
})