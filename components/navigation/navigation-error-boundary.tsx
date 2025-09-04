'use client'

import { Component, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { AlertTriangle, RefreshCw, Home, ArrowLeft, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { getNavigationMonitor } from '@/lib/navigation-performance'

interface Props {
  children: ReactNode
  fallbackComponent?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
  enableRetry?: boolean
  maxRetries?: number
  enablePerformanceLogging?: boolean
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: any
  retryCount: number
  errorId: string
}

export default class NavigationErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null
  private maxRetries: number

  constructor(props: Props) {
    super(props)
    this.maxRetries = props.maxRetries || 3
    this.state = { 
      hasError: false,
      retryCount: 0,
      errorId: ''
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `nav_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Navigation error boundary triggered:', error, errorInfo)
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
    
    // Log error to monitoring service and performance monitor
    this.logError(error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  logError = (error: Error, errorInfo: any) => {
    const errorData = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      type: 'navigation_error',
      retryCount: this.state.retryCount,
      route: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
    }
    
    console.error('Navigation Error Logged:', errorData)
    
    // Log to performance monitor if enabled
    if (this.props.enablePerformanceLogging && typeof window !== 'undefined') {
      try {
        const monitor = getNavigationMonitor()
        monitor.recordMetric({
          route: window.location.pathname,
          loadTime: -1, // Indicate error
          renderTime: -1,
          timestamp: new Date(),
          userAgent: navigator.userAgent
        })
      } catch (monitorError) {
        console.warn('Failed to log to performance monitor:', monitorError)
      }
    }
    
    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to monitoring service
      // errorMonitoringService.captureException(error, errorData)
    }
  }

  handleRetry = () => {
    if (!this.props.enableRetry || this.state.retryCount >= this.maxRetries) {
      return
    }

    this.setState(prevState => ({ 
      retryCount: prevState.retryCount + 1 
    }))

    // Add exponential backoff delay
    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 5000)
    
    this.retryTimeout = setTimeout(() => {
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined 
      })
      
      // Attempt to reload the page
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }, delay)
  }

  handleGoBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        window.location.href = '/'
      }
    }
  }

  handleResetApp = () => {
    if (typeof window !== 'undefined') {
      // Clear any cached data that might be causing issues
      try {
        localStorage.removeItem('navigation_cache')
        localStorage.removeItem('route_cache')
        localStorage.removeItem('navigation_metrics')
        sessionStorage.clear()
      } catch (error) {
        console.warn('Failed to clear storage:', error)
      }
      
      // Navigate to home page
      window.location.href = '/'
    }
  }

  getErrorType = (error: Error) => {
    const message = error.message.toLowerCase()
    
    if (message.includes('chunk') || message.includes('loading')) {
      return 'chunk_load_error'
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'network_error'
    }
    if (message.includes('timeout')) {
      return 'timeout_error'
    }
    if (message.includes('auth') || message.includes('unauthorized')) {
      return 'auth_error'
    }
    if (message.includes('not found') || message.includes('404')) {
      return 'not_found_error'
    }
    if (message.includes('permission') || message.includes('access')) {
      return 'permission_error'
    }
    
    return 'unknown_error'
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent
      }

      const errorType = this.getErrorType(this.state.error!)
      const canRetry = this.props.enableRetry !== false && this.state.retryCount < this.maxRetries
      
      let title = 'Something went wrong'
      let description = 'An unexpected error occurred. Please try again.'
      let showSpecialActions = false
      
      switch (errorType) {
        case 'chunk_load_error':
          title = 'Loading Error'
          description = 'Failed to load application resources. This might be due to a network issue or an app update.'
          showSpecialActions = true
          break
        case 'network_error':
          title = 'Connection Error'
          description = 'Unable to connect to the server. Please check your internet connection.'
          break
        case 'timeout_error':
          title = 'Request Timeout'
          description = 'The request took too long to complete. Please try again.'
          break
        case 'auth_error':
          title = 'Authentication Error'
          description = 'There was a problem with your authentication. Please sign in again.'
          break
        case 'not_found_error':
          title = 'Page Not Found'
          description = 'The page you\'re looking for doesn\'t exist or has been moved.'
          break
        case 'permission_error':
          title = 'Access Denied'
          description = 'You don\'t have permission to access this resource.'
          break
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground">
                {description}
              </p>
              
              {this.state.retryCount > 0 && canRetry && (
                <div className="text-center text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                  <p>Retry attempt {this.state.retryCount} of {this.maxRetries}</p>
                  <p>Next retry in {Math.min(1000 * Math.pow(2, this.state.retryCount), 5000) / 1000}s</p>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                {canRetry && (
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleGoBack}
                  variant="outline" 
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
                
                {showSpecialActions && (
                  <Button 
                    onClick={this.handleResetApp}
                    variant="outline" 
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset App
                  </Button>
                )}
                
                {errorType === 'auth_error' && (
                  <LinkButton variant="outline"  className="w-full" href="/auth/signin">Sign In Again</LinkButton>
                )}
                
                <LinkButton variant="outline" href="/" className="w-full">
                  <Home className="w-4 w-4 mr-2" />
                  Go Home
                </LinkButton>
              </div>
              
              {!canRetry && this.props.enableRetry !== false && (
                <div className="text-center text-sm text-muted-foreground">
                  <p>Maximum retry attempts reached.</p>
                  <p>Please refresh the page or contact support if the problem persists.</p>
                </div>
              )}
              
              <div className="text-center text-xs text-muted-foreground">
                <p>Error ID: {this.state.errorId}</p>
                <p>Time: {new Date().toLocaleString()}</p>
              </div>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-gray-100 rounded text-sm">
                  <summary className="cursor-pointer font-medium">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap text-xs">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                    {this.state.errorInfo?.componentStack && (
                      '\n\nComponent Stack:' + this.state.errorInfo.componentStack
                    )}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for easier usage
export function withNavigationErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<Props, 'children'> = {}
) {
  return function WrappedComponent(props: P) {
    return (
      <NavigationErrorBoundary {...options}>
        <Component {...props} />
      </NavigationErrorBoundary>
    )
  }
}