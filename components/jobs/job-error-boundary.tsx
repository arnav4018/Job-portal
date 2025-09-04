'use client'

import { Component, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { AlertTriangle, RefreshCw, Home, Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  jobId?: string
  fallbackComponent?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: any
  retryCount: number
}

export default class JobErrorBoundary extends Component<Props, State> {
  private maxRetries = 3
  private retryTimeout: NodeJS.Timeout | null = null

  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Job page error:', error, errorInfo)
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
    
    // Log error to monitoring service
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
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      jobId: this.props.jobId,
      type: 'job_page_error',
      retryCount: this.state.retryCount,
    }
    
    console.error('Job Error Logged:', errorData)
    
    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to monitoring service
      // errorMonitoringService.captureException(error, errorData)
    }
  }

  handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      return
    }

    this.setState(prevState => ({ 
      retryCount: prevState.retryCount + 1 
    }))

    // Add delay before retry to prevent rapid retries
    this.retryTimeout = setTimeout(() => {
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined 
      })
      window.location.reload()
    }, 1000)
  }

  handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/jobs'
    }
  }

  getErrorType = (error: Error) => {
    const message = error.message.toLowerCase()
    
    if (message.includes('not found') || message.includes('404')) {
      return 'not_found'
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'network'
    }
    if (message.includes('timeout')) {
      return 'timeout'
    }
    if (message.includes('auth') || message.includes('unauthorized')) {
      return 'auth'
    }
    if (message.includes('database') || message.includes('prisma')) {
      return 'database'
    }
    
    return 'unknown'
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallbackComponent) {
        return this.props.fallbackComponent
      }

      const errorType = this.getErrorType(this.state.error!)
      const canRetry = this.state.retryCount < this.maxRetries
      
      let title = 'Something went wrong'
      let description = 'An error occurred while loading this job. Please try again.'
      let showJobSearch = false
      
      switch (errorType) {
        case 'not_found':
          title = 'Job Not Found'
          description = 'This job posting may have been removed or the link is invalid.'
          showJobSearch = true
          break
        case 'network':
          title = 'Connection Error'
          description = 'Unable to load job details. Please check your internet connection.'
          break
        case 'timeout':
          title = 'Loading Timeout'
          description = 'The job details are taking too long to load. Please try again.'
          break
        case 'auth':
          title = 'Access Required'
          description = 'You need to sign in to view this job posting.'
          break
        case 'database':
          title = 'Service Unavailable'
          description = 'Our job database is temporarily unavailable. Please try again in a moment.'
          break
      }

      return (
        <div className="container mx-auto px-4 py-8">
          <div className="min-h-[60vh] flex items-center justify-center">
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
                
                {this.state.retryCount > 0 && (
                  <p className="text-center text-sm text-muted-foreground">
                    Retry attempt {this.state.retryCount} of {this.maxRetries}
                  </p>
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
                  
                  {showJobSearch && (
                    <LinkButton variant="outline" href="/jobs" className="w-full">
                      <Search className="w-4 h-4 mr-2" />
                      Browse Jobs
                    </LinkButton>
                  )}
                  
                  {errorType === 'auth' && (
                    <LinkButton variant="outline" href={`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`} className="w-full">
                      Sign In
                    </LinkButton>
                  )}
                  
                  <LinkButton variant="outline" href="/" className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </LinkButton>
                </div>
                
                {!canRetry && (
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Maximum retry attempts reached.</p>
                    <p>Please contact support if the problem persists.</p>
                  </div>
                )}
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 p-3 bg-gray-100 rounded text-sm">
                    <summary className="cursor-pointer font-medium">
                      Error Details (Development)
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap text-xs">
                      {this.state.error.message}
                      {'\n\n'}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for easier usage
export function withJobErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<Props, 'children'> = {}
) {
  return function WrappedComponent(props: P) {
    return (
      <JobErrorBoundary {...options}>
        <Component {...props} />
      </JobErrorBoundary>
    )
  }
}