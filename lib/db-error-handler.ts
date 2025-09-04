import { Prisma } from '@prisma/client'

// Database error types
export enum DatabaseErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONSTRAINT_ERROR = 'CONSTRAINT_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Enhanced database error class
export class DatabaseError extends Error {
  public readonly type: DatabaseErrorType
  public readonly originalError?: Error
  public readonly query?: string
  public readonly retryable: boolean

  constructor(
    message: string,
    type: DatabaseErrorType,
    originalError?: Error,
    query?: string,
    retryable = false
  ) {
    super(message)
    this.name = 'DatabaseError'
    this.type = type
    this.originalError = originalError
    this.query = query
    this.retryable = retryable
  }
}

// Database error handler
export class DatabaseErrorHandler {
  static handle(error: unknown, query?: string): DatabaseError {
    if (error instanceof DatabaseError) {
      return error
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return this.handlePrismaKnownError(error, query)
    }

    if (error instanceof Prisma.PrismaClientUnknownRequestError) {
      return this.handlePrismaUnknownError(error, query)
    }

    if (error instanceof Prisma.PrismaClientRustPanicError) {
      return this.handlePrismaRustPanicError(error, query)
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return this.handlePrismaInitializationError(error, query)
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return this.handlePrismaValidationError(error, query)
    }

    // Handle timeout errors
    if (error instanceof Error && error.message.includes('timeout')) {
      return new DatabaseError(
        'Database query timed out',
        DatabaseErrorType.TIMEOUT_ERROR,
        error,
        query,
        true // Timeout errors are retryable
      )
    }

    // Handle connection errors
    if (error instanceof Error && (
      error.message.includes('connection') ||
      error.message.includes('ECONNREFUSED') ||
      error.message.includes('ENOTFOUND')
    )) {
      return new DatabaseError(
        'Database connection failed',
        DatabaseErrorType.CONNECTION_ERROR,
        error,
        query,
        true // Connection errors are retryable
      )
    }

    // Unknown error
    return new DatabaseError(
      error instanceof Error ? error.message : 'Unknown database error',
      DatabaseErrorType.UNKNOWN_ERROR,
      error instanceof Error ? error : undefined,
      query,
      false
    )
  }

  private static handlePrismaKnownError(
    error: Prisma.PrismaClientKnownRequestError,
    query?: string
  ): DatabaseError {
    switch (error.code) {
      case 'P2002':
        return new DatabaseError(
          'Unique constraint violation',
          DatabaseErrorType.CONSTRAINT_ERROR,
          error,
          query,
          false
        )
      
      case 'P2025':
        return new DatabaseError(
          'Record not found',
          DatabaseErrorType.NOT_FOUND_ERROR,
          error,
          query,
          false
        )
      
      case 'P2003':
        return new DatabaseError(
          'Foreign key constraint violation',
          DatabaseErrorType.CONSTRAINT_ERROR,
          error,
          query,
          false
        )
      
      case 'P2024':
        return new DatabaseError(
          'Connection timeout',
          DatabaseErrorType.TIMEOUT_ERROR,
          error,
          query,
          true
        )
      
      default:
        return new DatabaseError(
          `Database error: ${error.message}`,
          DatabaseErrorType.UNKNOWN_ERROR,
          error,
          query,
          false
        )
    }
  }

  private static handlePrismaUnknownError(
    error: Prisma.PrismaClientUnknownRequestError,
    query?: string
  ): DatabaseError {
    return new DatabaseError(
      'Unknown database request error',
      DatabaseErrorType.UNKNOWN_ERROR,
      error,
      query,
      true // Unknown errors might be retryable
    )
  }

  private static handlePrismaRustPanicError(
    error: Prisma.PrismaClientRustPanicError,
    query?: string
  ): DatabaseError {
    return new DatabaseError(
      'Database engine panic',
      DatabaseErrorType.UNKNOWN_ERROR,
      error,
      query,
      false // Rust panics are not retryable
    )
  }

  private static handlePrismaInitializationError(
    error: Prisma.PrismaClientInitializationError,
    query?: string
  ): DatabaseError {
    return new DatabaseError(
      'Database initialization failed',
      DatabaseErrorType.CONNECTION_ERROR,
      error,
      query,
      true // Initialization errors might be retryable
    )
  }

  private static handlePrismaValidationError(
    error: Prisma.PrismaClientValidationError,
    query?: string
  ): DatabaseError {
    return new DatabaseError(
      'Database validation error',
      DatabaseErrorType.VALIDATION_ERROR,
      error,
      query,
      false // Validation errors are not retryable
    )
  }
}

// Retry mechanism for database operations
export class DatabaseRetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 10000
  ): Promise<T> {
    let lastError: DatabaseError | undefined

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        const dbError = DatabaseErrorHandler.handle(error)
        lastError = dbError

        // Don't retry if error is not retryable
        if (!dbError.retryable || attempt === maxRetries) {
          throw dbError
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelayMs * Math.pow(2, attempt),
          maxDelayMs
        )

        console.warn(
          `Database operation failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms:`,
          dbError.message
        )

        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }
}

// Graceful error handling wrapper
export function withDatabaseErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      const dbError = DatabaseErrorHandler.handle(error)
      
      // Log error for monitoring
      console.error('Database operation failed:', {
        type: dbError.type,
        message: dbError.message,
        retryable: dbError.retryable,
        query: dbError.query,
        originalError: dbError.originalError?.message,
      })

      throw dbError
    }
  }
}