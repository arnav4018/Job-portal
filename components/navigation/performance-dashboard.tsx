'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  RefreshCw,
  Download,
  Zap
} from 'lucide-react'
import { useNavigationPerformance } from '@/lib/navigation-performance'

interface PerformanceReport {
  totalNavigations: number
  averageLoadTime: number
  slowRoutes: string[]
  recentMetrics: any[]
  cacheSize: number
  preloadedRoutes: string[]
  connectionType: string
  timestamp: string
}

export function PerformanceDashboard() {
  const { generateReport, getMetrics, getAverageLoadTime } = useNavigationPerformance()
  const [report, setReport] = useState<PerformanceReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const refreshReport = async () => {
    setIsLoading(true)
    try {
      const newReport = generateReport()
      setReport(newReport)
    } catch (error) {
      console.error('Failed to generate performance report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshReport()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshReport, 30000)
    return () => clearInterval(interval)
  }, [])

  const downloadReport = () => {
    if (!report) return

    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `navigation-performance-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  const getPerformanceScore = (avgLoadTime: number): { score: number; color: string; label: string } => {
    if (avgLoadTime < 1000) {
      return { score: 95, color: 'text-green-600', label: 'Excellent' }
    } else if (avgLoadTime < 2000) {
      return { score: 80, color: 'text-blue-600', label: 'Good' }
    } else if (avgLoadTime < 3000) {
      return { score: 60, color: 'text-yellow-600', label: 'Fair' }
    } else {
      return { score: 30, color: 'text-red-600', label: 'Poor' }
    }
  }

  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Navigation Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading performance data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const performanceScore = getPerformanceScore(report.averageLoadTime)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Navigation Performance Dashboard</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshReport}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              <span className={performanceScore.color}>{performanceScore.score}</span>
              <span className="text-sm text-muted-foreground ml-1">/ 100</span>
            </div>
            <Progress value={performanceScore.score} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              {performanceScore.label} performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report.averageLoadTime}
              <span className="text-sm text-muted-foreground ml-1">ms</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Across {report.totalNavigations} navigations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report.cacheSize}
              <span className="text-sm text-muted-foreground ml-1">routes</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {report.preloadedRoutes.length} preloaded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connection</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {report.connectionType}
            </div>
            <p className="text-xs text-muted-foreground">
              Network type
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Slow Routes Alert */}
      {report.slowRoutes.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Slow Routes Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 mb-3">
              The following routes are performing below optimal thresholds:
            </p>
            <div className="flex flex-wrap gap-2">
              {report.slowRoutes.map((route) => (
                <Badge key={route} variant="outline" className="text-yellow-700 border-yellow-300">
                  {route}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Navigation Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {report.recentMetrics.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent navigation data available.</p>
            ) : (
              report.recentMetrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{metric.route}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${
                      metric.loadTime > 3000 ? 'text-red-600' : 
                      metric.loadTime > 1000 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {Math.round(metric.loadTime)}ms
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preloaded Routes */}
      <Card>
        <CardHeader>
          <CardTitle>Preloaded Routes</CardTitle>
        </CardHeader>
        <CardContent>
          {report.preloadedRoutes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No routes have been preloaded yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {report.preloadedRoutes.map((route) => (
                <Badge key={route} variant="secondary">
                  {route}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Report Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Generated:</span>
              <span className="ml-2 text-muted-foreground">
                {new Date(report.timestamp).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="font-medium">Total Navigations:</span>
              <span className="ml-2 text-muted-foreground">
                {report.totalNavigations}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}