/**
 * Enhanced API Client with Retry Mechanisms
 * Provides robust API calls with automatic retry and error handling
 */

import { RetryHandler, RetryOptions } from './retry-handler';

export interface ApiClientOptions {
  baseUrl?: string;
  timeout?: number;
  retryOptions?: RetryOptions;
  defaultHeaders?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface ApiError extends Error {
  status?: number;
  statusText?: string;
  code?: string;
  response?: Response;
}

export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private retryOptions: RetryOptions;
  private defaultHeaders: Record<string, string>;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || '';
    this.timeout = options.timeout || 10000;
    this.retryOptions = options.retryOptions || {
      maxRetries: 3,
      baseDelay: 1000,
      retryCondition: (error: ApiError) => {
        return (
          error.status === undefined || // Network errors
          error.status >= 500 || // Server errors
          error.status === 408 || // Request timeout
          error.status === 429    // Rate limit (with backoff)
        );
      },
    };
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.defaultHeaders,
    };
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    url: string,
    options: RequestInit = {},
    retryOptions?: RetryOptions
  ): Promise<ApiResponse<T>> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    const controller = new AbortController();
    
    // Set up timeout
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      signal: controller.signal,
    };

    const operation = async (): Promise<ApiResponse<T>> => {
      try {
        const response = await fetch(fullUrl, requestOptions);
        clearTimeout(timeoutId);

        if (!response.ok) {
          const error: ApiError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          error.status = response.status;
          error.statusText = response.statusText;
          error.response = response;
          error.code = response.status >= 500 ? 'SERVER_ERROR' : 'CLIENT_ERROR';
          throw error;
        }

        let data: T;
        const contentType = response.headers.get('content-type');
        
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text() as unknown as T;
        }

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            const timeoutError: ApiError = new Error('Request timeout');
            timeoutError.code = 'TIMEOUT';
            throw timeoutError;
          }
          
          if (error.message.includes('fetch')) {
            const networkError: ApiError = new Error('Network error');
            networkError.code = 'NETWORK_ERROR';
            throw networkError;
          }
        }
        
        throw error;
      }
    };

    const finalRetryOptions = { ...this.retryOptions, ...retryOptions };
    const result = await RetryHandler.executeWithRetry(operation, finalRetryOptions);

    if (result.success) {
      return result.data!;
    }

    throw result.error;
  }

  /**
   * GET request with retry
   */
  async get<T = any>(url: string, options?: RequestInit, retryOptions?: RetryOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: 'GET' }, retryOptions);
  }

  /**
   * POST request with retry
   */
  async post<T = any>(
    url: string,
    data?: any,
    options?: RequestInit,
    retryOptions?: RetryOptions
  ): Promise<ApiResponse<T>> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.makeRequest<T>(url, { ...options, method: 'POST', body }, retryOptions);
  }

  /**
   * PUT request with retry
   */
  async put<T = any>(
    url: string,
    data?: any,
    options?: RequestInit,
    retryOptions?: RetryOptions
  ): Promise<ApiResponse<T>> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.makeRequest<T>(url, { ...options, method: 'PUT', body }, retryOptions);
  }

  /**
   * DELETE request with retry
   */
  async delete<T = any>(url: string, options?: RequestInit, retryOptions?: RetryOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...options, method: 'DELETE' }, retryOptions);
  }

  /**
   * PATCH request with retry
   */
  async patch<T = any>(
    url: string,
    data?: any,
    options?: RequestInit,
    retryOptions?: RetryOptions
  ): Promise<ApiResponse<T>> {
    const body = data ? JSON.stringify(data) : undefined;
    return this.makeRequest<T>(url, { ...options, method: 'PATCH', body }, retryOptions);
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authentication token
   */
  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Update default headers
   */
  setHeaders(headers: Record<string, string>) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }
}

// Default API client instance
export const apiClient = new ApiClient({
  timeout: 15000,
  retryOptions: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    onRetry: (attempt, error) => {
      console.warn(`API retry attempt ${attempt}:`, error.message);
    },
  },
});

// Specialized clients for different services
export const authApiClient = new ApiClient({
  timeout: 10000,
  retryOptions: {
    maxRetries: 2,
    baseDelay: 2000,
    retryCondition: (error: ApiError) => {
      // Only retry on server errors for auth
      return error.status === undefined || error.status >= 500;
    },
  },
});

export const uploadApiClient = new ApiClient({
  timeout: 30000, // Longer timeout for uploads
  retryOptions: {
    maxRetries: 2,
    baseDelay: 3000,
  },
  defaultHeaders: {}, // No default content-type for uploads
});