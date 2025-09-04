'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { 
  SkeletonCard, 
  SkeletonList, 
  SkeletonTable, 
  SkeletonForm,
  SkeletonDashboard,
  SkeletonJobCard,
  SkeletonProfile
} from '@/components/ui/skeleton-loaders'

// Basic loading spinner
export const LoadingSpinner = ({ 
  size = 'default',
  className 
}: { 
  size?: 'sm' | 'default' | 'lg'
  className?: string 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <Loader2 className={cn('animate-spin', sizes[size], className)} />
  )
}

// Loading overlay
export const LoadingOverlay = ({ 
  isLoading,
  children,
  message = 'Loading...',
  className
}: {
  isLoading: boolean
  children: React.ReactNode
  message?: string
  className?: string
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Progressive loading indicator
export const ProgressiveLoader = ({
  progress,
  stage,
  stages = [],
  className
}: {
  progress: number
  stage: string
  stages?: string[]
  className?: string
}) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Loading...</h3>
            <span className="text-sm text-gray-500">{progress}%</span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="flex items-center space-x-2">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-gray-600">{stage}</span>
          </div>

          {stages.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Stages:</p>
              <div className="grid grid-cols-2 gap-2">
                {stages.map((stageName, index) => (
                  <div 
                    key={stageName}
                    className={cn(
                      'text-xs px-2 py-1 rounded',
                      stage === stageName 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {index + 1}. {stageName}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Error state with retry
export const ErrorState = ({
  error,
  onRetry,
  title = 'Something went wrong',
  className
}: {
  error: string
  onRetry?: () => void
  title?: string
  className?: string
}) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Success state
export const SuccessState = ({
  message = 'Success!',
  description,
  onContinue,
  className
}: {
  message?: string
  description?: string
  onContinue?: () => void
  className?: string
}) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <CheckCircle className="w-12 h-12 text-green-500" />
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">{message}</h3>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>
          {onContinue && (
            <Button onClick={onContinue} size="sm">
              Continue
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Loading button
export const LoadingButton = ({
  isLoading,
  children,
  loadingText = 'Loading...',
  disabled,
  ...props
}: {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  disabled?: boolean
} & React.ComponentProps<typeof Button>) => {
  return (
    <Button disabled={disabled || isLoading} {...props}>
      {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
      {isLoading ? loadingText : children}
    </Button>
  )
}

// Skeleton wrapper that shows skeleton while loading
export const SkeletonWrapper = ({
  isLoading,
  children,
  skeleton,
  className
}: {
  isLoading: boolean
  children: React.ReactNode
  skeleton: React.ReactNode
  className?: string
}) => {
  return (
    <div className={className}>
      {isLoading ? skeleton : children}
    </div>
  )
}

// Predefined skeleton wrappers for common components
export const LoadingCard = ({ 
  isLoading, 
  children, 
  hasHeader = true,
  hasAvatar = false,
  textLines = 3,
  className 
}: {
  isLoading: boolean
  children: React.ReactNode
  hasHeader?: boolean
  hasAvatar?: boolean
  textLines?: number
  className?: string
}) => (
  <SkeletonWrapper
    isLoading={isLoading}
    skeleton={<SkeletonCard hasHeader={hasHeader} hasAvatar={hasAvatar} textLines={textLines} />}
    className={className}
  >
    {children}
  </SkeletonWrapper>
)

export const LoadingList = ({ 
  isLoading, 
  children, 
  items = 5,
  hasAvatar = false,
  hasActions = false,
  className 
}: {
  isLoading: boolean
  children: React.ReactNode
  items?: number
  hasAvatar?: boolean
  hasActions?: boolean
  className?: string
}) => (
  <SkeletonWrapper
    isLoading={isLoading}
    skeleton={<SkeletonList items={items} hasAvatar={hasAvatar} hasActions={hasActions} />}
    className={className}
  >
    {children}
  </SkeletonWrapper>
)

export const LoadingTable = ({ 
  isLoading, 
  children, 
  rows = 5,
  columns = 4,
  hasHeader = true,
  className 
}: {
  isLoading: boolean
  children: React.ReactNode
  rows?: number
  columns?: number
  hasHeader?: boolean
  className?: string
}) => (
  <SkeletonWrapper
    isLoading={isLoading}
    skeleton={<SkeletonTable rows={rows} columns={columns} hasHeader={hasHeader} />}
    className={className}
  >
    {children}
  </SkeletonWrapper>
)

export const LoadingForm = ({ 
  isLoading, 
  children, 
  fields = 6,
  hasSubmitButton = true,
  className 
}: {
  isLoading: boolean
  children: React.ReactNode
  fields?: number
  hasSubmitButton?: boolean
  className?: string
}) => (
  <SkeletonWrapper
    isLoading={isLoading}
    skeleton={<SkeletonForm fields={fields} hasSubmitButton={hasSubmitButton} />}
    className={className}
  >
    {children}
  </SkeletonWrapper>
)

export const LoadingDashboard = ({ 
  isLoading, 
  children, 
  className 
}: {
  isLoading: boolean
  children: React.ReactNode
  className?: string
}) => (
  <SkeletonWrapper
    isLoading={isLoading}
    skeleton={<SkeletonDashboard />}
    className={className}
  >
    {children}
  </SkeletonWrapper>
)

export const LoadingJobCard = ({ 
  isLoading, 
  children, 
  className 
}: {
  isLoading: boolean
  children: React.ReactNode
  className?: string
}) => (
  <SkeletonWrapper
    isLoading={isLoading}
    skeleton={<SkeletonJobCard />}
    className={className}
  >
    {children}
  </SkeletonWrapper>
)

export const LoadingProfile = ({ 
  isLoading, 
  children, 
  className 
}: {
  isLoading: boolean
  children: React.ReactNode
  className?: string
}) => (
  <SkeletonWrapper
    isLoading={isLoading}
    skeleton={<SkeletonProfile />}
    className={className}
  >
    {children}
  </SkeletonWrapper>
)

// Lazy loading component with intersection observer
export const LazyLoadWrapper = ({
  children,
  skeleton,
  threshold = 0.1,
  rootMargin = '50px',
  className
}: {
  children: React.ReactNode
  skeleton?: React.ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
}) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [hasLoaded, setHasLoaded] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true)
          setHasLoaded(true)
        }
      },
      { threshold, rootMargin }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin, hasLoaded])

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : skeleton}
    </div>
  )
}