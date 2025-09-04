'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

// Base skeleton components
export const SkeletonText = ({ 
  lines = 1, 
  className,
  widths = ['100%']
}: { 
  lines?: number
  className?: string
  widths?: string[]
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className="h-4" 
          style={{ width: widths[i % widths.length] }}
        />
      ))}
    </div>
  )
}

export const SkeletonButton = ({ 
  className,
  size = 'default'
}: { 
  className?: string
  size?: 'sm' | 'default' | 'lg'
}) => {
  const heights = {
    sm: 'h-8',
    default: 'h-10',
    lg: 'h-12'
  }
  
  return (
    <Skeleton className={cn(heights[size], "w-24 rounded-md", className)} />
  )
}

export const SkeletonAvatar = ({ 
  size = 'default',
  className
}: { 
  size?: 'sm' | 'default' | 'lg'
  className?: string
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    default: 'w-10 h-10',
    lg: 'w-12 h-12'
  }
  
  return (
    <Skeleton className={cn(sizes[size], "rounded-full", className)} />
  )
}

export const SkeletonInput = ({ 
  className,
  hasLabel = false
}: { 
  className?: string
  hasLabel?: boolean
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {hasLabel && <Skeleton className="h-4 w-20" />}
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  )
}

export const SkeletonTextarea = ({ 
  className,
  hasLabel = false,
  rows = 4
}: { 
  className?: string
  hasLabel?: boolean
  rows?: number
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {hasLabel && <Skeleton className="h-4 w-20" />}
      <Skeleton className={`w-full rounded-md`} style={{ height: `${rows * 1.5 + 1}rem` }} />
    </div>
  )
}

export const SkeletonSelect = ({ 
  className,
  hasLabel = false
}: { 
  className?: string
  hasLabel?: boolean
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {hasLabel && <Skeleton className="h-4 w-20" />}
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  )
}

// Complex skeleton components for specific use cases

// Form skeleton
export const SkeletonForm = ({ 
  fields = 6,
  hasSubmitButton = true,
  className
}: { 
  fields?: number
  hasSubmitButton?: boolean
  className?: string
}) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: fields }).map((_, i) => (
          <SkeletonInput key={i} hasLabel />
        ))}
      </div>
      {hasSubmitButton && (
        <div className="flex justify-end">
          <SkeletonButton className="w-32" />
        </div>
      )}
    </div>
  )
}

// Card skeleton
export const SkeletonCard = ({ 
  hasHeader = true,
  hasAvatar = false,
  textLines = 3,
  hasActions = false,
  className
}: { 
  hasHeader?: boolean
  hasAvatar?: boolean
  textLines?: number
  hasActions?: boolean
  className?: string
}) => {
  return (
    <Card className={className}>
      {hasHeader && (
        <CardHeader>
          <div className="flex items-center space-x-3">
            {hasAvatar && <SkeletonAvatar />}
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent>
        <SkeletonText lines={textLines} widths={['100%', '90%', '75%']} />
        {hasActions && (
          <div className="flex space-x-2 mt-4">
            <SkeletonButton size="sm" />
            <SkeletonButton size="sm" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Table skeleton
export const SkeletonTable = ({ 
  rows = 5,
  columns = 4,
  hasHeader = true,
  className
}: { 
  rows?: number
  columns?: number
  hasHeader?: boolean
  className?: string
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {hasHeader && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 w-full" />
          ))}
        </div>
      ))}
    </div>
  )
}

// List skeleton
export const SkeletonList = ({ 
  items = 5,
  hasAvatar = false,
  hasActions = false,
  className
}: { 
  items?: number
  hasAvatar?: boolean
  hasActions?: boolean
  className?: string
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
          {hasAvatar && <SkeletonAvatar />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          {hasActions && (
            <div className="flex space-x-2">
              <SkeletonButton size="sm" className="w-16" />
              <SkeletonButton size="sm" className="w-16" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Navigation skeleton
export const SkeletonNavigation = ({ 
  items = 5,
  className
}: { 
  items?: number
  className?: string
}) => {
  return (
    <nav className={cn("space-y-2", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </nav>
  )
}

// Dashboard skeleton
export const SkeletonDashboard = ({ className }: { className?: string }) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <SkeletonButton />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonCard hasHeader textLines={5} />
        </div>
        <div>
          <SkeletonList items={4} hasAvatar />
        </div>
      </div>
    </div>
  )
}

// Job listing skeleton
export const SkeletonJobCard = ({ className }: { className?: string }) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <SkeletonButton size="sm" />
          </div>

          {/* Details */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Description */}
          <SkeletonText lines={2} widths={['100%', '80%']} />

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-16 rounded-full" />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Skeleton className="h-4 w-24" />
            <div className="flex space-x-2">
              <SkeletonButton size="sm" className="w-20" />
              <SkeletonButton size="sm" className="w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Profile skeleton
export const SkeletonProfile = ({ className }: { className?: string }) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <SkeletonAvatar size="lg" className="w-24 h-24" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex space-x-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <SkeletonButton />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonCard hasHeader textLines={4} />
          <SkeletonCard hasHeader textLines={3} />
        </div>
        <div className="space-y-6">
          <SkeletonCard hasHeader textLines={2} />
          <SkeletonList items={3} />
        </div>
      </div>
    </div>
  )
}