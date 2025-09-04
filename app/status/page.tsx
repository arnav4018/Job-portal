import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import Link from 'next/link'
import { CheckCircle, AlertCircle, Clock, Database, Server, Globe } from 'lucide-react'

export default function StatusPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">System Status</h1>
          <p className="text-muted-foreground">
            Current status of Job Portal services and components
          </p>
        </div>

        <div className="grid gap-6">
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Overall Status</span>
              </CardTitle>
              <CardDescription>
                All systems operational
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-green-500">
                  Operational
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Last updated: {new Date().toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Service Status */}
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>
                Status of individual services and components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="h-4 w-4" />
                    <span>Web Application</span>
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    Operational
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Server className="h-4 w-4" />
                    <span>API Services</span>
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    Operational
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Database className="h-4 w-4" />
                    <span>Database</span>
                  </div>
                  <Badge variant="secondary">
                    Pending Setup
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4" />
                    <span>Authentication</span>
                  </div>
                  <Badge variant="default" className="bg-green-500">
                    Operational
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deployment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Deployment Information</CardTitle>
              <CardDescription>
                Current deployment details and build information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment:</span>
                  <span>{process.env.NODE_ENV || 'development'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Build Time:</span>
                  <span>{new Date().toISOString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform:</span>
                  <span>Vercel</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Required</CardTitle>
              <CardDescription>
                Complete these steps to fully activate the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Clock className="h-4 w-4 mt-1 text-orange-500" />
                  <div>
                    <p className="font-medium">Database Setup</p>
                    <p className="text-sm text-muted-foreground">
                      Configure PostgreSQL database and run migrations
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-4 w-4 mt-1 text-orange-500" />
                  <div>
                    <p className="font-medium">Environment Variables</p>
                    <p className="text-sm text-muted-foreground">
                      Set up authentication, email, and payment configurations
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-4 w-4 mt-1 text-orange-500" />
                  <div>
                    <p className="font-medium">Demo Data</p>
                    <p className="text-sm text-muted-foreground">
                      Run demo-seed script to populate with sample data
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <LinkButton href="/">
              Return to Homepage
            </LinkButton>
            <LinkButton variant="outline" href="/api/health">
              Check API Health
            </LinkButton>
          </div>
        </div>
      </div>
    </div>
  )
}