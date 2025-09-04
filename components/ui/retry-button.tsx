/**
 * Retry Button Component
 * Provides user-friendly retry functionality with loading states
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RetryButtonProps {
  onRetry: () => void | Promise<void>;
  isRetrying?: boolean;
  disabled?: boolean;
  attempts?: number;
  maxAttempts?: number;
  lastError?: any;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  children?: React.ReactNode;
  showAttempts?: boolean;
  showLastError?: boolean;
}

export function RetryButton({
  onRetry,
  isRetrying = false,
  disabled = false,
  attempts = 0,
  maxAttempts = 3,
  lastError,
  variant = 'outline',
  size = 'default',
  className,
  children,
  showAttempts = true,
  showLastError = false,
}: RetryButtonProps) {
  const handleRetry = async () => {
    try {
      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const isMaxAttemptsReached = attempts >= maxAttempts;
  const buttonDisabled = disabled || isRetrying || isMaxAttemptsReached;

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        onClick={handleRetry}
        disabled={buttonDisabled}
        variant={variant}
        size={size}
        className={cn(
          'flex items-center gap-2',
          isRetrying && 'cursor-not-allowed',
          className
        )}
      >
        <RefreshCw 
          className={cn(
            'h-4 w-4',
            isRetrying && 'animate-spin'
          )} 
        />
        {children || (isRetrying ? 'Retrying...' : 'Try Again')}
      </Button>

      {showAttempts && attempts > 0 && (
        <div className="text-sm text-muted-foreground">
          {isMaxAttemptsReached ? (
            <span className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-3 w-3" />
              Max attempts reached ({attempts}/{maxAttempts})
            </span>
          ) : (
            <span>
              Attempt {attempts}/{maxAttempts}
            </span>
          )}
        </div>
      )}

      {showLastError && lastError && (
        <div className="text-xs text-destructive max-w-md text-center">
          {lastError.message || 'An error occurred'}
        </div>
      )}
    </div>
  );
}

/**
 * Inline Retry Component for embedding in error states
 */
export interface InlineRetryProps {
  onRetry: () => void | Promise<void>;
  isRetrying?: boolean;
  error?: any;
  className?: string;
}

export function InlineRetry({
  onRetry,
  isRetrying = false,
  error,
  className,
}: InlineRetryProps) {
  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <span className="text-muted-foreground">
        {error?.message || 'Something went wrong.'}
      </span>
      <Button
        onClick={onRetry}
        disabled={isRetrying}
        variant="link"
        size="sm"
        className="h-auto p-0 text-primary hover:underline"
      >
        {isRetrying ? (
          <>
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Retrying...
          </>
        ) : (
          'Try again'
        )}
      </Button>
    </div>
  );
}

/**
 * Auto Retry Indicator Component
 */
export interface AutoRetryIndicatorProps {
  isRetrying: boolean;
  attempts: number;
  maxAttempts: number;
  nextRetryIn?: number;
  onCancel?: () => void;
  className?: string;
}

export function AutoRetryIndicator({
  isRetrying,
  attempts,
  maxAttempts,
  nextRetryIn,
  onCancel,
  className,
}: AutoRetryIndicatorProps) {
  if (!isRetrying) return null;

  return (
    <div className={cn(
      'flex items-center justify-between p-3 bg-muted rounded-md border',
      className
    )}>
      <div className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4 animate-spin text-primary" />
        <div className="text-sm">
          <div className="font-medium">Retrying operation...</div>
          <div className="text-muted-foreground">
            Attempt {attempts}/{maxAttempts}
            {nextRetryIn && ` • Next retry in ${Math.ceil(nextRetryIn / 1000)}s`}
          </div>
        </div>
      </div>
      
      {onCancel && (
        <Button
          onClick={onCancel}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
      )}
    </div>
  );
}