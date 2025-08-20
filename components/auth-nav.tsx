'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function AuthNav() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
  }

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          Welcome, {session.user.name || session.user.email}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
        >
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm" asChild>
        <Link href="/auth/signin">Sign In</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/auth/signup">Sign Up</Link>
      </Button>
    </div>
  )
}