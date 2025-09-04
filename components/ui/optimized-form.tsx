'use client'

import React, { forwardRef, useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

// Enhanced Input with loading states and validation feedback
interface OptimizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  isLoading?: boolean
  isValid?: boolean
  showValidation?: boolean
  helperText?: string
  onDebounceChange?: (value: string) => void
  debounceMs?: number
}

export const OptimizedInput = forwardRef<HTMLInputElement, OptimizedInputProps>(
  ({ 
    className, 
    label, 
    error, 
    isLoading, 
    isValid, 
    showValidation = true,
    helperText,
    onDebounceChange,
    debounceMs = 300,
    type = 'text',
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout>()

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      
      // Call original onChange
      props.onChange?.(e)

      // Handle debounced change
      if (onDebounceChange) {
        if (debounceTimeout) {
          clearTimeout(debounceTimeout)
        }

        const timeout = setTimeout(() => {
          onDebounceChange(value)
        }, debounceMs)

        setDebounceTimeout(timeout)
      }
    }, [props.onChange, onDebounceChange, debounceMs, debounceTimeout])

    useEffect(() => {
      return () => {
        if (debounceTimeout) {
          clearTimeout(debounceTimeout)
        }
      }
    }, [debounceTimeout])

    const inputType = type === 'password' && showPassword ? 'text' : type

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          <Input
            ref={ref}
            type={inputType}
            className={cn(
              "transition-all duration-200",
              error && "border-red-500 focus:border-red-500",
              isValid && showValidation && "border-green-500 focus:border-green-500",
              isLoading && "pr-10",
              type === 'password' && "pr-10",
              className
            )}
            {...props}
            onChange={handleChange}
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
          
          {/* Validation indicators */}
          {!isLoading && showValidation && (
            <>
              {isValid && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              )}
              {error && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
              )}
            </>
          )}
          
          {/* Password toggle */}
          {type === 'password' && !isLoading && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          )}
        </div>
        
        {/* Helper text or error message */}
        {(error || helperText) && (
          <div className={cn(
            "text-sm",
            error ? "text-red-500" : "text-gray-500"
          )}>
            {error || helperText}
          </div>
        )}
      </div>
    )
  }
)

OptimizedInput.displayName = "OptimizedInput"

// Enhanced Textarea with similar optimizations
interface OptimizedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  isLoading?: boolean
  isValid?: boolean
  showValidation?: boolean
  helperText?: string
  onDebounceChange?: (value: string) => void
  debounceMs?: number
  maxLength?: number
  showCharCount?: boolean
}

export const OptimizedTextarea = forwardRef<HTMLTextAreaElement, OptimizedTextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    isLoading, 
    isValid, 
    showValidation = true,
    helperText,
    onDebounceChange,
    debounceMs = 300,
    maxLength,
    showCharCount = false,
    ...props 
  }, ref) => {
    const [charCount, setCharCount] = useState(0)
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout>()

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      setCharCount(value.length)
      
      // Call original onChange
      props.onChange?.(e)

      // Handle debounced change
      if (onDebounceChange) {
        if (debounceTimeout) {
          clearTimeout(debounceTimeout)
        }

        const timeout = setTimeout(() => {
          onDebounceChange(value)
        }, debounceMs)

        setDebounceTimeout(timeout)
      }
    }, [props.onChange, onDebounceChange, debounceMs, debounceTimeout])

    useEffect(() => {
      return () => {
        if (debounceTimeout) {
          clearTimeout(debounceTimeout)
        }
      }
    }, [debounceTimeout])

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          <Textarea
            ref={ref}
            className={cn(
              "transition-all duration-200",
              error && "border-red-500 focus:border-red-500",
              isValid && showValidation && "border-green-500 focus:border-green-500",
              isLoading && "pr-10",
              className
            )}
            maxLength={maxLength}
            {...props}
            onChange={handleChange}
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-3 top-3">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
          
          {/* Validation indicators */}
          {!isLoading && showValidation && (
            <>
              {isValid && (
                <div className="absolute right-3 top-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              )}
              {error && (
                <div className="absolute right-3 top-3">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Character count and helper text */}
        <div className="flex justify-between items-center">
          <div className={cn(
            "text-sm",
            error ? "text-red-500" : "text-gray-500"
          )}>
            {error || helperText}
          </div>
          
          {(showCharCount || maxLength) && (
            <div className={cn(
              "text-sm",
              maxLength && charCount > maxLength * 0.9 ? "text-orange-500" : "text-gray-400",
              maxLength && charCount >= maxLength ? "text-red-500" : ""
            )}>
              {charCount}{maxLength && `/${maxLength}`}
            </div>
          )}
        </div>
      </div>
    )
  }
)

OptimizedTextarea.displayName = "OptimizedTextarea"

// Enhanced Submit Button with loading states and double-submission prevention
interface OptimizedSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  hasSubmitted?: boolean
  loadingText?: string
  successText?: string
  preventDoubleSubmit?: boolean
  lastSubmissionTime?: number
  cooldownMs?: number
}

export const OptimizedSubmitButton = forwardRef<HTMLButtonElement, OptimizedSubmitButtonProps>(
  ({ 
    children,
    isLoading = false,
    hasSubmitted = false,
    loadingText = "Submitting...",
    successText = "Submitted!",
    preventDoubleSubmit = true,
    lastSubmissionTime = 0,
    cooldownMs = 1000,
    disabled,
    className,
    ...props 
  }, ref) => {
    const [showSuccess, setShowSuccess] = useState(false)
    const now = Date.now()
    const inCooldown = preventDoubleSubmit && (now - lastSubmissionTime) < cooldownMs

    useEffect(() => {
      if (hasSubmitted && !isLoading) {
        setShowSuccess(true)
        const timeout = setTimeout(() => setShowSuccess(false), 2000)
        return () => clearTimeout(timeout)
      }
    }, [hasSubmitted, isLoading])

    const isDisabled = disabled || isLoading || inCooldown

    return (
      <Button
        ref={ref}
        type="submit"
        disabled={isDisabled}
        className={cn(
          "transition-all duration-200",
          showSuccess && "bg-green-600 hover:bg-green-700",
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {showSuccess && <CheckCircle className="mr-2 h-4 w-4" />}
        
        {isLoading 
          ? loadingText 
          : showSuccess 
            ? successText 
            : children
        }
      </Button>
    )
  }
)

OptimizedSubmitButton.displayName = "OptimizedSubmitButton"

// Form field wrapper with consistent styling and error handling
interface FormFieldProps {
  children: React.ReactNode
  error?: string
  isRequired?: boolean
  className?: string
}

export const FormField: React.FC<FormFieldProps> = ({ 
  children, 
  error, 
  isRequired, 
  className 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
      {error && (
        <div className="text-sm text-red-500 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </div>
      )}
    </div>
  )
}

// Form section wrapper for better organization
interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  description, 
  children, 
  className 
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="border-b pb-2">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}