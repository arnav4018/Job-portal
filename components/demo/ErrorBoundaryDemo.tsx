'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  PageErrorBoundary,
  FormErrorBoundary,
  DataErrorBoundary,
  NetworkErrorBoundary,
  ProfileErrorBoundary,
  ChartErrorBoundary,
  TableErrorBoundary,
  ModalErrorBoundary,
  AsyncErrorBoundary
} from '@/components/error-boundary/SpecializedErrorBoundaries'
import { useErrorRecovery, useComponentErrorRecovery, useAsyncErrorRecovery } from '@/hooks/use-error-recovery'
import { useErrorReporting } from '@/lib/error-reporting'
import { AlertTriangle, Bug, RefreshCw, Zap, Database, Wifi, User } from 'lucide-react'

// Components that intentionally throw errors for demo purposes
const ErrorThrowingComponent: React.FC<{ errorType: string }> = ({ errorType }) => {
  React.useEffect(() => {
    if (errorType === 'render') {
      throw new Error('Render error: Component failed to render properly')
    }
  }, [errorType])

  if (errorType === 'immediate') {
    throw new Error('Immediate error: This component always fails')
  }

  if (errorType === 'network') {
    throw new Error('Network error: Failed to fetch data from server')
  }

  if (errorType === 'data') {
    throw new Error('Data error: Invalid data format received')
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded">
      <p className="text-green-800">✅ Component loaded successfully!</p>
    </div>
  )
}

