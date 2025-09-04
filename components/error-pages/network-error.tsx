/**
 * Network Error Page Component
 * Handles network connectivity issues with recovery options
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { RetryButton } from '@/components/ui/retry-button';

export interface NetworkErrorProps {
  onRetry?: () => void | Promise<void>;
  isRetrying?: boolean;
  error?: string;
  showConnectionStatus?: boolean;
}

export function NetworkError({ 
  onRetry, 
  isRetrying = false, 
  error = 'Network connection failed',
  showConnectionStatus = true 
}: NetworkErrorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast' | 'unknown'>('unknown');

  useEffect(() => {
    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    // Check connection speed if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const updateConnectionInfo = () => {
          const effectiveType = connection.effectiveType;
          setConnectionSpeed(
            effectiveType === '4g' || effectiveType === '3g' ? 'fast' : 'slow'
          );
        };
        
        updateConnectionInfo();
        connection.addEventListener('change', updateConnectionInfo);
        
        return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
          connection.removeEventListener('change', updateConnectionInfo);
        };
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const troubleshootingSteps = [
    'Check your internet connection',
    'Try refreshing the page',
    'Disable VPN if you\'re using one',
    'Clear your browser cache',
    'Try a different network',
    'Contact your internet service provider',
  ];

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Error Display */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              {isOnline ? (
                <Wifi className="h-20 w-20 text-muted-foreground" />
              ) : (
                <WifiOff className="h-20 w-20 text-destructive" />
              )}
              <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              {isOnline ? 'Connection Problem' : 'No Internet Connection'}
            </h2>
            <p className="text-muted-foreground">
              {isOnline 
                ? 'Unable to reach the server. Please check your connection.'
                : 'You appear to be offline. Please check your internet connection.'
              }
            </p>
          </div>
        </div>

        {/* Connection Status */}
        {showConnectionStatus && (
          <Card className={isOnline ? 'border-green-200' : 'border-destructive/20'}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {isOnline ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Connection Status
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5 text-destructive" />
                    Connection Status
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Internet:</span>
                <span className={isOnline ? 'text-green-600' : 'text-destructive'}>
                  {isOnline ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {isOnline && connectionSpeed !== 'unknown' && (
                <div className="flex justify-between text-sm">
                  <span>Speed:</span>
                  <span className={connectionSpeed === 'fast' ? 'text-green-600' : 'text-yellow-600'}>
                    {connectionSpeed === 'fast' ? 'Good' : 'Slow'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error Details */}
        <Card className="border-destructive/20">
          <CardContent className="pt-4">
            <div className="text-sm">
              <div className="font-medium text-destructive mb-1">Error Details</div>
              <div className="bg-muted p-2 rounded text-xs">
                {error}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recovery Actions */}
        <div className="space-y-3">
          {onRetry && (
            <RetryButton
              onRetry={onRetry}
              isRetrying={isRetrying}
              className="w-full"
              variant="default"
              disabled={!isOnline}
            >
              {isOnline ? 'Try Again' : 'Waiting for Connection...'}
            </RetryButton>
          )}

          <Button
            onClick={handleRefresh}
            variant="outline"
            className="w-full flex items-center gap-2"
            disabled={!isOnline}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
        </div>

        {/* Troubleshooting */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Troubleshooting</CardTitle>
            <CardDescription>
              Try these steps to resolve the connection issue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {troubleshootingSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  {step}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Auto-retry indicator */}
        {!isOnline && (
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Monitoring Connection</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll automatically retry when your connection is restored
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default NetworkError;