import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes and their required roles
const protectedRoutes = {
  '/profile': ['CANDIDATE', 'RECRUITER', 'ADMIN'],
  '/dashboard': ['CANDIDATE', 'RECRUITER', 'ADMIN'],
  '/resume-builder': ['CANDIDATE'],
  '/post-job': ['RECRUITER', 'ADMIN'],
  '/admin': ['ADMIN'],
  '/recruiter': ['RECRUITER', 'ADMIN'],
  '/candidate': ['CANDIDATE'],
  '/companies': ['RECRUITER', 'ADMIN'],
  '/referrals': ['CANDIDATE', 'RECRUITER', 'ADMIN'],
}

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/auth/verify-request',
  '/jobs',
  '/api/auth',
  '/demo',
  '/status',
]

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === '/') return pathname === '/'
    if (route === '/api/auth') return pathname.startsWith('/api/auth/')
    return pathname.startsWith(route)
  })
}

function getRequiredRoles(pathname: string): string[] | null {
  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      return roles
    }
  }
  return null
}

function createRedirectUrl(request: NextRequest, destination: string): string {
  const url = new URL(destination, request.url)
  
  // Add return URL for protected routes
  if (!isPublicRoute(request.nextUrl.pathname)) {
    url.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search)
  }
  
  return url.toString()
}

export default withAuth(
  function middleware(request) {
    const { pathname } = request.nextUrl
    const token = request.nextauth.token

    // Handle protected routes
    const requiredRoles = getRequiredRoles(pathname)
    
    if (requiredRoles) {
      // Check if user has required role
      if (!token?.role || !requiredRoles.includes(token.role as string)) {
        // Redirect to appropriate page based on user role or signin
        if (!token) {
          return NextResponse.redirect(createRedirectUrl(request, '/auth/signin'))
        }
        
        // User is authenticated but doesn't have required role
        const userRole = token.role as string
        
        // Redirect to appropriate dashboard based on user role
        if (userRole === 'CANDIDATE') {
          return NextResponse.redirect(new URL('/candidate', request.url))
        } else if (userRole === 'RECRUITER') {
          return NextResponse.redirect(new URL('/recruiter', request.url))
        } else if (userRole === 'ADMIN') {
          return NextResponse.redirect(new URL('/admin', request.url))
        }
        
        // Fallback to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      
      // Check if user is suspended
      if (token.status === 'SUSPENDED') {
        return NextResponse.redirect(new URL('/auth/suspended', request.url))
      }
    }

    // Handle role-based redirects for dashboard
    if (pathname === '/dashboard' && token?.role) {
      const userRole = token.role as string
      
      // Redirect to role-specific dashboard if available
      if (userRole === 'CANDIDATE' && !pathname.startsWith('/candidate')) {
        return NextResponse.redirect(new URL('/candidate', request.url))
      } else if (userRole === 'RECRUITER' && !pathname.startsWith('/recruiter')) {
        return NextResponse.redirect(new URL('/recruiter', request.url))
      } else if (userRole === 'ADMIN' && !pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to public routes
        if (isPublicRoute(pathname)) {
          return true
        }
        
        // Require authentication for protected routes
        const requiredRoles = getRequiredRoles(pathname)
        if (requiredRoles) {
          return !!token
        }
        
        // Allow access to other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}