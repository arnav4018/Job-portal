'use client'

import { forwardRef, MouseEvent, useEffect, useRef, useCallback } from 'react'
import Link, { LinkProps } from 'next/link'
import { useNavigationPerformance } from '@/lib/navigation-performance'

interface OptimizedLinkProps extends LinkProps {
  children: React.ReactNode
  className?: string
  preload?: boolean | 'hover' | 'visible'
  preloadData?: boolean
  priority?: 'high' | 'medium' | 'low'
  onNavigationStart?: () => void
  onNavigationComplete?: () => void
}

export const OptimizedLink = forwardRef<HTMLAnchorElement, OptimizedLinkProps>(
  ({ 
    children, 
    href, 
    preload = 'hover', 
    preloadData = false,
    priority = 'medium',
    onNavigationStart,
    onNavigationComplete,
    ...props 
  }, ref) => {
    const linkRef = useRef<HTMLAnchorElement>(null)
    const { preloadRoute, recordMetric } = useNavigationPerformance()
    const hoverTimeoutRef = useRef<NodeJS.Timeout>()
    const navigationStartTime = useRef<number>()

    // Combine refs using useCallback
    const combinedRef = useCallback((node: HTMLAnchorElement | null) => {
      // Update our internal ref
      if (linkRef.current !== node) {
        (linkRef as any).current = node
      }
      
      // Update the forwarded ref
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        (ref as any).current = node
      }
    }, [ref])

    const route = typeof href === 'string' ? href : href.pathname || ''

    // Preload on visibility (intersection observer)
    useEffect(() => {
      if (preload === 'visible' && linkRef.current) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                preloadRoute(route, { 
                  route, 
                  priority, 
                  preloadData 
                })
                observer.unobserve(entry.target)
              }
            })
          },
          { threshold: 0.1 }
        )

        observer.observe(linkRef.current)

        return () => {
          observer.disconnect()
        }
      }
    }, [preload, route, priority, preloadData, preloadRoute])

    // Preload immediately if preload is true
    useEffect(() => {
      if (preload === true) {
        preloadRoute(route, { 
          route, 
          priority, 
          preloadData 
        })
      }
    }, [preload, route, priority, preloadData, preloadRoute])

    const handleMouseEnter = () => {
      if (preload === 'hover') {
        // Add small delay to avoid unnecessary preloads on quick hovers
        hoverTimeoutRef.current = setTimeout(() => {
          preloadRoute(route, { 
            route, 
            priority: 'low', 
            preloadData 
          })
        }, 100)
      }
    }

    const handleMouseLeave = () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      navigationStartTime.current = performance.now()
      onNavigationStart?.()

      // Record navigation attempt
      recordMetric({
        route,
        loadTime: 0, // Will be updated when navigation completes
        renderTime: 0
      })

      // Call original onClick if provided
      if (props.onClick) {
        props.onClick(event)
      }
    }

    // Track navigation completion
    useEffect(() => {
      const handleRouteChange = () => {
        if (navigationStartTime.current) {
          const navigationTime = performance.now() - navigationStartTime.current
          recordMetric({
            route,
            loadTime: navigationTime,
            renderTime: navigationTime
          })
          onNavigationComplete?.()
          navigationStartTime.current = undefined
        }
      }

      // Listen for route changes (this is a simplified approach)
      // In a real implementation, you'd want to integrate with Next.js router events
      window.addEventListener('popstate', handleRouteChange)

      return () => {
        window.removeEventListener('popstate', handleRouteChange)
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current)
        }
      }
    }, [route, recordMetric, onNavigationComplete])

    return (
      <Link
        {...props}
        href={href}
        ref={combinedRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children}
      </Link>
    )
  }
)

OptimizedLink.displayName = 'OptimizedLink'