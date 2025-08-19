'use client'

import { Suspense } from 'react'
import SignUpContent from './signup-content'

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/50">
        <div className="animate-pulse">
          <div className="w-full max-w-md h-96 bg-muted rounded-lg"></div>
        </div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  )
}
