/**
 * Custom 404 Not Found Page
 * Provides user-friendly error handling with navigation suggestions
 */
'use client'

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Search, ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  const navigationSuggestions = [
    {
      title: 'Browse Jobs',
      description: 'Explore available job opportunities',
      href: '/jobs',
      icon: Search,
    },
    {
      title: 'Dashboard',
      description: 'Go to your personal dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      title: 'Profile',
      description: 'Manage your profile and settings',
      href: '/profile',
      icon: Home,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Main Error Display */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <FileQuestion className="h-24 w-24 text-muted-foreground" />
              <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                404
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Page Not Found</h1>
            <p className="text-xl text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
        </div>

        {/* Navigation Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Where would you like to go?
            </CardTitle>
            <CardDescription>
              Here are some popular destinations to help you find what you're looking for.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {navigationSuggestions.map((suggestion) => (
                <Link key={suggestion.href} href={suggestion.href}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                    <suggestion.icon className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="font-medium">{suggestion.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {suggestion.description}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => window.history.back()} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          <Link href="/">
            <Button className="flex items-center gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>

        {/* Help Section */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">Still can't find what you're looking for?</h3>
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please contact our support team.
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <Link href="/contact">
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                </Link>
                <Link href="/help">
                  <Button variant="outline" size="sm">
                    Help Center
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}