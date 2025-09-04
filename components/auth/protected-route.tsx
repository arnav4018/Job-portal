'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { AlertTriangle, Shield, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: string[]
  requireAuth?: boolean
  fallbackUrl?: string
  showFallback?: boolean
}

interface LoadingStateProps {
  message?: string
}

function LoadingState({ message = 'Checking authentication...' }: LoadingStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-muted-foreground text-center">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface AccessDeniedProps {
  userRole?: string
  allowedRoles?: string[]
  onRetry?: () => void
}

function AccessDenied({ userRole, allowedRoles, onRetry }: AccessDeniedProps) {
  const getRoleBasedRedirect = (role: string) => {
    switch (role) {
      case 'CANDIDATE':
        return '/candidate'
      case 'RECRUITER':
        return '/recruiter'
      case 'ADMIN':
        return '/admin'
      default:
        return '/dashboard'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground">
            <p>You don't have permission to access this page.</p>
            {userRole && allowedRoles && (
              <p className="mt-2 text-sm">
                Your role: <span className="font-medium">{userRole}</span>
                <br />
                Required roles: <span className="font-medium">{allowedRoles.join(', ')}</span>
              </p>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            {onRetry && (
              <Button onClick={onRetry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {userRole && (
              <LinkButton variant="outline" className="w-full" href={getRoleBasedRedirect(userRole)}>
                <Home className="w-4 h-4 mr-2" />
                Go to My Dashboard
              </LinkButton>
            )}
            
            <LinkButton variant="outline" className="w-full" href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </LinkButton>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface AuthenticationErrorProps {
  onRetry?: () => void
  callbackUrl?: string
}

function AuthenticationError({ onRetry, callbackUrl }: AuthenticationErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <CardTitle className="text-xl">Authentication Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Please sign in to access this page.
          </p>
          
          <div className="flex flex-col gap-2">
            {onRetry && (
              <Button onClick={onRetry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            <LinkButton className="w-full" href={`/auth/signin${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}>
              Sign In
            </LinkButton>
            
            <LinkButton variant="outline" className="w-full" href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </LinkButton>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  requireAuth = true,
  fallbackUrl,
  showFallback = true,
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [retryCount, setRetryCount] = useState(0)
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    setCurrentUrl(window.location.pathname + window.location.search)
  }, [])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    window.location.reload()
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return <LoadingState />
  }

  // Handle authentication requirement
  if (requireAuth && !session) {
    if (showFallback) {
      return <AuthenticationError onRetry={handleRetry} callbackUrl={currentUrl} />
    } else {
      // Redirect to sign in
      const redirectUrl = fallbackUrl || `/auth/signin?callbackUrl=${encodeURIComponent(currentUrl)}`
      router.push(redirectUrl)
      return <LoadingState message="Redirecting to sign in..." />
    }
  }

  // Handle suspended users
  if (session?.user?.status === 'SUSPENDED') {
    if (showFallback) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Account Suspended</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Your account has been suspended. Please contact support for assistance.
              </p>
            </CardContent>
          </Card>
        </div>
      )
    } else {
      router.push('/auth/suspended')
      return <LoadingState message="Redirecting..." />
    }
  }

  // Handle role-based access control
  if (allowedRoles.length > 0 && session?.user?.role) {
    const userRole = session.user.role
    
    if (!allowedRoles.includes(userRole)) {
      if (showFallback) {
        return (
          <AccessDenied 
            userRole={userRole}
            allowedRoles={allowedRoles}
            onRetry={handleRetry}
          />
        )
      } else {
        // Redirect to appropriate dashboard based on user role
        const redirectUrl = fallbackUrl || (() => {
          switch (userRole) {
            case 'CANDIDATE':
              return '/candidate'
            case 'RECRUITER':
              return '/recruiter'
            case 'ADMIN':
              return '/admin'
            default:
              return '/dashboard'
          }
        })()
        
        router.push(redirectUrl)
        return <LoadingState message="Redirecting to your dashboard..." />
      }
    }
  }

  // All checks passed, render children
  return <>{children}</>
}

// Higher-order component for easier usage
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// Hook for checking access within components
export function useProtectedRoute(allowedRoles?: string[]) {
  const { data: session, status } = useSession()
  
  const isLoading = status === 'loading'
  const isAuthenticated = !!session
  const userRole = session?.user?.role
  const hasAccess = !allowedRoles || (userRole && allowedRoles.includes(userRole))
  const isSuspended = session?.user?.status === 'SUSPENDED'
  
  return {
    isLoading,
    isAuthenticated,
    userRole,
    hasAccess,
    isSuspended,
    session,
  }
}