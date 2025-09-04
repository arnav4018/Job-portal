'use client'

import React from 'react'
import { ErrorBoundary } from './ErrorBoundary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, FileX, Database, Wifi, User } from 'lucide-react'

// Page-level error boundary
export const PageErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary
    level="page"
    componentName="Page"
    enableRetry={true}
    maxRetries={2}
    onError={(error, errorInfo, errorId) => {
      // Log page-level errors with higher priority
      console.error('Page Error:', { error, errorInfo, errorId })
    }}
  >
    {children}
  </ErrorBoundary>
)

// Form error boundary with specific error handling
export const FormErrorBoundary: React.FC<{ 
  children: React.ReactNode
  formName?: string
  onFormError?: (error: Error) => void
}> = ({ children, formName = 'Form', onFormError }) => (
  <ErrorBoundary
    level="component"
    componentName={formName}
    enableRetry={true}
    maxRetries={3}
    onError={(error, errorInfo, errorId) => {
      onFormError?.(error)
      // Could send form-specific error metrics
    }}
    fallback={
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileX className="w-5 h-5 text-red-500" />
            <span>Form Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            The {formName.toLowerCase()} encountered an error and couldn't be displayed.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Form
          </Button>
        </CardContent>
      </Card>
    }
  >
    {children}
  </ErrorBoundary>
)

// Data loading error boundary
export const DataErrorBoundary: React.FC<{ 
  children: React.ReactNode
  dataType?: string
  onRetry?: () => void
}> = ({ children, dataType = 'data', onRetry }) => (
  <ErrorBoundary
    level="section"
    componentName={`${dataType}Loader`}
    enableRetry={true}
    maxRetries={3}
    fallback={
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-red-500" />
            <span>Data Loading Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Failed to load {dataType}. This might be due to a network issue or server problem.
          </p>
          <div className="flex space-x-3">
            {onRetry && (
              <Button onClick={onRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Loading
              </Button>
            )}
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    }
  >
    {children}
  </ErrorBoundary>
)

// Network error boundary
export const NetworkErrorBoundary: React.FC<{ 
  children: React.ReactNode
  onNetworkError?: () => void
}> = ({ children, onNetworkError }) => (
  <ErrorBoundary
    level="section"
    componentName="NetworkComponent"
    enableRetry={true}
    maxRetries={5}
    onError={(error) => {
      // Check if it's a network-related error
      if (error.message.includes('fetch') || error.message.includes('network')) {
        onNetworkError?.()
      }
    }}
    fallback={
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wifi className="w-5 h-5 text-red-500" />
            <span>Connection Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Unable to connect to the server. Please check your internet connection.
          </p>
          <div className="flex space-x-3">
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    }
  >
    {children}
  </ErrorBoundary>
)

// User profile error boundary
export const ProfileErrorBoundary: React.FC<{ 
  children: React.ReactNode
  userId?: string
}> = ({ children, userId }) => (
  <ErrorBoundary
    level="section"
    componentName="UserProfile"
    enableRetry={true}
    maxRetries={2}
    onError={(error, errorInfo, errorId) => {
      // Log user-specific errors
      console.error('Profile Error:', { userId, error, errorInfo, errorId })
    }}
    fallback={
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-red-500" />
            <span>Profile Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Unable to load user profile. This might be a temporary issue.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload Profile
          </Button>
        </CardContent>
      </Card>
    }
  >
    {children}
  </ErrorBoundary>
)

// Chart/visualization error boundary
export const ChartErrorBoundary: React.FC<{ 
  children: React.ReactNode
  chartType?: string
}> = ({ children, chartType = 'chart' }) => (
  <ErrorBoundary
    level="component"
    componentName={`${chartType}Chart`}
    enableRetry={true}
    maxRetries={2}
    fallback={
      <Card className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-gray-600">Chart unavailable</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </Card>
    }
  >
    {children}
  </ErrorBoundary>
)

// Table error boundary
export const TableErrorBoundary: React.FC<{ 
  children: React.ReactNode
  tableName?: string
  onRetry?: () => void
}> = ({ children, tableName = 'table', onRetry }) => (
  <ErrorBoundary
    level="component"
    componentName={`${tableName}Table`}
    enableRetry={true}
    maxRetries={3}
    fallback={
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <h3 className="font-medium mb-2">Table Error</h3>
          <p className="text-gray-600 mb-4">
            The {tableName} couldn't be displayed due to an error.
          </p>
          <div className="flex justify-center space-x-3">
            {onRetry && (
              <Button onClick={onRetry} size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            )}
            <Button onClick={() => window.location.reload()} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    }
  >
    {children}
  </ErrorBoundary>
)

// Modal error boundary
export const ModalErrorBoundary: React.FC<{ 
  children: React.ReactNode
  onClose?: () => void
}> = ({ children, onClose }) => (
  <ErrorBoundary
    level="component"
    componentName="Modal"
    enableRetry={true}
    maxRetries={2}
    fallback={
      <div className="p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <h3 className="font-medium mb-2">Modal Error</h3>
        <p className="text-gray-600 mb-4">
          This dialog encountered an error and cannot be displayed.
        </p>
        <div className="flex justify-center space-x-3">
          <Button onClick={() => window.location.reload()} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reload
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          )}
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
)

// Async component error boundary with suspense-like behavior
export const AsyncErrorBoundary: React.FC<{ 
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error) => void
}> = ({ children, fallback, onError }) => (
  <ErrorBoundary
    level="component"
    componentName="AsyncComponent"
    enableRetry={true}
    maxRetries={3}
    onError={(error, errorInfo, errorId) => {
      onError?.(error)
    }}
    fallback={fallback || (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
          <p className="text-gray-600">Component failed to load</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
            className="mt-3"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )}
  >
    {children}
  </ErrorBoundary>
)