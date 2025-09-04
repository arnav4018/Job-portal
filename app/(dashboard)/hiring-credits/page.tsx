'use client'

import { Suspense } from 'react'
import { HiringCreditsManager } from '@/components'

export default function HiringCreditsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hiring Credits</h1>
        <p className="text-gray-600 mt-1">
          Manage your hiring credits and track your recruitment spending
        </p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }>
        <HiringCreditsManager />
      </Suspense>
    </div>
  )
}