const AsyncErrorComponent: React.FC<{ shouldFail: boolean }> = ({ shouldFail }) => {
  const [data, setData] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (shouldFail) {
      throw new Error('Async operation failed: Server returned 500 error')
    }
    
    return 'Data loaded successfully!'
  }

  const { data: asyncData, isLoading, execute, hasError, error, recover, canRetry } = useAsyncErrorRecovery(fetchData)

  React.useEffect(() => {
    execute()
  }, [execute])

  if (hasError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800 mb-2">❌ Async Error: {error?.message}</p>
        {canRetry && (
          <Button onClick={recover} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-blue-800">🔄 Loading async data...</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded">
      <p className="text-green-800">✅ {asyncData}</p>
    </div>
  )
}

const RecoveryDemoComponent: React.FC = () => {
  const [shouldError, setShouldError] = useState(false)
  const { retryKey, retryComponent, hasError, error, canRetry } = useComponentErrorRecovery('RecoveryDemo')

  React.useEffect(() => {
    if (shouldError) {
      throw new Error('Recovery demo error: This component needs recovery')
    }
  }, [shouldError, retryKey])

  if (hasError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-800 mb-2">❌ Component Error: {error?.message}</p>
        {canRetry && (
          <Button onClick={retryComponent} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Recover Component
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-50 border border-green-200 rounded">
        <p className="text-green-800">✅ Component is working normally</p>
      </div>
      <Button
        onClick={() => setShouldError(true)}
        variant="destructive"
        size="sm"
      >
        Trigger Error
      </Button>
    </div>
  )
}

export default function ErrorBoundaryDemo() {
  const [activeErrorType, setActiveErrorType] = useState<string | null>(null)
  const [showAsyncError, setShowAsyncError] = useState(false)
  const { reportError, reportCustomError, getMetrics } = useErrorReporting()
  const metrics = getMetrics()

  const triggerError = (errorType: string) => {
    setActiveErrorType(errorType)
    setTimeout(() => setActiveErrorType(null), 100) // Reset after triggering
  }

  const triggerCustomError = () => {
    reportCustomError('Custom error triggered from demo', {
      category: 'javascript',
      severity: 'low',
      additionalContext: { source: 'demo', timestamp: Date.now() }
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Error Boundary System Demo</h1>
          <p className="text-gray-600">Comprehensive error handling, recovery, and reporting</p>
        </div>
        <Badge variant="secondary">Production Ready</Badge>
      </div>

      {/* Error Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bug className="w-5 h-5" />
            <span>Error Metrics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.totalErrors}</div>
              <div className="text-sm text-gray-600">Total Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(metrics.errorsByCategory).length}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.keys(metrics.errorsByComponent).length}
              </div>
              <div className="text-sm text-gray-600">Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.recentErrors.length}
              </div>
              <div className="text-sm text-gray-600">Recent</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="boundaries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="boundaries">Error Boundaries</TabsTrigger>
          <TabsTrigger value="recovery">Error Recovery</TabsTrigger>
          <TabsTrigger value="reporting">Error Reporting</TabsTrigger>
          <TabsTrigger value="specialized">Specialized</TabsTrigger>
        </TabsList>

        {/* Error Boundaries Demo */}
        <TabsContent value="boundaries" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Error Boundary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => triggerError('immediate')}
                    variant="destructive"
                    size="sm"
                  >
                    Immediate Error
                  </Button>
                  <Button
                    onClick={() => triggerError('render')}
                    variant="destructive"
                    size="sm"
                  >
                    Render Error
                  </Button>
                  <Button
                    onClick={() => triggerError('network')}
                    variant="destructive"
                    size="sm"
                  >
                    Network Error
                  </Button>
                </div>

                <FormErrorBoundary formName="Demo Form">
                  {activeErrorType ? (
                    <ErrorThrowingComponent errorType={activeErrorType} />
                  ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-800">✅ No errors - component is healthy</p>
                    </div>
                  )}
                </FormErrorBoundary>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Error Boundary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => triggerError('data')}
                  variant="destructive"
                  size="sm"
                >
                  <Database className="w-4 h-4 mr-2" />
                  Trigger Data Error
                </Button>

                <DataErrorBoundary
                  dataType="user profiles"
                  onRetry={() => console.log('Retrying data load...')}
                >
                  {activeErrorType === 'data' ? (
                    <ErrorThrowingComponent errorType="data" />
                  ) : (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-blue-800">📊 Data loaded successfully</p>
                    </div>
                  )}
                </DataErrorBoundary>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Network Error Boundary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => triggerError('network')}
                  variant="destructive"
                  size="sm"
                >
                  <Wifi className="w-4 h-4 mr-2" />
                  Trigger Network Error
                </Button>

                <NetworkErrorBoundary onNetworkError={() => console.log('Network error detected')}>
                  {activeErrorType === 'network' ? (
                    <ErrorThrowingComponent errorType="network" />
                  ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-800">🌐 Network connection is stable</p>
                    </div>
                  )}
                </NetworkErrorBoundary>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Error Boundary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => triggerError('profile')}
                  variant="destructive"
                  size="sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  Trigger Profile Error
                </Button>

                <ProfileErrorBoundary userId="demo-user">
                  {activeErrorType === 'profile' ? (
                    <ErrorThrowingComponent errorType="immediate" />
                  ) : (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded">
                      <p className="text-purple-800">👤 User profile loaded</p>
                    </div>
                  )}
                </ProfileErrorBoundary>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Error Recovery Demo */}
        <TabsContent value="recovery" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Component Recovery</CardTitle>
              </CardHeader>
              <CardContent>
                <RecoveryDemoComponent />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Async Error Recovery</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setShowAsyncError(false)}
                    variant={!showAsyncError ? "default" : "outline"}
                    size="sm"
                  >
                    Success Mode
                  </Button>
                  <Button
                    onClick={() => setShowAsyncError(true)}
                    variant={showAsyncError ? "destructive" : "outline"}
                    size="sm"
                  >
                    Error Mode
                  </Button>
                </div>

                <AsyncErrorBoundary>
                  <AsyncErrorComponent shouldFail={showAsyncError} />
                </AsyncErrorBoundary>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error recovery includes automatic retries, exponential backoff, and multiple recovery strategies
              like cache clearing, network retry, and page reload.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Error Reporting Demo */}
        <TabsContent value="reporting" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Manual Error Reporting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={triggerCustomError} variant="outline">
                  <Bug className="w-4 h-4 mr-2" />
                  Report Custom Error
                </Button>

                <Button
                  onClick={() => {
                    try {
                      throw new Error('Test error for reporting')
                    } catch (error) {
                      reportError(error as Error, { source: 'manual-test' })
                    }
                  }}
                  variant="outline"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Report Caught Error
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Error Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(metrics.errorsByCategory).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="capitalize">{category}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                  {Object.keys(metrics.errorsByCategory).length === 0 && (
                    <p className="text-gray-500 text-sm">No errors reported yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.recentErrors.slice(0, 5).map((error, index) => (
                  <div key={error.errorId} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">{error.message}</span>
                      <Badge variant={
                        error.severity === 'critical' ? 'destructive' :
                          error.severity === 'high' ? 'destructive' :
                            error.severity === 'medium' ? 'secondary' : 'outline'
                      }>
                        {error.severity}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Category: {error.category}</div>
                      <div>Component: {error.componentName || 'Unknown'}</div>
                      <div>Time: {new Date(error.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
                {metrics.recentErrors.length === 0 && (
                  <p className="text-gray-500 text-sm">No recent errors</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Specialized Boundaries */}
        <TabsContent value="specialized" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Chart Error Boundary</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartErrorBoundary chartType="line">
                  <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded flex items-center justify-center">
                    <p className="text-gray-700">📈 Chart rendered successfully</p>
                  </div>
                </ChartErrorBoundary>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Table Error Boundary</CardTitle>
              </CardHeader>
              <CardContent>
                <TableErrorBoundary tableName="user data">
                  <div className="border rounded">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-2 text-left">Name</th>
                          <th className="p-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2">Demo User</td>
                          <td className="p-2">✅ Active</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TableErrorBoundary>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Specialized error boundaries provide context-specific error handling and recovery options
              tailored to different component types and use cases.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}