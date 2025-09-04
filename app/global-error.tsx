/**
 * Global Error Page for 500 Server Errors
 * Handles unexpected errors with recovery options
 */

'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { RetryButton } from '@/components/ui/retry-button';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Global error occurred:', error);
    
    // Report to error tracking service
    if (typeof window !== 'undefined') {
      // You can integrate with services like Sentry here
      // Sentry.captureException(error);
    }
  }, [error]);

  const handleReportError = () => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Copy error details to clipboard for easy reporting
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
    alert('Error details copied to clipboard. Please include this when contacting support.');
  };

  const handleRefreshPage = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
          <div className="max-w-2xl w-full space-y-6">
            {/* Error Display */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <AlertTriangle className="h-24 w-24 text-destructive" />
                  <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    500
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Something went wrong</h1>
                <p className="text-xl text-muted-foreground">
                  We encountered an unexpected error. Our team has been notified.
                </p>
              </div>
            </div>

            {/* Error Details Card */}
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Bug className="h-5 w-5" />
                  Error Details
                </CardTitle>
                <CardDescription>
                  Technical information about what went wrong
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-sm font-mono break-all">
                    {error.message || 'An unexpected error occurred'}
                  </div>
                  {error.digest && (
                    <div className="text-xs text-muted-foreground mt-2">
                      Error ID: {error.digest}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recovery Options */}
            <Card>
              <CardHeader>
                <CardTitle>Recovery Options</CardTitle>
                <CardDescription>
                  Try these options to resolve the issue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {/* Retry Button */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Try Again</div>
                      <div className="text-sm text-muted-foreground">
                        Attempt to reload the current page
                      </div>
                    </div>
                    <RetryButton
                      onRetry={reset}
                      variant="outline"
                      size="sm"
                    >
                      Retry
                    </RetryButton>
                  </div>

                  {/* Refresh Page */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Refresh Page</div>
                      <div className="text-sm text-muted-foreground">
                        Reload the entire page from scratch
                      </div>
                    </div>
                    <Button
                      onClick={handleRefreshPage}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </Button>
                  </div>

                  {/* Go Home */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Go to Homepage</div>
                      <div className="text-sm text-muted-foreground">
                        Return to the main page
                      </div>
                    </div>
                    <Button
                      onClick={handleGoHome}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Home className="h-4 w-4" />
                      Home
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Section */}
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h3 className="font-semibold">Need Help?</h3>
                  <p className="text-sm text-muted-foreground">
                    If the problem persists, please contact our support team with the error details.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={handleReportError}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Bug className="h-4 w-4" />
                      Copy Error Details
                    </Button>
                    <Button
                      onClick={() => window.open('/contact', '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      Contact Support
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </body>
    </html>
  );
}