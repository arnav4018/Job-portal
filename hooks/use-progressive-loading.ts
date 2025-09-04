'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface LoadingState {
  isLoading: boolean
  progress: number
  stage: string
  error?: string
  data?: any
}

export interface ProgressiveLoadingOptions<T> {
  stages: LoadingStage<T>[]
  onStageComplete?: (stage: string, data: any) => void
  onComplete?: (data: T) => void
  onError?: (error: Error, stage: string) => void
  retryAttempts?: number
  retryDelay?: number
}

export interface LoadingStage<T> {
  name: string
  loader: () => Promise<any>
  weight?: number // Relative weight for progress calculation
  required?: boolean // If false, failure won't stop the process
  dependencies?: string[] // Names of stages that must complete first
}

export function useProgressiveLoading<T = any>(
  options: ProgressiveLoadingOptions<T>
) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    stage: '',
  })

  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set())
  const [stageResults, setStageResults] = useState<Map<string, any>>(new Map())
  const abortControllerRef = useRef<AbortController>()
  const retryCountRef = useRef<Map<string, number>>(new Map())

  const {
    stages,
    onStageComplete,
    onComplete,
    onError,
    retryAttempts = 3,
    retryDelay = 1000
  } = options

  // Calculate total weight for progress calculation
  const totalWeight = stages.reduce((sum, stage) => sum + (stage.weight || 1), 0)

  const updateProgress = useCallback((completedStages: Set<string>) => {
    const completedWeight = stages
      .filter(stage => completedStages.has(stage.name))
      .reduce((sum, stage) => sum + (stage.weight || 1), 0)
    
    return Math.round((completedWeight / totalWeight) * 100)
  }, [stages, totalWeight])

  const canExecuteStage = useCallback((stage: LoadingStage<T>, completed: Set<string>) => {
    if (!stage.dependencies) return true
    return stage.dependencies.every(dep => completed.has(dep))
  }, [])

  const executeStage = useCallback(async (stage: LoadingStage<T>): Promise<any> => {
    const retryCount = retryCountRef.current.get(stage.name) || 0
    
    try {
      setLoadingState(prev => ({ ...prev, stage: stage.name }))
      
      const result = await stage.loader()
      
      // Reset retry count on success
      retryCountRef.current.set(stage.name, 0)
      
      return result
    } catch (error) {
      const newRetryCount = retryCount + 1
      retryCountRef.current.set(stage.name, newRetryCount)
      
      if (newRetryCount <= retryAttempts) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, retryDelay * newRetryCount))
        return executeStage(stage)
      }
      
      // Max retries reached
      if (stage.required !== false) {
        throw error
      }
      
      // Non-required stage failed, continue with null result
      console.warn(`Non-required stage "${stage.name}" failed:`, error)
      return null
    }
  }, [retryAttempts, retryDelay])

  const startLoading = useCallback(async () => {
    if (loadingState.isLoading) return

    // Create new abort controller
    abortControllerRef.current = new AbortController()
    
    setLoadingState({
      isLoading: true,
      progress: 0,
      stage: 'Initializing...',
    })

    setCompletedStages(new Set())
    setStageResults(new Map())
    retryCountRef.current.clear()

    try {
      const completed = new Set<string>()
      const results = new Map<string, any>()
      const pendingStages = [...stages]

      while (pendingStages.length > 0 && !abortControllerRef.current?.signal.aborted) {
        // Find stages that can be executed
        const executableStages = pendingStages.filter(stage => 
          canExecuteStage(stage, completed)
        )

        if (executableStages.length === 0) {
          throw new Error('Circular dependency detected in loading stages')
        }

        // Execute stages in parallel if possible
        const stagePromises = executableStages.map(async (stage) => {
          try {
            const result = await executeStage(stage)
            return { stage: stage.name, result, success: true }
          } catch (error) {
            return { stage: stage.name, error, success: false }
          }
        })

        const stageResults = await Promise.all(stagePromises)

        // Process results
        for (const { stage: stageName, result, error, success } of stageResults) {
          if (success) {
            completed.add(stageName)
            results.set(stageName, result)
            
            // Remove from pending
            const stageIndex = pendingStages.findIndex(s => s.name === stageName)
            if (stageIndex >= 0) {
              pendingStages.splice(stageIndex, 1)
            }

            // Update state
            setCompletedStages(new Set(completed))
            setStageResults(new Map(results))
            setLoadingState(prev => ({
              ...prev,
              progress: updateProgress(completed)
            }))

            // Call stage complete callback
            onStageComplete?.(stageName, result)
          } else {
            // Handle stage failure
            const stage = stages.find(s => s.name === stageName)
            if (stage?.required !== false) {
              throw error
            }
            
            // Non-required stage failed, mark as completed with null result
            completed.add(stageName)
            results.set(stageName, null)
            
            const stageIndex = pendingStages.findIndex(s => s.name === stageName)
            if (stageIndex >= 0) {
              pendingStages.splice(stageIndex, 1)
            }

            onError?.(error as Error, stageName)
          }
        }
      }

      if (!abortControllerRef.current?.signal.aborted) {
        // All stages completed
        const finalData = Object.fromEntries(results) as T
        
        setLoadingState({
          isLoading: false,
          progress: 100,
          stage: 'Complete',
          data: finalData
        })

        onComplete?.(finalData)
      }
    } catch (error) {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoadingState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Loading failed'
        }))

        onError?.(error as Error, loadingState.stage)
      }
    }
  }, [
    loadingState.isLoading,
    loadingState.stage,
    stages,
    canExecuteStage,
    executeStage,
    updateProgress,
    onStageComplete,
    onComplete,
    onError
  ])

  const cancelLoading = useCallback(() => {
    abortControllerRef.current?.abort()
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      stage: 'Cancelled'
    }))
  }, [])

  const retryLoading = useCallback(() => {
    retryCountRef.current.clear()
    startLoading()
  }, [startLoading])

  const retryStage = useCallback((stageName: string) => {
    retryCountRef.current.set(stageName, 0)
    // This would require more complex state management to retry individual stages
    // For now, we'll just retry the entire loading process
    retryLoading()
  }, [retryLoading])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  return {
    loadingState,
    completedStages: Array.from(completedStages),
    stageResults: Object.fromEntries(stageResults),
    startLoading,
    cancelLoading,
    retryLoading,
    retryStage,
    isStageComplete: (stageName: string) => completedStages.has(stageName),
    getStageResult: (stageName: string) => stageResults.get(stageName)
  }
}

