import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Error Handling Testing Suite
 * Tests error boundaries, recovery mechanisms, and error scenarios
 */

interface ErrorScenario {
  name: string
  errorType: 'network' | 'authentication' | 'validation' | 'component' | 'database'
  errorMessage: string
  recoverable: boolean
  expectedBehavior: 'retry' | 'fallback' | 'redirect' | 'display'
}

const ERROR_SCENARIOS: ErrorScenario[] = [
  {
    name: 'Network timeout',
    errorType: 'network',
    errorMessage: 'Request timeout',
    recoverable: true,
    expectedBehavior: 'retry'
  },
  {
    name: 'Authentication failure',
    errorType: 'authentication',
    errorMessage: 'Invalid credentials',
    recoverable: true,
    expectedBehavior: 'redirect'
  },
  {
    name: 'Form validation error',
    errorType: 'validation',
    errorMessage: 'Email is required',
    recoverable: true,
    expectedBehavior: 'display'
  },
  {
    name: 'Component render error',
    errorType: 'component',
    errorMessage: 'Cannot read property of undefined',
    recoverable: true,
    expectedBehavior: 'fallback'
  },
  {
    name: 'Database connection error',
    errorType: 'database',
    errorMessage: 'Connection refused',
    recoverable: true,
    expectedBehavior: 'retry'
  }
]

class ErrorHandler {
  private errorLog: Array<{ error: Error; timestamp: number; context: string }> = []
  private retryAttempts: Map<string, number> = new Map()
  private maxRetries = 3

  logError(error: Error, context: string): void {
    this.errorLog.push({
      error,
      timestamp: Date.now(),
      context
    })
  }

  async handleError(error: Error, context: string): Promise<{
    handled: boolean
    action: 'retry' | 'fallback' | 'redirect' | 'display'
    message: string
  }> {
    this.logError(error, context)

    // Determine error type and appropriate action
    if (error.message.includes('timeout') || error.message.includes('network')) {
      return this.handleNetworkError(error, context)
    }

    if (error.message.includes('authentication') || error.message.includes('credentials')) {
      return this.handleAuthError(error, context)
    }

    if (error.message.includes('validation') || error.message.includes('required')) {
      return this.handleValidationError(error, context)
    }

    if (error.message.includes('database') || error.message.includes('connection')) {
      return this.handleDatabaseError(error, context)
    }

    // Default component error handling
    return this.handleComponentError(error, context)
  }

  private async handleNetworkError(error: Error, context: string): Promise<any> {
    const retryKey = `${context}-network`
    const attempts = this.retryAttempts.get(retryKey) || 0

    if (attempts < this.maxRetries) {
      this.retryAttempts.set(retryKey, attempts + 1)
      return {
        handled: true,
        action: 'retry',
        message: `Network error occurred. Retrying... (${attempts + 1}/${this.maxRetries})`
      }
    }

    return {
      handled: true,
      action: 'fallback',
      message: 'Network error. Please check your connection and try again.'
    }
  }

  private async handleAuthError(error: Error, context: string): Promise<any> {
    return {
      handled: true,
      action: 'redirect',
      message: 'Authentication failed. Redirecting to login...'
    }
  }

  private async handleValidationError(error: Error, context: string): Promise<any> {
    return {
      handled: true,
      action: 'display',
      message: error.message
    }
  }

  private async handleDatabaseError(error: Error, context: string): Promise<any> {
    const retryKey = `${context}-database`
    const attempts = this.retryAttempts.get(retryKey) || 0

    if (attempts < this.maxRetries) {
      this.retryAttempts.set(retryKey, attempts + 1)
      return {
        handled: true,
        action: 'retry',
        message: `Database error. Retrying... (${attempts + 1}/${this.maxRetries})`
      }
    }

    return {
      handled: true,
      action: 'fallback',
      message: 'Service temporarily unavailable. Please try again later.'
    }
  }

  private async handleComponentError(error: Error, context: string): Promise<any> {
    return {
      handled: true,
      action: 'fallback',
      message: 'Something went wrong. Please refresh the page.'
    }
  }

  getErrorLog(): Array<{ error: Error; timestamp: number; context: string }> {
    return [...this.errorLog]
  }

  getRetryAttempts(context: string): number {
    return this.retryAttempts.get(context) || 0
  }

  resetRetryAttempts(context: string): void {
    this.retryAttempts.delete(context)
  }

  clearErrorLog(): void {
    this.errorLog = []
  }

  reset(): void {
    this.errorLog = []
    this.retryAttempts.clear()
  }
}

class RetryMechanism {
  private retryCount = 0
  private maxRetries = 3
  private baseDelay = 100

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await operation()
        this.retryCount = 0 // Reset on success
        return result
      } catch (error) {
        lastError = error as Error
        this.retryCount = attempt + 1

        if (attempt < this.maxRetries) {
          // Exponential backoff
          const delay = this.baseDelay * Math.pow(2, attempt)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError!
  }

  getRetryCount(): number {
    return this.retryCount
  }

  reset(): void {
    this.retryCount = 0
  }
}

