'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { FileText, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ResumeNotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Resume Not Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              The resume you're looking for doesn't exist or you don't have permission to access it.
            </p>
            
            <div className="flex flex-col gap-2">
              <LinkButton href="/resume-builder" className="w-full">
                <FileText className="w-4 h-4 mr-2" />
                My Resumes
              </LinkButton>
              
              <Button 
                onClick={() => window.history.back()}
                variant="outline" 
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              
              <LinkButton variant="outline" href="/dashboard" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </LinkButton>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Want to create a new resume?</p>
              <Link href="/resume-builder" className="text-primary hover:underline">
                Start building your resume
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}