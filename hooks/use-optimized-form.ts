'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import { useForm, UseFormProps, UseFormReturn, FieldValues, Path } from 'react-hook-form'
// Create a simple debounce function to avoid lodash dependency
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

interface OptimizedFormOptions<T extends FieldValues> extends UseFormProps<T> {
  // Debounce settings
  debounceMs?: number
  debounceFields?: (keyof T)[]
  
  // Auto-save settings
  autoSave?: boolean
  autoSaveDelay?: number
  onAutoSave?: (data: T) => Promise<void>
  
  // Performance settings
  enablePerformanceTracking?: boolean
  onPerformanceMetric?: (metric: PerformanceMetric) => void
  
  // Double submission prevention
  preventDoubleSubmit?: boolean
}

interface PerformanceMetric {
  type: 'render' | 'validation' | 'submission'
  duration: number
  fieldCount: number
  timestamp: Date
}

interface CustomFormState {
  isSubmitting: boolean
  hasSubmitted: boolean
  lastSubmissionTime: number
  validationErrors: Record<string, string>
  isDirty: boolean
  touchedFields: string[]
}

export function useOptimizedForm<T extends FieldValues>(
  options: OptimizedFormOptions<T> = {}
): UseFormReturn<T> & {
  customFormState: CustomFormState
  submitWithValidation: (onSubmit: (data: T) => Promise<void>) => Promise<void>
  resetSubmissionState: () => void
  trackFieldInteraction: (fieldName: keyof T) => void
} {
  const {
    debounceMs = 300,
    debounceFields = [],
    autoSave = false,
    autoSaveDelay = 2000,
    onAutoSave,
    enablePerformanceTracking = true,
    onPerformanceMetric,
    preventDoubleSubmit = true,
    ...formOptions
  } = options

  const form = useForm<T>(formOptions)
  const { watch, trigger, getValues, formState } = form
  
  const [customFormState, setCustomFormState] = useState<CustomFormState>({
    isSubmitting: false,
    hasSubmitted: false,
    lastSubmissionTime: 0,
    validationErrors: {},
    isDirty: false,
    touchedFields: []
  })

  const performanceRef = useRef<{ startTime: number; fieldCount: number }>({
    startTime: Date.now(),
    fieldCount: 0
  })

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const debouncedValidationRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Performance tracking
  const trackPerformance = useCallback((type: PerformanceMetric['type']) => {
    if (!enablePerformanceTracking) return

    const duration = Date.now() - performanceRef.current.startTime
    const metric: PerformanceMetric = {
      type,
      duration,
      fieldCount: performanceRef.current.fieldCount,
      timestamp: new Date()
    }

    onPerformanceMetric?.(metric)
    performanceRef.current.startTime = Date.now()
  }, [enablePerformanceTracking, onPerformanceMetric])

  // Debounced validation for specific fields
  const debouncedValidate = useCallback(
    debounce(async (fieldName: string) => {
      const startTime = Date.now()
      try {
        await trigger(fieldName as Path<T>)
        trackPerformance('validation')
      } catch (error) {
        console.error(`Validation error for field ${fieldName}:`, error)
      }
    }, debounceMs),
    [trigger, debounceMs, trackPerformance]
  )

  // Track field interactions
  const trackFieldInteraction = useCallback((fieldName: keyof T) => {
    setCustomFormState(prev => ({
      ...prev,
      touchedFields: prev.touchedFields.includes(fieldName as string)
        ? prev.touchedFields
        : [...prev.touchedFields, fieldName as string],
      isDirty: true
    }))

    performanceRef.current.fieldCount++

    // Debounced validation for specified fields
    if (debounceFields.includes(fieldName)) {
      const fieldStr = fieldName as string
      
      // Clear existing timeout for this field
      const existingTimeout = debouncedValidationRef.current.get(fieldStr)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        debouncedValidate(fieldStr)
        debouncedValidationRef.current.delete(fieldStr)
      }, debounceMs)

      debouncedValidationRef.current.set(fieldStr, timeout)
    }
  }, [debounceFields, debounceMs, debouncedValidate])

  // Auto-save functionality
  const triggerAutoSave = useCallback(
    debounce(async () => {
      if (!autoSave || !onAutoSave || customFormState.isSubmitting) return

      try {
        const data = getValues()
        await onAutoSave(data)
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, autoSaveDelay),
    [autoSave, onAutoSave, autoSaveDelay, customFormState.isSubmitting, getValues]
  )

  // Watch for changes to trigger auto-save
  const watchedValues = watch()
  useEffect(() => {
    if (customFormState.isDirty && autoSave) {
      triggerAutoSave()
    }
  }, [watchedValues, customFormState.isDirty, autoSave, triggerAutoSave])

  // Enhanced submit function with double-submission prevention
  const submitWithValidation = useCallback(async (onSubmit: (data: T) => Promise<void>) => {
    const now = Date.now()
    
    // Prevent double submission
    if (preventDoubleSubmit && customFormState.isSubmitting) {
      console.warn('Form submission already in progress')
      return
    }

    if (preventDoubleSubmit && now - customFormState.lastSubmissionTime < 1000) {
      console.warn('Submission too frequent, please wait')
      return
    }

    setCustomFormState(prev => ({
      ...prev,
      isSubmitting: true,
      lastSubmissionTime: now
    }))

    const startTime = Date.now()

    try {
      // Validate all fields
      const isValid = await trigger()
      if (!isValid) {
        trackPerformance('validation')
        return
      }

      // Submit the form
      const data = getValues()
      await onSubmit(data)

      setCustomFormState(prev => ({
        ...prev,
        hasSubmitted: true,
        isDirty: false
      }))

      trackPerformance('submission')
    } catch (error) {
      console.error('Form submission error:', error)
      throw error
    } finally {
      setCustomFormState(prev => ({
        ...prev,
        isSubmitting: false
      }))
    }
  }, [
    preventDoubleSubmit,
    customFormState.isSubmitting,
    customFormState.lastSubmissionTime,
    trigger,
    getValues,
    trackPerformance
  ])

  // Reset submission state
  const resetSubmissionState = useCallback(() => {
    setCustomFormState(prev => ({
      ...prev,
      isSubmitting: false,
      hasSubmitted: false,
      lastSubmissionTime: 0,
      isDirty: false,
      touchedFields: []
    }))
  }, [])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      debouncedValidationRef.current.forEach(timeout => clearTimeout(timeout))
      debouncedValidationRef.current.clear()
    }
  }, [])

  return {
    ...form,
    customFormState,
    submitWithValidation,
    resetSubmissionState,
    trackFieldInteraction
  }
}

// Utility hook for form performance monitoring
export function useFormPerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])

  const recordMetric = useCallback((metric: PerformanceMetric) => {
    setMetrics(prev => [...prev.slice(-99), metric]) // Keep last 100 metrics
  }, [])

  const getAverageMetrics = useCallback(() => {
    if (metrics.length === 0) return null

    const byType = metrics.reduce((acc, metric) => {
      if (!acc[metric.type]) {
        acc[metric.type] = []
      }
      acc[metric.type].push(metric.duration)
      return acc
    }, {} as Record<string, number[]>)

    return Object.entries(byType).reduce((acc, [type, durations]) => {
      acc[type] = durations.reduce((sum, d) => sum + d, 0) / durations.length
      return acc
    }, {} as Record<string, number>)
  }, [metrics])

  const clearMetrics = useCallback(() => {
    setMetrics([])
  }, [])

  return {
    metrics,
    recordMetric,
    getAverageMetrics,
    clearMetrics
  }
}