// Utility hook for simple loading states
export function useLoadingState(initialLoading = false) {
  const [isLoading, setIsLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setError(null)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  const setLoadingError = useCallback((error: string | Error) => {
    setIsLoading(false)
    setError(error instanceof Error ? error.message : error)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    clearError
  }
}

// Hook for managing multiple loading states
export function useMultipleLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Map<string, boolean>>(new Map())
  const [errors, setErrors] = useState<Map<string, string>>(new Map())

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => new Map(prev.set(key, loading)))
    if (loading) {
      setErrors(prev => {
        const newErrors = new Map(prev)
        newErrors.delete(key)
        return newErrors
      })
    }
  }, [])

  const setError = useCallback((key: string, error: string | Error) => {
    setLoadingStates(prev => new Map(prev.set(key, false)))
    setErrors(prev => new Map(prev.set(key, error instanceof Error ? error.message : error)))
  }, [])

  const clearError = useCallback((key: string) => {
    setErrors(prev => {
      const newErrors = new Map(prev)
      newErrors.delete(key)
      return newErrors
    })
  }, [])

  const isLoading = useCallback((key: string) => {
    return loadingStates.get(key) || false
  }, [loadingStates])

  const getError = useCallback((key: string) => {
    return errors.get(key) || null
  }, [errors])

  const isAnyLoading = useCallback(() => {
    return Array.from(loadingStates.values()).some(loading => loading)
  }, [loadingStates])

  const hasAnyError = useCallback(() => {
    return errors.size > 0
  }, [errors])

  return {
    setLoading,
    setError,
    clearError,
    isLoading,
    getError,
    isAnyLoading,
    hasAnyError,
    loadingStates: Object.fromEntries(loadingStates),
    errors: Object.fromEntries(errors)
  }
}