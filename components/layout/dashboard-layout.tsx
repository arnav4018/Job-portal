"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Briefcase, 
  Home, 
  Search, 
  FileText, 
  User, 
  Settings, 
  Bell, 
  MessageSquare,
  TrendingUp,
  Users,
  DollarSign,
  Building,
  Menu,
  X,
  LogOut,
  Filter,
  Zap,
  Calendar,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const candidateNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Find Jobs", href: "/jobs", icon: Search },
    { name: "Applications", href: "/dashboard/applications", icon: Briefcase },
    { name: "Resume Builder", href: "/resume-builder", icon: FileText },
    { name: "Refer & Earn", href: "/referrals", icon: Users },
    { name: "Smart Filters", href: "/filters", icon: Filter },
    { name: "AI Features", href: "/ai", icon: Zap },
    { name: "Interviews", href: "/interviews", icon: Calendar },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { name: "Profile", href: "/profile", icon: User },
  ]

  const recruiterNavigation = [
    { name: "Dashboard", href: "/recruiter", icon: Home },
    { name: "Post Job", href: "/recruiter/jobs/post", icon: Briefcase },
    { name: "My Jobs", href: "/recruiter/jobs", icon: Search },
    { name: "Applications", href: "/recruiter/applications", icon: Users },
    { name: "Smart Filters", href: "/filters", icon: Filter },
    { name: "Credits", href: "/credits", icon: DollarSign },
    { name: "AI Features", href: "/ai", icon: Zap },
    { name: "Interviews", href: "/interviews", icon: Calendar },
    { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
    { name: "Company Profile", href: "/recruiter/company", icon: Building },
    { name: "Analytics", href: "/recruiter/analytics", icon: TrendingUp },
  ]

  const adminNavigation = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Jobs", href: "/admin/jobs", icon: Briefcase },
    { name: "Companies", href: "/admin/companies", icon: Building },
    { name: "Smart Filters", href: "/filters", icon: Filter },
    { name: "Credits", href: "/credits", icon: DollarSign },
    { name: "AI Features", href: "/ai", icon: Zap },
    { name: "Interviews", href: "/interviews", icon: Calendar },
    { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  const getNavigation = () => {
    switch (session?.user?.role) {
      case "CANDIDATE":
        return candidateNavigation
      case "RECRUITER":
        return recruiterNavigation
      case "ADMIN":
        return adminNavigation
      default:
        return candidateNavigation
    }
  }

  const navigation = getNavigation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 flex z-40 md:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">JobPortal</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    pathname === item.href
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    "group flex items-center px-2 py-2 text-base font-medium rounded-md"
                  )}
                >
                  <item.icon className="mr-4 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">JobPortal</span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    pathname === item.href
                      ? "bg-blue-100 text-blue-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img
                  className="h-8 w-8 rounded-full"
                  src={session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name}&background=3b82f6&color=fff`}
                  alt=""
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{session?.user?.name}</p>
                <Badge variant="secondary" className="text-xs">
                  {session?.user?.role?.toLowerCase()}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}