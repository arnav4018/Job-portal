'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { AlertTriangle, RefreshCw, Home, Search, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function JobError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Job page error:', error)
    
    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to monitoring service
      // errorMonitoringService.captureException(error, {
      //   page: 'job-details',
      //   digest: error.digest,
      //   timestamp: new Date().toISOString(),
      // })
    }
  }, [error])

  const getErrorType = (error: Error) => {
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

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/jobs'
    }
  }

  const errorType = getErrorType(error)
  
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
            
            <div className="flex flex-col gap-2">
              <Button onClick={reset} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                onClick={handleGoBack}
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