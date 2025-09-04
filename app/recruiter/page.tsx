'use client'

import { Suspense } from 'react'
import ProtectedRoute from '@/components/auth/protected-route'
import AuthErrorBoundary from '@/components/auth/auth-error-boundary'
import RecruiterDashboard from '@/components/dashboard/recruiter-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import DashboardLayout from '@/components/layout/dashboard-layout'

function RecruiterDashboardSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section Skeleton */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6">
          <Skeleton className="h-8 w-64 mb-2 bg-green-400" />
          <Skeleton className="h-4 w-96 mb-4 bg-green-300" />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-32 bg-green-300" />
            <Skeleton className="h-8 w-32 bg-green-300" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Applications Management Skeleton */}
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64 mb-4" />
            
            {/* Search and Filter Controls Skeleton */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Skeleton className="h-10 flex-1" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>

            {/* Applications List Skeleton */}
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-48 mb-1" />
                        <Skeleton className="h-4 w-64 mb-2" />
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default function RecruiterDashboardPage() {
  return (
    <AuthErrorBoundary>
      <ProtectedRoute 
        allowedRoles={["RECRUITER"]}
        requireAuth={true}
        showFallback={true}
      >
        <Suspense fallback={<RecruiterDashboardSkeleton />}>
          <RecruiterDashboard />
        </Suspense>
      </ProtectedRoute>
    </AuthErrorBoundary>
  )
}