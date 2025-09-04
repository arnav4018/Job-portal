'use client'

import { Component, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { AlertTriangle, RefreshCw, Home, LogIn } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallbackComponent?: ReactNode
  onError?: (error: Error, errorInfo: any) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

export default class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Authentication error:', error, errorInfo)
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
    
    // Log error to monitoring service
    this.logError(error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })
  }

  logError = (error: Error, errorInfo: any) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      type: 'authentication_error',
    }
    
    console.error('Auth Error Logged:', errorData)
    
    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      // errorMonitoringService.captureException(error, errorData)
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    window.location.reload()
  }

  handleSignIn = () => {
    const currentUrl = window.location.pathname + window.location.search
    window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(currentUrl)}`
  }

  getErrorType = (error: Error) => {
    const message = error.message.toLowerCase()
    
    if (message.includes('session') || message.includes('token') || message.includes('auth')) {
      return 'session'
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'network'
    }
    if (message.includes('timeout')) {
      return 'timeout'
    }
    if (message.includes('permission') || message.includes('access')) {
      return 'permission'
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
      
      let title = 'Authentication Error'
      let description = 'An error occurred with authentication. Please try again.'
      let showSignIn = false
      
      switch (errorType) {
        case 'session':
          title = 'Session Expired'
          description = 'Your session has expired. Please sign in again.'
          showSignIn = true
          break
        case 'network':
          title = 'Connection Error'
          description = 'Unable to connect to the authentication server. Please check your connection.'
          break
        case 'timeout':
          title = 'Request Timeout'
          description = 'The authentication request timed out. Please try again.'
          break
        case 'permission':
          title = 'Access Denied'
          description = 'You don\'t have permission to access this resource.'
          break
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
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
              
              <div className="flex flex-col gap-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                {showSignIn && (
                  <Button onClick={this.handleSignIn} variant="outline" className="w-full">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In Again
                  </Button>
                )}
                
                <LinkButton variant="outline" className="w-full" href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </LinkButton>
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
export function withAuthErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<Props, 'children'> = {}
) {
  return function WrappedComponent(props: P) {
    return (
      <AuthErrorBoundary {...options}>
        <Component {...props} />
      </AuthErrorBoundary>
    )
  }
}