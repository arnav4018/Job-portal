/**
 * Authentication Error Page Component
 * Handles authentication failures with recovery options
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, LogIn, RefreshCw, Home, AlertCircle } from 'lucide-react';
import { RetryButton } from '@/components/ui/retry-button';

export interface AuthErrorProps {
  error?: string;
  errorCode?: string;
  onRetry?: () => void | Promise<void>;
  isRetrying?: boolean;
}

export function AuthError({ 
  error = 'Authentication failed', 
  errorCode,
  onRetry,
  isRetrying = false 
}: AuthErrorProps) {
  const getErrorDetails = (code?: string) => {
    switch (code) {
      case 'INVALID_CREDENTIALS':
        return {
          title: 'Invalid Credentials',
          description: 'The email or password you entered is incorrect.',
          suggestions: ['Check your email and password', 'Try resetting your password'],
        };
      case 'ACCOUNT_LOCKED':
        return {
          title: 'Account Locked',
          description: 'Your account has been temporarily locked due to multiple failed login attempts.',
          suggestions: ['Wait 15 minutes and try again', 'Reset your password', 'Contact support'],
        };
      case 'SESSION_EXPIRED':
        return {
          title: 'Session Expired',
          description: 'Your session has expired. Please log in again.',
          suggestions: ['Log in with your credentials', 'Enable "Remember me" for longer sessions'],
        };
      case 'ACCOUNT_DISABLED':
        return {
          title: 'Account Disabled',
          description: 'Your account has been disabled. Please contact support.',
          suggestions: ['Contact support for assistance', 'Check your email for notifications'],
        };
      case 'NETWORK_ERROR':
        return {
          title: 'Connection Problem',
          description: 'Unable to connect to authentication service.',
          suggestions: ['Check your internet connection', 'Try again in a moment'],
        };
      default:
        return {
          title: 'Authentication Error',
          description: error || 'An authentication error occurred.',
          suggestions: ['Try logging in again', 'Check your credentials'],
        };
    }
  };

  const errorDetails = getErrorDetails(errorCode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Error Display */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Shield className="h-20 w-20 text-muted-foreground" />
              <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{errorDetails.title}</h1>
            <p className="text-muted-foreground">
              {errorDetails.description}
            </p>
          </div>
        </div>

        {/* Error Details */}
        {errorCode && (
          <Card className="border-destructive/20">
            <CardContent className="pt-4">
              <div className="text-sm">
                <div className="font-medium text-destructive mb-1">Error Code</div>
                <div className="font-mono text-xs bg-muted p-2 rounded">
                  {errorCode}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recovery Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What you can do</CardTitle>
            <CardDescription>
              Try these steps to resolve the authentication issue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {errorDetails.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {onRetry && (
            <RetryButton
              onRetry={onRetry}
              isRetrying={isRetrying}
              className="w-full"
              variant="default"
            >
              Try Again
            </RetryButton>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Link href="/auth/login">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Log In
              </Button>
            </Link>
            
            <Link href="/auth/forgot-password">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Reset Password
              </Button>
            </Link>
          </div>

          <Link href="/">
            <Button variant="ghost" className="w-full flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go to Homepage
            </Button>
          </Link>
        </div>

        {/* Support */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="text-center space-y-2">
              <h3 className="font-medium text-sm">Still having trouble?</h3>
              <p className="text-xs text-muted-foreground">
                Our support team is here to help
              </p>
              <Link href="/contact">
                <Button variant="outline" size="sm" className="mt-2">
                  Contact Support
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AuthError;