/**
 * Error Boundary Component
 * Catches and handles React component errors with recovery options
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service
    if (typeof window !== 'undefined') {
      // You can integrate with services like Sentry here
      // Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <div className="max-w-lg w-full space-y-6">
            {/* Error Display */}
            <div className="text-center space-y-4">
              <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
                <p className="text-muted-foreground">
                  This component encountered an unexpected error.
                </p>
              </div>
            </div>

            {/* Error Message */}
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive text-lg">
                  <Bug className="h-5 w-5" />
                  Error Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-sm font-medium text-destructive">
                    {this.state.error?.name || 'Error'}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {this.state.error?.message || 'An unexpected error occurred'}
                  </div>
                </div>

                {/* Error Details Toggle */}
                {(this.props.showErrorDetails || process.env.NODE_ENV === 'development') && (
                  <div className="space-y-2">
                    <Button
                      onClick={this.toggleDetails}
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-xs"
                    >
                      {this.state.showDetails ? (
                        <>
                          <ChevronUp className="h-3 w-3" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" />
                          Show Details
                        </>
                      )}
                    </Button>

                    {this.state.showDetails && (
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="text-xs font-mono whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                          {this.state.error?.stack}
                        </div>
                        {this.state.errorInfo && (
                          <div className="mt-2 pt-2 border-t">
                            <div className="text-xs font-mono whitespace-pre-wrap break-all max-h-20 overflow-y-auto">
                              {this.state.errorInfo.componentStack}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recovery Actions */}
            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={this.handleRefresh}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Page
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;