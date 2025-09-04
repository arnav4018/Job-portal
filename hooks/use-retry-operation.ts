/**
 * React Hook for User-Initiated Retry Operations
 * Provides UI state management for retry functionality
 */

import { useState, useCallback } from 'react';
import { RetryHandler, RetryOptions, RetryResult } from '@/lib/retry-handler';

export interface UseRetryOperationOptions extends RetryOptions {
  showRetryButton?: boolean;
  autoRetry?: boolean;
  retryButtonText?: string;
}

export interface RetryOperationState<T> {
  isLoading: boolean;
  isRetrying: boolean;
  error: any;
  data: T | null;
  attempts: number;
  canRetry: boolean;
  lastAttemptAt: Date | null;
}

export interface RetryOperationActions {
  execute: () => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
  cancel: () => void;
}

export function useRetryOperation<T>(
  operation: () => Promise<T>,
  options: UseRetryOperationOptions = {}
): [RetryOperationState<T>, RetryOperationActions] {
  const [state, setState] = useState<RetryOperationState<T>>({
    isLoading: false,
    isRetrying: false,
    error: null,
    data: null,
    attempts: 0,
    canRetry: false,
    lastAttemptAt: null,
  });

  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const executeOperation = useCallback(async (isRetry = false) => {
    // Cancel any ongoing operation
    if (abortController) {
      abortController.abort();
    }

    const newController = new AbortController();
    setAbortController(newController);

    setState(prev => ({
      ...prev,
      isLoading: true,
      isRetrying: isRetry,
      error: null,
      canRetry: false,
    }));

    try {
      const result = await RetryHandler.executeWithRetry(
        async () => {
          // Check if operation was cancelled
          if (newController.signal.aborted) {
            throw new Error('Operation cancelled');
          }
          return await operation();
        },
        {
          ...options,
          onRetry: (attempt, error) => {
            setState(prev => ({
              ...prev,
              attempts: attempt,
              lastAttemptAt: new Date(),
            }));
            options.onRetry?.(attempt, error);
          },
        }
      );

      if (newController.signal.aborted) {
        return;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isRetrying: false,
        data: result.success ? result.data! : null,
        error: result.success ? null : result.error,
        attempts: result.attempts,
        canRetry: !result.success && result.attempts <= (options.maxRetries || 3),
        lastAttemptAt: new Date(),
      }));
    } catch (error) {
      if (newController.signal.aborted) {
        return;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isRetrying: false,
        error,
        canRetry: true,
        lastAttemptAt: new Date(),
      }));
    } finally {
      setAbortController(null);
    }
  }, [operation, options, abortController]);

  const execute = useCallback(() => executeOperation(false), [executeOperation]);
  const retry = useCallback(() => executeOperation(true), [executeOperation]);

  const reset = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
    setState({
      isLoading: false,
      isRetrying: false,
      error: null,
      data: null,
      attempts: 0,
      canRetry: false,
      lastAttemptAt: null,
    });
  }, [abortController]);

  const cancel = useCallback(() => {
    if (abortController) {
      abortController.abort();
    }
    setState(prev => ({
      ...prev,
      isLoading: false,
      isRetrying: false,
    }));
  }, [abortController]);

  return [
    state,
    {
      execute,
      retry,
      reset,
      cancel,
    },
  ];
}

/**
 * Specialized hook for API operations with retry
 */
export function useApiRetry<T>(
  apiCall: () => Promise<T>,
  options: UseRetryOperationOptions = {}
) {
  return useRetryOperation(apiCall, {
    maxRetries: 3,
    baseDelay: 1000,
    retryCondition: (error) => {
      return error?.status >= 500 || error?.code === 'NETWORK_ERROR';
    },
    ...options,
  });
}

/**
 * Hook for authentication operations with retry
 */
export function useAuthRetry<T>(
  authOperation: () => Promise<T>,
  options: UseRetryOperationOptions = {}
) {
  return useRetryOperation(authOperation, {
    maxRetries: 2,
    baseDelay: 2000,
    retryCondition: (error) => {
      return error?.status === 503 || error?.code === 'SERVICE_UNAVAILABLE';
    },
    ...options,
  });
}