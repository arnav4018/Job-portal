'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { AlertTriangle, RefreshCw, Home, LogIn } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ResumeBuilderError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Resume builder error:', error)
    
    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to monitoring service
      // errorMonitoringService.captureException(error, {
      //   page: 'resume-builder',
      //   digest: error.digest,
      //   timestamp: new Date().toISOString(),
      // })
    }
  }, [error])

  const getErrorType = (error: Error) => {
    const message = error.message.toLowerCase()
    
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
    
    return 'unknown'
  }

  const errorType = getErrorType(error)
  
  let title = 'Something went wrong'
  let description = 'An error occurred in the resume builder. Please try again.'
  let showSignIn = false
  
  switch (errorType) {
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
            
            <div className="flex flex-col gap-2">
              <Button onClick={reset} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              {showSignIn && (
                <LinkButton variant="outline" href="/auth/signin?callbackUrl=/resume-builder" className="w-full">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </LinkButton>
              )}
              
              <LinkButton variant="outline" href="/dashboard" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </LinkButton>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 p-3 bg-gray-100 rounded text-sm">
                <summary className="cursor-pointer font-medium">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs">
                  {error.message}
                  {error.digest && `\nDigest: ${error.digest}`}
                  {'\n\n'}
                  {error.stack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}