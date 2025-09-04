import { useEffect, useRef, useCallback } from 'react'
import { performanceMonitor } from '@/lib/performance-monitor'

// Hook for tracking component performance
export function usePerformanceTracking(componentName: string, trackRender = true) {
  const renderStartTime = useRef<number>(performance.now())
  const mountTime = useRef<number>(performance.now())

  useEffect(() => {
    if (trackRender) {
      const renderTime = performance.now() - renderStartTime.current
      performanceMonitor.trackComponentRender(componentName, renderTime)
    }

    // Track mount time
    const totalMountTime = performance.now() - mountTime.current
    performanceMonitor.trackComponentRender(`${componentName}-mount`, totalMountTime)

    // Cleanup function to track unmount
    return () => {
      const unmountTime = performance.now()
      performanceMonitor.trackComponentRender(`${componentName}-unmount`, 0, {
        unmountedAt: unmountTime,
      })
    }
  }, [componentName, trackRender])

  // Manual tracking functions
  const startMeasure = useCallback((measureName: string, metadata?: Record<string, any>) => {
    performanceMonitor.startMeasure(`${componentName}-${measureName}`, metadata)
  }, [componentName])

  const endMeasure = useCallback((measureName: string) => {
    performanceMonitor.endMeasure(`${componentName}-${measureName}`)
  }, [componentName])

  const trackOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const startTime = performance.now()
    
    try {
      const result = await operation()
      const duration = performance.now() - startTime
      
      performanceMonitor.trackApiCall(`${componentName}-${operationName}`, duration, {
        ...metadata,
        success: true,
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      performanceMonitor.trackApiCall(`${componentName}-${operationName}`, duration, {
        ...metadata,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      throw error
    }
  }, [componentName])

  return {
    startMeasure,
    endMeasure,
    trackOperation,
  }
}

// Hook for tracking page load performance
export function usePageLoadTracking(pageName: string) {
  const pageLoadStart = useRef<number>(performance.now())

  useEffect(() => {
    const loadTime = performance.now() - pageLoadStart.current
    
    performanceMonitor.trackPageLoad(pageName, loadTime, {
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    })
  }, [pageName])

  const trackNavigation = useCallback((targetPage: string) => {
    const navigationStart = performance.now()
    
    return () => {
      const navigationTime = performance.now() - navigationStart
      performanceMonitor.trackApiCall(`navigation-${pageName}-to-${targetPage}`, navigationTime, {
        type: 'navigation',
        from: pageName,
        to: targetPage,
      })
    }
  }, [pageName])

  return {
    trackNavigation,
  }
}

// Hook for tracking API calls
export function useApiTracking() {
  const trackApiCall = useCallback(async <T>(
    endpoint: string,
    apiCall: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const startTime = performance.now()
    
    try {
      const result = await apiCall()
      const duration = performance.now() - startTime
      
      performanceMonitor.trackApiCall(endpoint, duration, {
        ...metadata,
        success: true,
        method: metadata?.method || 'GET',
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      
      performanceMonitor.trackApiCall(endpoint, duration, {
        ...metadata,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        method: metadata?.method || 'GET',
      })
      
      throw error
    }
  }, [])

  return {
    trackApiCall,
  }
}

// Hook for tracking form performance
export function useFormPerformanceTracking(formName: string) {
  const formStartTime = useRef<number>()
  const fieldInteractions = useRef<Record<string, number>>({})

  const startFormTracking = useCallback(() => {
    formStartTime.current = performance.now()
    fieldInteractions.current = {}
  }, [])

  const trackFieldInteraction = useCallback((fieldName: string) => {
    if (!fieldInteractions.current[fieldName]) {
      fieldInteractions.current[fieldName] = performance.now()
    }
  }, [])

  const trackFormSubmission = useCallback((success: boolean, metadata?: Record<string, any>) => {
    if (formStartTime.current) {
      const formDuration = performance.now() - formStartTime.current
      const fieldCount = Object.keys(fieldInteractions.current).length
      
      performanceMonitor.trackApiCall(`form-${formName}-submission`, formDuration, {
        ...metadata,
        success,
        fieldCount,
        fieldInteractions: fieldInteractions.current,
        type: 'form-submission',
      })
    }
  }, [formName])

  return {
    startFormTracking,
    trackFieldInteraction,
    trackFormSubmission,
  }
}

// Hook for tracking search performance
export function useSearchPerformanceTracking() {
  const searchStartTime = useRef<number>()

  const startSearch = useCallback((query: string) => {
    searchStartTime.current = performance.now()
    performanceMonitor.startMeasure(`search-${query}`, { query })
  }, [])

  const endSearch = useCallback((query: string, resultCount: number, metadata?: Record<string, any>) => {
    if (searchStartTime.current) {
      const searchDuration = performance.now() - searchStartTime.current
      
      performanceMonitor.trackApiCall(`search-${query}`, searchDuration, {
        ...metadata,
        query,
        resultCount,
        type: 'search',
      })
      
      performanceMonitor.endMeasure(`search-${query}`)
    }
  }, [])

  return {
    startSearch,
    endSearch,
  }
}