'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PerformanceMetric {
  id: string
  name: string
  type: 'page-load' | 'component-render' | 'api-call' | 'database-query' | 'navigation'
  duration: number
  timestamp: string
  metadata?: Record<string, any>
}

interface PerformanceSummary {
  totalMetrics: number
  recentMetrics: number
  averageDurations: Record<string, number>
  slowestOperations: PerformanceMetric[]
  thresholdViolations: number
}

export function PerformanceDashboard() {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null)
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [selectedType, setSelectedType] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/performance/metrics')
      const data = await response.json()
      
      if (data.status === 'success') {
        setSummary(data.data)
      } else {
        setError(data.message || 'Failed to fetch performance summary')
      }
    } catch (err) {
      setError('Failed to fetch performance data')
      console.error('Performance fetch error:', err)
    }
  }

  const fetchMetrics = async (type?: string) => {
    try {
      const url = type && type !== 'all' 
        ? `/api/performance/metrics?type=${type}&limit=20`
        : '/api/performance/metrics?limit=20'
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.status === 'success') {
        setMetrics(Array.isArray(data.data) ? data.data : [])
      }
    } catch (err) {
      console.error('Failed to fetch metrics:', err)
    }
  }

  const clearMetrics = async () => {
    try {
      const response = await fetch('/api/performance/metrics', {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setSummary(null)
        setMetrics([])
        await fetchSummary()
      }
    } catch (err) {
      console.error('Failed to clear metrics:', err)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchSummary(),
        fetchMetrics(selectedType),
      ])
      setLoading(false)
    }

    loadData()
  }, [selectedType])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'page-load': return 'bg-blue-100 text-blue-800'
      case 'component-render': return 'bg-green-100 text-green-800'
      case 'api-call': return 'bg-yellow-100 text-yellow-800'
      case 'database-query': return 'bg-red-100 text-red-800'
      case 'navigation': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (duration: number) => {
    if (duration < 1000) {
      return `${duration.toFixed(2)}ms`
    }
    return `${(duration / 1000).toFixed(2)}s`
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-red-600">
              <h3 className="font-semibold">Error Loading Performance Data</h3>
              <p className="text-sm mt-1">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Performance Dashboard</h1>
        <Button onClick={clearMetrics} variant="outline">
          Clear Metrics
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalMetrics}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent (5min)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.recentMetrics}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Threshold Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {summary.thresholdViolations}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Page Load</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(summary.averageDurations['page-load'] || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Average Durations */}
      {summary && Object.keys(summary.averageDurations).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Average Durations by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(summary.averageDurations).map(([type, duration]) => (
                <div key={type} className="text-center">
                  <Badge className={getTypeColor(type)}>
                    {type.replace('-', ' ')}
                  </Badge>
                  <div className="text-lg font-semibold mt-1">
                    {formatDuration(duration)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metric Type Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'page-load', 'component-render', 'api-call', 'database-query', 'navigation'].map(type => (
          <Button
            key={type}
            variant={selectedType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType(type)}
          >
            {type === 'all' ? 'All Types' : type.replace('-', ' ')}
          </Button>
        ))}
      </div>

      {/* Slowest Operations */}
      {summary && summary.slowestOperations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Slowest Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.slowestOperations.slice(0, 10).map((metric) => (
                <div key={metric.id} className="flex justify-between items-center p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(metric.type)}>
                      {metric.type}
                    </Badge>
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatDuration(metric.duration)}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Metrics */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Recent Metrics 
              {selectedType !== 'all' && ` - ${selectedType.replace('-', ' ')}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.map((metric) => (
                <div key={metric.id} className="flex justify-between items-center p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(metric.type)}>
                      {metric.type}
                    </Badge>
                    <span className="font-medium">{metric.name}</span>
                    {metric.metadata?.success === false && (
                      <Badge variant="destructive">Failed</Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatDuration(metric.duration)}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(metric.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}