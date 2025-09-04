'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { errorReporter } from '@/lib/error-reporting'

interface ErrorRecoveryState {
  hasError: boolean
  error: Error | null
  errorCount: number
  lastErrorTime: number
  isRecovering: boolean
  recoveryAttempts: number
}

interface ErrorRecoveryOptions {
  maxRetries?: number
  retryDelay?: number
  exponentialBackoff?: boolean
  onError?: (error: Error, attempt: number) => void
  onRecovery?: (attempt: number) => void
  onMaxRetriesReached?: (error: Error) => void
  autoRecover?: boolean
  recoveryStrategies?: RecoveryStrategy[]
}

interface RecoveryStrategy {
  name: string
  condition: (error: Error) => boolean
  action: () => Promise<void> | void
  priority: number
}

export function useErrorRecovery(options: ErrorRecoveryOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    onError,
    onRecovery,
    onMaxRetriesReached,
    autoRecover = false,
    recoveryStrategies = []
  } = options

  const [state, setState] = useState<ErrorRecoveryState>({
    hasError: false,
    error: null,
    errorCount: 0,
    lastErrorTime: 0,
    isRecovering: false,
    recoveryAttempts: 0
  })

  const timeoutRef = useRef<NodeJS.Timeout>()
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const calculateDelay = useCallback((attempt: number) => {
    if (!exponentialBackoff) return retryDelay
    return Math.min(retryDelay * Math.pow(2, attempt), 30000) // Max 30 seconds
  }, [retryDelay, exponentialBackoff])

  const executeRecoveryStrategy = useCallback(async (error: Error) => {
    const applicableStrategies = recoveryStrategies
      .filter(strategy => strategy.condition(error))
      .sort((a, b) => b.priority - a.priority)

    for (const strategy of applicableStrategies) {
      try {
        await strategy.action()
        console.log(`Recovery strategy "${strategy.name}" executed successfully`)
        return true
      } catch (strategyError) {
        console.error(`Recovery strategy "${strategy.name}" failed:`, strategyError)
      }
    }

    return false
  }, [recoveryStrategies])

  const handleError = useCallback(async (error: Error) => {
    if (!mountedRef.current) return

    const now = Date.now()
    
    setState(prevState => ({
      ...prevState,
      hasError: true,
      error,
      errorCount: prevState.errorCount + 1,
      lastErrorTime: now
    }))

    // Report error
    errorReporter.reportError({
      message: error.message,
      stack: error.stack,
      category: 'javascript',
      severity: 'medium',
      additionalContext: {
        errorCount: state.errorCount + 1,
        recoveryAttempts: state.recoveryAttempts
      }
    })

    onError?.(error, state.errorCount + 1)

    // Try recovery strategies first
    const strategySucceeded = await executeRecoveryStrategy(error)
    if (strategySucceeded) {
      setState(prevState => ({
        ...prevState,
        hasError: false,
        error: null,
        isRecovering: false
      }))
      return
    }

    // Auto-recover if enabled and within retry limits
    if (autoRecover && state.recoveryAttempts < maxRetries) {
      recover()
    } else if (state.recoveryAttempts >= maxRetries) {
      onMaxRetriesReached?.(error)
    }
  }, [
    state.errorCount,
    state.recoveryAttempts,
    maxRetries,
    autoRecover,
    onError,
    onMaxRetriesReached,
    executeRecoveryStrategy
  ])

  const recover = useCallback(() => {
    if (!mountedRef.current || state.isRecovering) return

    setState(prevState => ({
      ...prevState,
      isRecovering: true,
      recoveryAttempts: prevState.recoveryAttempts + 1
    }))

    const delay = calculateDelay(state.recoveryAttempts)

    timeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return

      setState(prevState => ({
        ...prevState,
        hasError: false,
        error: null,
        isRecovering: false
      }))

      onRecovery?.(state.recoveryAttempts + 1)
    }, delay)
  }, [state.isRecovering, state.recoveryAttempts, calculateDelay, onRecovery])

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setState({
      hasError: false,
      error: null,
      errorCount: 0,
      lastErrorTime: 0,
      isRecovering: false,
      recoveryAttempts: 0
    })
  }, [])

  const canRetry = state.recoveryAttempts < maxRetries

  return {
    ...state,
    handleError,
    recover,
    reset,
    canRetry
  }
}

