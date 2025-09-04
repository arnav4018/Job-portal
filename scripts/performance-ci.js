#!/usr/bin/env node

/**
 * Performance Testing CI/CD Integration Script
 * Runs automated performance tests and generates reports for CI/CD pipeline
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

class PerformanceCIRunner {
  constructor() {
    this.resultsDir = path.join(process.cwd(), 'performance-results')
    this.reportFile = path.join(this.resultsDir, 'performance-report.json')
    this.htmlReportFile = path.join(this.resultsDir, 'performance-report.html')
    this.exitCode = 0
  }

  async run() {
    console.log('🚀 Starting Performance CI/CD Tests...')
    
    try {
      // Ensure results directory exists
      this.ensureResultsDirectory()
      
      // Run performance tests
      const testResults = await this.runPerformanceTests()
      
      // Generate reports
      await this.generateReports(testResults)
      
      // Evaluate results and set exit code
      this.evaluateResults(testResults)
      
      console.log(`✅ Performance tests completed with exit code: ${this.exitCode}`)
      process.exit(this.exitCode)
      
    } catch (error) {
      console.error('❌ Performance tests failed:', error.message)
      process.exit(1)
    }
  }

  ensureResultsDirectory() {
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true })
    }
  }

  async runPerformanceTests() {
    console.log('📊 Running performance test suite...')
    
    try {
      // Run Jest performance tests with JSON output
      const testCommand = 'npm test -- --testPathPattern=performance --json --outputFile=performance-test-results.json'
      execSync(testCommand, { stdio: 'inherit' })
      
      // Read test results
      const resultsPath = path.join(process.cwd(), 'performance-test-results.json')
      if (fs.existsSync(resultsPath)) {
        const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'))
        fs.unlinkSync(resultsPath) // Clean up
        return results
      }
      
      return { success: false, numFailedTests: 1, testResults: [] }
    } catch (error) {
      console.warn('⚠️  Performance tests encountered issues:', error.message)
      return { success: false, numFailedTests: 1, testResults: [] }
    }
  }

  async generateReports(testResults) {
    console.log('📝 Generating performance reports...')
    
    const report = {
      timestamp: new Date().toISOString(),
      success: testResults.success,
      totalTests: testResults.numTotalTests || 0,
      passedTests: testResults.numPassedTests || 0,
      failedTests: testResults.numFailedTests || 0,
      testResults: testResults.testResults || [],
      summary: this.generateSummary(testResults),
      recommendations: this.generateRecommendations(testResults)
    }
    
    // Write JSON report
    fs.writeFileSync(this.reportFile, JSON.stringify(report, null, 2))
    
    // Generate HTML report
    this.generateHTMLReport(report)
    
    console.log(`📄 Reports generated:`)
    console.log(`   JSON: ${this.reportFile}`)
    console.log(`   HTML: ${this.htmlReportFile}`)
  }

  generateSummary(testResults) {
    const total = testResults.numTotalTests || 0
    const passed = testResults.numPassedTests || 0
    const failed = testResults.numFailedTests || 0
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0'
    
    return {
      totalTests: total,
      passedTests: passed,
      failedTests: failed,
      successRate: `${successRate}%`,
      status: failed === 0 ? 'PASSED' : 'FAILED'
    }
  }
}  
generateRecommendations(testResults) {
    const recommendations = []
    
    if (testResults.numFailedTests > 0) {
      recommendations.push('❌ Some performance tests failed. Review failed test details.')
    }
    
    if (testResults.numFailedTests > testResults.numPassedTests) {
      recommendations.push('🔥 Critical: More tests failed than passed. Immediate attention required.')
    }
    
    if (testResults.numTotalTests === 0) {
      recommendations.push('⚠️  No performance tests were executed. Verify test configuration.')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ All performance tests passed. System performance is within acceptable limits.')
    }
    
    return recommendations
  }

  generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .status-passed { color: #28a745; }
        .status-failed { color: #dc3545; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; }
        .recommendations { background: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .test-results { margin-top: 20px; }
        .test-file { margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Performance Test Report</h1>
            <p class="timestamp">Generated: ${report.timestamp}</p>
            <h2 class="${report.summary.status === 'PASSED' ? 'status-passed' : 'status-failed'}">
                ${report.summary.status}
            </h2>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value">${report.summary.totalTests}</div>
                <div>Total Tests</div>
            </div>
            <div class="metric">
                <div class="metric-value status-passed">${report.summary.passedTests}</div>
                <div>Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value status-failed">${report.summary.failedTests}</div>
                <div>Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.successRate}</div>
                <div>Success Rate</div>
            </div>
        </div>
        
        <div class="recommendations">
            <h3>Recommendations</h3>
            <ul>
                ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        
        <div class="test-results">
            <h3>Test Results</h3>
            ${report.testResults.map(result => `
                <div class="test-file">
                    <h4>${result.testFilePath || 'Unknown Test File'}</h4>
                    <p>Status: <span class="${result.status === 'passed' ? 'status-passed' : 'status-failed'}">${result.status || 'unknown'}</span></p>
                    <p>Duration: ${result.perfStats?.runtime || 'N/A'}ms</p>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`
    
    fs.writeFileSync(this.htmlReportFile, html)
  }

  evaluateResults(testResults) {
    if (!testResults.success || testResults.numFailedTests > 0) {
      if (testResults.numFailedTests > testResults.numPassedTests) {
        this.exitCode = 2 // Critical failure
      } else {
        this.exitCode = 1 // Some failures
      }
    }
  }
}

// CLI execution
if (require.main === module) {
  const runner = new PerformanceCIRunner()
  runner.run().catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

module.exports = PerformanceCIRunner