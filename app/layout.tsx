import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Header } from '@/components/layout/header'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JobPortal Pro - Find Your Dream Job',
  description: 'A comprehensive job portal connecting talented candidates with top employers. Build your resume, apply to jobs, and grow your career.',
  keywords: 'jobs, careers, employment, resume builder, job search, hiring, recruitment',
  authors: [{ name: 'JobPortal Pro Team' }],
  openGraph: {
    title: 'JobPortal Pro - Find Your Dream Job',
    description: 'A comprehensive job portal connecting talented candidates with top employers.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JobPortal Pro - Find Your Dream Job',
    description: 'A comprehensive job portal connecting talented candidates with top employers.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Toaster />
          </div>
        </Providers>
      </body>
    </html>
  )
}