// Hook for component-level error recovery
export function useComponentErrorRecovery(componentName: string) {
  const [retryKey, setRetryKey] = useState(0)
  
  const errorRecovery = useErrorRecovery({
    maxRetries: 3,
    autoRecover: false,
    onError: (error, attempt) => {
      console.error(`Component ${componentName} error (attempt ${attempt}):`, error)
    },
    onRecovery: (attempt) => {
      console.log(`Component ${componentName} recovered (attempt ${attempt})`)
    }
  })

  const retryComponent = useCallback(() => {
    setRetryKey(prev => prev + 1)
    errorRecovery.reset()
  }, [errorRecovery])

  return {
    ...errorRecovery,
    retryKey,
    retryComponent
  }
}

// Hook for async operation error recovery
export function useAsyncErrorRecovery<T>(
  asyncOperation: () => Promise<T>,
  options: ErrorRecoveryOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const errorRecovery = useErrorRecovery({
    ...options,
    autoRecover: true,
    recoveryStrategies: [
      {
        name: 'retry-operation',
        condition: () => true,
        action: async () => {
          setIsLoading(true)
          try {
            const result = await asyncOperation()
            setData(result)
          } finally {
            setIsLoading(false)
          }
        },
        priority: 1
      },
      ...(options.recoveryStrategies || [])
    ]
  })

  const execute = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await asyncOperation()
      setData(result)
      errorRecovery.reset()
    } catch (error) {
      errorRecovery.handleError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }, [asyncOperation, errorRecovery])

  return {
    data,
    isLoading,
    execute,
    ...errorRecovery
  }
}

// Predefined recovery strategies
export const commonRecoveryStrategies: RecoveryStrategy[] = [
  {
    name: 'reload-page',
    condition: (error) => error.message.includes('chunk') || error.message.includes('loading'),
    action: () => {
      window.location.reload()
    },
    priority: 10
  },
  {
    name: 'clear-cache',
    condition: (error) => error.message.includes('cache') || error.message.includes('storage'),
    action: () => {
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name))
        })
      }
      localStorage.clear()
      sessionStorage.clear()
    },
    priority: 8
  },
  {
    name: 'retry-network',
    condition: (error) => error.message.includes('fetch') || error.message.includes('network'),
    action: async () => {
      // Wait for network to be available
      if (!navigator.onLine) {
        await new Promise(resolve => {
          const handler = () => {
            window.removeEventListener('online', handler)
            resolve(void 0)
          }
          window.addEventListener('online', handler)
        })
      }
    },
    priority: 6
  },
  {
    name: 'clear-local-storage',
    condition: (error) => error.message.includes('quota') || error.message.includes('storage'),
    action: () => {
      localStorage.clear()
    },
    priority: 4
  },
  {
    name: 'force-garbage-collection',
    condition: (error) => error.message.includes('memory') || error.message.includes('heap'),
    action: () => {
      // Force garbage collection if available (Chrome DevTools)
      if ('gc' in window) {
        (window as any).gc()
      }
    },
    priority: 2
  }
]

// Hook for network-aware error recovery
export function useNetworkErrorRecovery() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const networkRecoveryStrategies: RecoveryStrategy[] = [
    {
      name: 'wait-for-network',
      condition: (error) => !isOnline || error.message.includes('network'),
      action: async () => {
        if (!isOnline) {
          await new Promise(resolve => {
            const handler = () => {
              window.removeEventListener('online', handler)
              resolve(void 0)
            }
            window.addEventListener('online', handler)
          })
        }
      },
      priority: 10
    }
  ]

  return useErrorRecovery({
    maxRetries: 5,
    retryDelay: 2000,
    exponentialBackoff: true,
    recoveryStrategies: networkRecoveryStrategies
  })
}