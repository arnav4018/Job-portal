'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { Search, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function JobNotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Job Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              The job you're looking for doesn't exist or may have been removed.
            </p>
            
            <div className="flex flex-col gap-2">
              <LinkButton href="/jobs" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Browse All Jobs
              </LinkButton>
              
              <Button 
                onClick={() => window.history.back()}
                variant="outline" 
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <LinkButton variant="outline" href="/" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </LinkButton>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Looking for something specific?</p>
              <Link href="/jobs" className="text-primary hover:underline">
                Try our job search filters
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}