'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Bug, Home, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  retryCount: number
  showDetails: boolean
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void
  enableRetry?: boolean
  maxRetries?: number
  level?: 'page' | 'section' | 'component'
  componentName?: string
  showErrorDetails?: boolean
  enableErrorReporting?: boolean
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null

  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      showDetails: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, enableErrorReporting = true } = this.props
    const { errorId } = this.state

    this.setState({ errorInfo })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary Caught Error (${errorId})`)
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }

    // Report error to external service
    if (enableErrorReporting) {
      this.reportError(error, errorInfo, errorId)
    }

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo, errorId)
    }
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo, errorId: string) => {
    try {
      const errorReport = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        componentName: this.props.componentName,
        level: this.props.level || 'component',
        retryCount: this.state.retryCount
      }

      // In a real app, send to error reporting service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // })

      console.log('Error reported:', errorReport)
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props
    const { retryCount } = this.state

    if (retryCount >= maxRetries) {
      return
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      showDetails: false
    }))

    // Add a small delay to prevent immediate re-error
    this.retryTimeoutId = window.setTimeout(() => {
      // Force re-render
      this.forceUpdate()
    }, 100)
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }))
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  render() {
    const { 
      children, 
      fallback, 
      enableRetry = true, 
      maxRetries = 3,
      level = 'component',
      componentName,
      showErrorDetails = process.env.NODE_ENV === 'development'
    } = this.props
    
    const { hasError, error, errorInfo, errorId, retryCount, showDetails } = this.state

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback
      }

      // Default error UI based on level
      return (
        <div className={cn(
          "flex items-center justify-center p-6",
          level === 'page' && "min-h-screen",
          level === 'section' && "min-h-[400px]",
          level === 'component' && "min-h-[200px]"
        )}>
          <Card className={cn(
            "w-full max-w-2xl",
            level === 'page' && "max-w-4xl"
          )}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <span>
                  {level === 'page' && 'Page Error'}
                  {level === 'section' && 'Section Error'}
                  {level === 'component' && 'Component Error'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-gray-700">
                  {level === 'page' && 'Something went wrong with this page.'}
                  {level === 'section' && 'This section encountered an error.'}
                  {level === 'component' && 'This component failed to load properly.'}
                </p>
                
                {componentName && (
                  <p className="text-sm text-gray-500">
                    Component: <code className="bg-gray-100 px-1 rounded">{componentName}</code>
                  </p>
                )}

                <p className="text-sm text-gray-500">
                  Error ID: <code className="bg-gray-100 px-1 rounded">{errorId}</code>
                </p>

                {retryCount > 0 && (
                  <p className="text-sm text-orange-600">
                    Retry attempts: {retryCount}/{maxRetries}
                  </p>
                )}
              </div>

              {/* Error Details (Development) */}
              {showErrorDetails && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={this.toggleDetails}
                    className="flex items-center space-x-2"
                  >
                    <Bug className="w-4 h-4" />
                    <span>Error Details</span>
                    {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>

                  {showDetails && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-2">Error Message:</h4>
                        <code className="text-sm text-red-600 bg-red-50 p-2 rounded block">
                          {error.message}
                        </code>
                      </div>

                      {error.stack && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Stack Trace:</h4>
                          <pre className="text-xs text-gray-600 bg-white p-2 rounded border overflow-auto max-h-40">
                            {error.stack}
                          </pre>
                        </div>
                      )}

                      {errorInfo?.componentStack && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Component Stack:</h4>
                          <pre className="text-xs text-gray-600 bg-white p-2 rounded border overflow-auto max-h-40">
                            {errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {enableRetry && retryCount < maxRetries && (
                  <Button onClick={this.handleRetry} className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                  </Button>
                )}

                {level === 'page' && (
                  <>
                    <Button onClick={this.handleReload} variant="outline" className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4" />
                      <span>Reload Page</span>
                    </Button>
                    
                    <Button onClick={this.handleGoHome} variant="outline" className="flex items-center space-x-2">
                      <Home className="w-4 h-4" />
                      <span>Go Home</span>
                    </Button>
                  </>
                )}

                {level !== 'page' && retryCount >= maxRetries && (
                  <Button onClick={this.handleReload} variant="outline" className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Reload Page</span>
                  </Button>
                )}
              </div>

              {/* Help Text */}
              <div className="text-sm text-gray-500 border-t pt-4">
                <p>
                  If this problem persists, please contact support with the error ID above.
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <p className="mt-1 text-blue-600">
                    Development mode: Check the console for more details.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return children
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WithErrorBoundaryComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  )

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithErrorBoundaryComponent
}

// Hook for programmatic error handling
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, errorInfo?: any) => {
    // This will be caught by the nearest error boundary
    throw error
  }, [])

  return handleError
}