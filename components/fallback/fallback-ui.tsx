/**
 * Fallback UI Components for Graceful Degradation
 * Provides alternative interfaces when primary components fail
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Wifi, WifiOff, RefreshCw, Eye, EyeOff } from 'lucide-react';

// Generic fallback for any component
export interface FallbackUIProps {
  error?: Error;
  retry?: () => void;
  isRetrying?: boolean;
  componentName?: string;
  children?: React.ReactNode;
}

export function FallbackUI({ 
  error, 
  retry, 
  isRetrying = false, 
  componentName = 'Component',
  children 
}: FallbackUIProps) {
  return (
    <Card className="border-dashed border-muted-foreground/30">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-3" />
        <h3 className="font-medium text-sm mb-1">
          {componentName} Unavailable
        </h3>
        <p className="text-xs text-muted-foreground mb-4 max-w-sm">
          {error?.message || 'This component failed to load properly.'}
        </p>
        
        {children}
        
        {retry && (
          <Button
            onClick={retry}
            disabled={isRetrying}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Skeleton fallback for loading states
export function SkeletonFallback({ 
  lines = 3, 
  showAvatar = false,
  className = '' 
}: { 
  lines?: number; 
  showAvatar?: boolean;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-3">
        {showAvatar && (
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <Skeleton 
              key={i} 
              className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} 
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Offline mode fallback
export function OfflineFallback({ 
  onRetry, 
  isRetrying = false,
  showCachedData = false,
  cachedDataAge 
}: {
  onRetry?: () => void;
  isRetrying?: boolean;
  showCachedData?: boolean;
  cachedDataAge?: string;
}) {
  return (
    <Card className="border-yellow-200 bg-yellow-50/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <WifiOff className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-sm text-yellow-800">
              You're offline
            </h3>
            <p className="text-xs text-yellow-700 mt-1">
              {showCachedData 
                ? `Showing cached data${cachedDataAge ? ` from ${cachedDataAge}` : ''}`
                : 'Some features may be limited while offline'
              }
            </p>
            
            {onRetry && (
              <Button
                onClick={onRetry}
                disabled={isRetrying}
                variant="outline"
                size="sm"
                className="mt-2 text-yellow-800 border-yellow-300 hover:bg-yellow-100"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Checking...' : 'Check Connection'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Reduced functionality mode
export function ReducedModeFallback({ 
  missingFeatures = [],
  availableFeatures = [],
  onUpgrade,
}: {
  missingFeatures?: string[];
  availableFeatures?: string[];
  onUpgrade?: () => void;
}) {
  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-blue-800">
          <EyeOff className="h-4 w-4" />
          Limited Mode
        </CardTitle>
        <CardDescription className="text-xs text-blue-700">
          Some features are temporarily unavailable
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {availableFeatures.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-blue-800 mb-2">Available:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              {availableFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Eye className="h-3 w-3" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {missingFeatures.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-blue-800 mb-2">Unavailable:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              {missingFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <EyeOff className="h-3 w-3" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {onUpgrade && (
          <Button
            onClick={onUpgrade}
            variant="outline"
            size="sm"
            className="w-full text-blue-800 border-blue-300 hover:bg-blue-100"
          >
            Try Full Mode
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Data table fallback
export function TableFallback({ 
  columns = 3, 
  rows = 5,
  error,
  onRetry,
  isRetrying = false 
}: {
  columns?: number;
  rows?: number;
  error?: Error;
  onRetry?: () => void;
  isRetrying?: boolean;
}) {
  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-2">Unable to load data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || 'Failed to fetch table data'}
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Loading...' : 'Retry'}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="space-y-0">
          {/* Header */}
          <div className="flex border-b p-4 space-x-4">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
          
          {/* Rows */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex p-4 space-x-4 border-b last:border-b-0">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  className={`h-4 ${colIndex === 0 ? 'w-24' : 'flex-1'}`} 
                />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Form fallback
export function FormFallback({ 
  fields = 3,
  error,
  onRetry,
  isRetrying = false 
}: {
  fields?: number;
  error?: Error;
  onRetry?: () => void;
  isRetrying?: boolean;
}) {
  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium mb-2">Form unavailable</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error.message || 'Unable to load the form'}
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Loading...' : 'Retry'}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}