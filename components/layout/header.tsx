'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Settings, 
  LogOut, 
  Briefcase, 
  FileText, 
  Users, 
  MessageSquare,
  Bell,
  Search
} from 'lucide-react'
import { getInitials } from '@/lib/utils'

export function Header() {
  const { data: session, status } = useSession()

  const getDashboardLink = () => {
    // All roles use the same dashboard with role-based content
    return '/dashboard'
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'RECRUITER':
        return 'bg-blue-100 text-blue-800'
      case 'CANDIDATE':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6" />
            <span className="font-bold text-xl">JobPortal Pro</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/jobs" className="hover:text-primary">
              Jobs
            </Link>
            <Link href="/companies" className="hover:text-primary">
              Companies
            </Link>
            {session?.user?.role === 'CANDIDATE' && (
              <Link href="/resume-builder" className="hover:text-primary">
                Resume Builder
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Search className="h-4 w-4" />
          </Button>

          {status === 'loading' ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : session ? (
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <Bell className="h-4 w-4" />
                </Link>
              </Button>

              {/* Messages */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard/messages">
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                      <AvatarFallback>
                        {getInitials(session.user.name || session.user.email || 'U')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                      {session.user.role && (
                        <Badge className={`text-xs w-fit ${getRoleColor(session.user.role)}`}>
                          {session.user.role.toLowerCase()}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardLink()}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  {session.user.role === 'CANDIDATE' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/applications">
                          <FileText className="mr-2 h-4 w-4" />
                          My Applications
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/resume-builder">
                          <FileText className="mr-2 h-4 w-4" />
                          My Resumes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/referrals">
                          <Users className="mr-2 h-4 w-4" />
                          Refer & Earn
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {session.user.role === 'RECRUITER' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/recruiter/jobs">
                          <Briefcase className="mr-2 h-4 w-4" />
                          My Jobs
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/recruiter/applications">
                          <Users className="mr-2 h-4 w-4" />
                          Applications
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  {session.user.role === 'ADMIN' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users">
                          <Users className="mr-2 h-4 w-4" />
                          Manage Users
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/settings">
                          <Settings className="mr-2 h-4 w-4" />
                          System Settings
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}