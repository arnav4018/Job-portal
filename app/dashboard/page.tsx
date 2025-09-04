"use client"

import { Suspense } from "react"
import { useSession } from "next-auth/react"
import ProtectedRoute from "@/components/auth/protected-route"
import AuthErrorBoundary from "@/components/auth/auth-error-boundary"
import CandidateDashboard from "@/components/dashboard/candidate-dashboard"
import RecruiterDashboard from "@/components/dashboard/recruiter-dashboard"
import AdminDashboard from "@/components/dashboard/admin-dashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import DashboardLayout from "@/components/layout/dashboard-layout"

function DashboardSkeleton() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6">
          <Skeleton className="h-8 w-64 mb-2 bg-blue-400" />
          <Skeleton className="h-4 w-96 mb-4 bg-blue-300" />
          <div className="flex gap-3">
            <Skeleton className="h-8 w-32 bg-blue-300" />
            <Skeleton className="h-8 w-32 bg-blue-300" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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

        {/* Content Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64 mb-4" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

function DashboardContent() {
  const { data: session, status } = useSession()
  
  // Show loading state while session is being fetched
  if (status === "loading") {
    return <DashboardSkeleton />
  }
  
  // Handle unauthenticated users
  if (status === "unauthenticated" || !session?.user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-500">Please sign in to access your dashboard.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }
  
  // Handle missing role
  if (!session.user.role) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Account Setup Required</h2>
            <p className="text-gray-500">Your account role is not properly configured. Please contact support.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const { role } = session.user

  // Render role-specific dashboard
  switch (role) {
    case "CANDIDATE":
      return <CandidateDashboard />
    case "RECRUITER":
      return <RecruiterDashboard />
    case "ADMIN":
      return <AdminDashboard />
    default:
      return (
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Unknown Role</h2>
              <p className="text-gray-500">Your account role "{role}" is not recognized. Please contact support.</p>
            </div>
          </div>
        </DashboardLayout>
      )
  }
}

export default function DashboardPage() {
  return (
    <AuthErrorBoundary>
      <ProtectedRoute 
        allowedRoles={["CANDIDATE", "RECRUITER", "ADMIN"]}
        requireAuth={true}
        showFallback={true}
      >
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </ProtectedRoute>
    </AuthErrorBoundary>
  )
}