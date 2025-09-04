'use client'

import { Suspense } from 'react'
import { AnalyticsDashboard } from '@/components'

export default function AnalyticsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Track your hiring performance and get insights into recruitment metrics
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <AnalyticsDashboard />
      </Suspense>
    </div>
  )
}
