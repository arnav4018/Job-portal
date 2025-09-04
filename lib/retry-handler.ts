/**
 * Retry Handler with Exponential Backoff
 * Implements retry mechanisms for failed operations with configurable strategies
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  attempts: number;
}

export class RetryHandler {
  private static defaultOptions: Required<RetryOptions> = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryCondition: (error: any) => {
      // Retry on network errors, timeouts, and 5xx server errors
      return (
        error?.code === 'NETWORK_ERROR' ||
        error?.code === 'TIMEOUT' ||
        (error?.status >= 500 && error?.status < 600) ||
        error?.name === 'NetworkError' ||
        error?.message?.includes('fetch')
      );
    },
    onRetry: () => {},
  };

  /**
   * Execute operation with retry logic and exponential backoff
   */
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    const config = { ...this.defaultOptions, ...options };
    let lastError: any;
    let attempts = 0;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      attempts = attempt + 1;
      
      try {
        const result = await operation();
        return {
          success: true,
          data: result,
          attempts,
        };
      } catch (error) {
        lastError = error;
        
        // Don't retry if this is the last attempt or retry condition fails
        if (attempt === config.maxRetries || !config.retryCondition(error)) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelay
        );

        // Add jitter to prevent thundering herd
        const jitteredDelay = delay + Math.random() * 1000;

        config.onRetry(attempt + 1, error);
        
        await this.sleep(jitteredDelay);
      }
    }

    return {
      success: false,
      error: lastError,
      attempts,
    };
  }

  /**
   * Create a retry wrapper for API calls
   */
  static createApiRetryWrapper(baseOptions: RetryOptions = {}) {
    return async function retryApiCall<T>(
      apiCall: () => Promise<T>,
      callOptions: RetryOptions = {}
    ): Promise<T> {
      const options = { ...baseOptions, ...callOptions };
      const result = await RetryHandler.executeWithRetry(apiCall, options);
      
      if (result.success) {
        return result.data!;
      }
      
      throw result.error;
    };
  }

  /**
   * Sleep utility for delays
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Pre-configured retry handlers for common scenarios
 */
export const retryHandlers = {
  // For API calls with network retry
  api: RetryHandler.createApiRetryWrapper({
    maxRetries: 3,
    baseDelay: 1000,
    retryCondition: (error) => {
      return error?.status >= 500 || error?.code === 'NETWORK_ERROR';
    },
  }),

  // For database operations
  database: RetryHandler.createApiRetryWrapper({
    maxRetries: 2,
    baseDelay: 500,
    retryCondition: (error) => {
      return error?.code === 'CONNECTION_ERROR' || error?.code === 'TIMEOUT';
    },
  }),

  // For authentication operations
  auth: RetryHandler.createApiRetryWrapper({
    maxRetries: 1,
    baseDelay: 2000,
    retryCondition: (error) => {
      return error?.status === 503 || error?.code === 'SERVICE_UNAVAILABLE';
    },
  }),
};