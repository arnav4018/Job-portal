'use client'

import { Component, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { AlertTriangle, RefreshCw, Home, FileText, ArrowLeft, LogIn } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  resumeId?: string
  fallbackComponent?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: any
  retryCount: number
}

export default class ResumeErrorBoundary extends Component<Props, State> {
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
    console.error('Resume builder error:', error, errorInfo)
    
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
      resumeId: this.props.resumeId,
      type: 'resume_builder_error',
      retryCount: this.state.retryCount,
    }
    
    console.error('Resume Error Logged:', errorData)
    
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
      window.location.href = '/resume-builder'
    }
  }

  getErrorType = (error: Error) => {
    const message = error.message.toLowerCase()
    
    if (message.includes('not found') || message.includes('404')) {
      return 'not_found'
    }
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('session')) {
      return 'auth'
    }
    if (message.includes('permission') || message.includes('access') || message.includes('role')) {
      return 'permission'
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'network'
    }
    if (message.includes('timeout')) {
      return 'timeout'
    }
    if (message.includes('database') || message.includes('prisma')) {
      return 'database'
    }
    if (message.includes('save') || message.includes('update')) {
      return 'save_error'
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
      let description = 'An error occurred in the resume builder. Please try again.'
      let showSignIn = false
      let showResumeList = false
      
      switch (errorType) {
        case 'not_found':
          title = 'Resume Not Found'
          description = 'This resume doesn\'t exist or you don\'t have permission to access it.'
          showResumeList = true
          break
        case 'auth':
          title = 'Authentication Required'
          description = 'You need to sign in to access the resume builder.'
          showSignIn = true
          break
        case 'permission':
          title = 'Access Denied'
          description = 'Only candidates can access the resume builder.'
          break
        case 'network':
          title = 'Connection Error'
          description = 'Unable to connect to the resume service. Please check your internet connection.'
          break
        case 'timeout':
          title = 'Loading Timeout'
          description = 'The resume builder is taking too long to load. Please try again.'
          break
        case 'database':
          title = 'Service Unavailable'
          description = 'The resume service is temporarily unavailable. Please try again in a moment.'
          break
        case 'save_error':
          title = 'Save Failed'
          description = 'Unable to save your resume changes. Your work may be lost.'
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
                  
                  {showResumeList && (
                    <LinkButton variant="outline" href="/resume-builder" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      My Resumes
                    </LinkButton>
                  )}
                  
                  {showSignIn && (
                    <LinkButton variant="outline" href={`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`} className="w-full">
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </LinkButton>
                  )}
                  
                  <LinkButton variant="outline" href="/dashboard" className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </LinkButton>
                </div>
                
                {!canRetry && (
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Maximum retry attempts reached.</p>
                    <p>Please contact support if the problem persists.</p>
                  </div>
                )}
                
                {errorType === 'save_error' && (
                  <div className="text-center text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
                    <p className="font-medium">⚠️ Unsaved Changes</p>
                    <p>Your recent changes may not have been saved. Please try refreshing and re-entering your data.</p>
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
export function withResumeErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<Props, 'children'> = {}
) {
  return function WrappedComponent(props: P) {
    return (
      <ResumeErrorBoundary {...options}>
        <Component {...props} />
      </ResumeErrorBoundary>
    )
  }
}