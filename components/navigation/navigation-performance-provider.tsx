'use client'

import { createContext, useContext, useEffect, ReactNode } from 'react'
import { getNavigationMonitor, initializeNavigationPerformance } from '@/lib/navigation-performance'

interface NavigationPerformanceContextType {
  monitor: ReturnType<typeof getNavigationMonitor>
}

const NavigationPerformanceContext = createContext<NavigationPerformanceContextType | null>(null)

interface NavigationPerformanceProviderProps {
  children: ReactNode
}

export function NavigationPerformanceProvider({ children }: NavigationPerformanceProviderProps) {
  const monitor = getNavigationMonitor()

  useEffect(() => {
    // Initialize performance monitoring
    initializeNavigationPerformance()

    // Cleanup on unmount
    return () => {
      // Don't destroy the monitor as it's a singleton
      // monitor.destroy()
    }
  }, [])

  return (
    <NavigationPerformanceContext.Provider value={{ monitor }}>
      {children}
    </NavigationPerformanceContext.Provider>
  )
}

export function useNavigationPerformanceContext() {
  const context = useContext(NavigationPerformanceContext)
  if (!context) {
    throw new Error('useNavigationPerformanceContext must be used within NavigationPerformanceProvider')
  }
  return context
}