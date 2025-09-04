'use client'

import { Component, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import Link from 'next/link'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

export default class ProfileErrorBoundary extends Component<Props, State> {
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
    console.error('Profile page error:', error, errorInfo)
    
    // Log error to monitoring service
    this.logError(error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })
  }

  logError = (error: Error, errorInfo: any) => {
    // In a real app, send to error monitoring service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    }
    
    console.error('Profile Error Logged:', errorData)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      const isAuthError = this.state.error?.message?.includes('authentication') || 
                         this.state.error?.message?.includes('User not found')
      const isTimeoutError = this.state.error?.message?.includes('timeout')
      const isNetworkError = this.state.error?.message?.includes('fetch')

      return (
        <DashboardLayout>
          <div className="min-h-[60vh] flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">
                  {isAuthError ? 'Authentication Error' : 
                   isTimeoutError ? 'Loading Timeout' :
                   isNetworkError ? 'Network Error' : 
                   'Something went wrong'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground">
                  {isAuthError ? 
                    'There was a problem with your authentication. Please sign in again.' :
                   isTimeoutError ?
                    'The page took too long to load. Please try again.' :
                   isNetworkError ?
                    'Unable to connect to the server. Please check your connection.' :
                    'An unexpected error occurred while loading your profile.'}
                </p>
                
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={this.handleRetry}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  
                  {isAuthError ? (
                    <LinkButton 
                      variant="outline" 
                      
                      className="w-full"
                     href="/auth/signin?callbackUrl=/profile">Sign In Again</LinkButton>
                  ) : (
                    <LinkButton 
                      variant="outline" 
                      className="w-full"
                      href="/dashboard"
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </LinkButton>
                  )}
                </div>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 p-3 bg-gray-100 rounded text-sm">
                    <summary className="cursor-pointer font-medium">
                      Error Details (Development)
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap text-xs">
                      {this.state.error.message}
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      )
    }

    return this.props.children
  }
}