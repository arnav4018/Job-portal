'use client'

import { Suspense } from 'react'
import ProtectedRoute from '@/components/auth/protected-route'
import AuthErrorBoundary from '@/components/auth/auth-error-boundary'
import AdminDashboard from '@/components/dashboard/admin-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardLayout from '@/components/layout/dashboard-layout'

function AdminDashboardSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section Skeleton */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6">
          <Skeleton className="h-8 w-64 mb-2 bg-purple-400" />
          <Skeleton className="h-4 w-96 mb-4 bg-purple-300" />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-32 bg-purple-300" />
            <Skeleton className="h-8 w-32 bg-purple-300" />
            <Skeleton className="h-8 w-32 bg-purple-300" />
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
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

            {/* Recent Activity & Quick Actions Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64 mb-4" />
                    <div className="space-y-3">
                      {[...Array(5)].map((_, j) => (
                        <Skeleton key={j} className="h-10 w-full" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

export default function AdminDashboardPage() {
  return (
    <AuthErrorBoundary>
      <ProtectedRoute 
        allowedRoles={["ADMIN"]}
        requireAuth={true}
        showFallback={true}
      >
        <Suspense fallback={<AdminDashboardSkeleton />}>
          <AdminDashboard />
        </Suspense>
      </ProtectedRoute>
    </AuthErrorBoundary>
  )
}