describe('Error Handling Tests', () => {
  let errorHandler: ErrorHandler
  let retryMechanism: RetryMechanism

  beforeEach(() => {
    errorHandler = new ErrorHandler()
    retryMechanism = new RetryMechanism()
  })

  describe('Error Classification and Handling', () => {
    test.each(ERROR_SCENARIOS)(
      'should handle error scenario: $name',
      async (scenario) => {
        const error = new Error(scenario.errorMessage)
        const result = await errorHandler.handleError(error, 'test-context')

        expect(result.handled).toBe(true)
        expect(result.action).toBe(scenario.expectedBehavior)
        expect(result.message).toBeDefined()

        // Verify error was logged
        const errorLog = errorHandler.getErrorLog()
        expect(errorLog).toHaveLength(1)
        expect(errorLog[0].error.message).toBe(scenario.errorMessage)
        expect(errorLog[0].context).toBe('test-context')
      }
    )

    test('should handle unknown error types with fallback', async () => {
      const unknownError = new Error('Unknown error type')
      const result = await errorHandler.handleError(unknownError, 'unknown-context')

      expect(result.handled).toBe(true)
      expect(result.action).toBe('fallback')
      expect(result.message).toContain('Something went wrong')
    })
  })

  describe('Retry Mechanisms', () => {
    test('should retry failed operations with exponential backoff', async () => {
      let attemptCount = 0
      const failingOperation = async () => {
        attemptCount++
        if (attemptCount < 3) {
          throw new Error('Temporary failure')
        }
        return 'success'
      }

      const startTime = performance.now()
      const result = await retryMechanism.executeWithRetry(failingOperation, 'retry-test')
      const endTime = performance.now()

      expect(result).toBe('success')
      expect(attemptCount).toBe(3)
      expect(retryMechanism.getRetryCount()).toBe(0) // Reset on success

      // Should have taken time due to exponential backoff
      const totalTime = endTime - startTime
      expect(totalTime).toBeGreaterThan(300) // At least 100 + 200 ms delays
    })

    test('should fail after max retries exceeded', async () => {
      const alwaysFailingOperation = async () => {
        throw new Error('Persistent failure')
      }

      await expect(
        retryMechanism.executeWithRetry(alwaysFailingOperation, 'persistent-failure')
      ).rejects.toThrow('Persistent failure')

      expect(retryMechanism.getRetryCount()).toBe(4) // 3 retries + initial attempt
    })

    test('should handle network errors with retry logic', async () => {
      const networkError = new Error('Request timeout')
      
      // First few attempts should suggest retry
      for (let i = 0; i < 3; i++) {
        const result = await errorHandler.handleError(networkError, 'network-test')
        expect(result.action).toBe('retry')
        expect(result.message).toContain('Retrying')
      }

      // After max retries, should fallback
      const finalResult = await errorHandler.handleError(networkError, 'network-test')
      expect(finalResult.action).toBe('fallback')
      expect(finalResult.message).toContain('check your connection')
    })
  })

  describe('Error Boundaries', () => {
    test('should catch and handle component errors', async () => {
      const componentError = new Error('Cannot read property of undefined')
      const result = await errorHandler.handleError(componentError, 'component-render')

      expect(result.handled).toBe(true)
      expect(result.action).toBe('fallback')
      expect(result.message).toContain('refresh the page')
    })

    test('should provide fallback UI for component failures', async () => {
      const renderError = new Error('Component failed to render')
      const result = await errorHandler.handleError(renderError, 'ui-component')

      expect(result.action).toBe('fallback')
      expect(result.message).toBeDefined()

      // Verify error was logged with context
      const errorLog = errorHandler.getErrorLog()
      expect(errorLog[0].context).toBe('ui-component')
    })

    test('should handle nested component errors', async () => {
      const errors = [
        new Error('Parent component error'),
        new Error('Child component error'),
        new Error('Nested child error')
      ]

      for (const error of errors) {
        const result = await errorHandler.handleError(error, 'nested-components')
        expect(result.handled).toBe(true)
      }

      const errorLog = errorHandler.getErrorLog()
      expect(errorLog).toHaveLength(3)
    })
  })

  describe('Authentication Error Handling', () => {
    test('should handle authentication failures', async () => {
      const authError = new Error('Invalid credentials')
      const result = await errorHandler.handleError(authError, 'login-form')

      expect(result.action).toBe('redirect')
      expect(result.message).toContain('Redirecting to login')
    })

    test('should handle session expiry', async () => {
      const sessionError = new Error('Session expired')
      const result = await errorHandler.handleError(sessionError, 'protected-route')

      expect(result.action).toBe('redirect')
      expect(result.message).toContain('Authentication failed')
    })

    test('should handle permission denied errors', async () => {
      const permissionError = new Error('Access denied')
      const result = await errorHandler.handleError(permissionError, 'admin-panel')

      expect(result.handled).toBe(true)
      // Should be handled as component error (fallback)
      expect(['fallback', 'redirect']).toContain(result.action)
    })
  })

  describe('Database Error Handling', () => {
    test('should handle database connection errors with retry', async () => {
      const dbError = new Error('Connection refused')
      
      // Should retry initially
      const result1 = await errorHandler.handleError(dbError, 'db-query')
      expect(result1.action).toBe('retry')

      // After max retries, should fallback
      await errorHandler.handleError(dbError, 'db-query')
      await errorHandler.handleError(dbError, 'db-query')
      const finalResult = await errorHandler.handleError(dbError, 'db-query')
      expect(finalResult.action).toBe('fallback')
    })

    test('should handle query timeout errors', async () => {
      const timeoutError = new Error('Query timeout')
      const result = await errorHandler.handleError(timeoutError, 'slow-query')

      expect(result.action).toBe('retry')
      expect(result.message).toContain('Retrying')
    })
  })

  describe('Form Validation Error Handling', () => {
    test('should handle validation errors appropriately', async () => {
      const validationErrors = [
        new Error('Email is required'),
        new Error('Password must be at least 8 characters'),
        new Error('Invalid email format')
      ]

      for (const error of validationErrors) {
        const result = await errorHandler.handleError(error, 'form-validation')
        expect(result.action).toBe('display')
        expect(result.message).toBe(error.message)
      }
    })

    test('should handle multiple validation errors', async () => {
      const errors = [
        'Email is required',
        'Password is required',
        'Name is required'
      ]

      for (const errorMessage of errors) {
        const error = new Error(errorMessage)
        const result = await errorHandler.handleError(error, 'multi-field-form')
        expect(result.action).toBe('display')
      }

      const errorLog = errorHandler.getErrorLog()
      expect(errorLog).toHaveLength(3)
    })
  })

  describe('Error Recovery', () => {
    test('should reset retry attempts after successful operation', async () => {
      const context = 'recovery-test'
      
      // Simulate some failures
      const networkError = new Error('Network timeout')
      await errorHandler.handleError(networkError, context)
      await errorHandler.handleError(networkError, context)
      
      expect(errorHandler.getRetryAttempts(`${context}-network`)).toBe(2)
      
      // Reset and verify
      errorHandler.resetRetryAttempts(`${context}-network`)
      expect(errorHandler.getRetryAttempts(`${context}-network`)).toBe(0)
    })

    test('should provide recovery options for different error types', async () => {
      const errors = [
        { error: new Error('Network timeout'), expectedRecovery: 'retry' },
        { error: new Error('Invalid credentials'), expectedRecovery: 'redirect' },
        { error: new Error('Component failed'), expectedRecovery: 'fallback' }
      ]

      for (const { error, expectedRecovery } of errors) {
        const result = await errorHandler.handleError(error, 'recovery-options')
        expect(result.action).toBe(expectedRecovery)
      }
    })
  })

  describe('Error Logging and Monitoring', () => {
    test('should log all errors with context and timestamp', async () => {
      const errors = [
        { error: new Error('Error 1'), context: 'context-1' },
        { error: new Error('Error 2'), context: 'context-2' },
        { error: new Error('Error 3'), context: 'context-3' }
      ]

      for (const { error, context } of errors) {
        await errorHandler.handleError(error, context)
      }

      const errorLog = errorHandler.getErrorLog()
      expect(errorLog).toHaveLength(3)

      errorLog.forEach((logEntry, index) => {
        expect(logEntry.error.message).toBe(`Error ${index + 1}`)
        expect(logEntry.context).toBe(`context-${index + 1}`)
        expect(logEntry.timestamp).toBeGreaterThan(0)
      })
    })

    test('should maintain error log integrity under concurrent errors', async () => {
      const concurrentErrors = Array.from({ length: 10 }, (_, index) => 
        errorHandler.handleError(new Error(`Concurrent error ${index}`), `context-${index}`)
      )

      await Promise.all(concurrentErrors)

      const errorLog = errorHandler.getErrorLog()
      expect(errorLog).toHaveLength(10)

      // Verify all errors were logged
      const errorMessages = errorLog.map(entry => entry.error.message)
      for (let i = 0; i < 10; i++) {
        expect(errorMessages).toContain(`Concurrent error ${i}`)
      }
    })

    test('should clear error log when requested', () => {
      // Add some errors
      errorHandler.logError(new Error('Test error 1'), 'test')
      errorHandler.logError(new Error('Test error 2'), 'test')
      
      expect(errorHandler.getErrorLog()).toHaveLength(2)
      
      errorHandler.clearErrorLog()
      expect(errorHandler.getErrorLog()).toHaveLength(0)
    })
  })
})