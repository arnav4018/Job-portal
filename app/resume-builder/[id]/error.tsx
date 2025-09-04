'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { AlertTriangle, RefreshCw, Home, LogIn, ArrowLeft, FileText } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ResumeEditError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Resume edit error:', error)
    
    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to monitoring service
      // errorMonitoringService.captureException(error, {
      //   page: 'resume-edit',
      //   digest: error.digest,
      //   timestamp: new Date().toISOString(),
      // })
    }
  }, [error])

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/resume-builder'
    }
  }

  const getErrorType = (error: Error) => {
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

  const errorType = getErrorType(error)
  
  let title = 'Something went wrong'
  let description = 'An error occurred while editing your resume. Please try again.'
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
      description = 'You need to sign in to edit this resume.'
      showSignIn = true
      break
    case 'permission':
      title = 'Access Denied'
      description = 'You don\'t have permission to edit this resume.'
      showResumeList = true
      break
    case 'network':
      title = 'Connection Error'
      description = 'Unable to connect to the resume service. Please check your internet connection.'
      break
    case 'timeout':
      title = 'Loading Timeout'
      description = 'The resume is taking too long to load. Please try again.'
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
            
            {errorType === 'save_error' && (
              <div className="text-center text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
                <p className="font-medium">⚠️ Unsaved Changes</p>
                <p>Your recent changes may not have been saved. Please try refreshing and re-entering your data.</p>
              </div>
            )}
            
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