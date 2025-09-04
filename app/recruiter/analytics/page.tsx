import { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import ProtectedRoute from "@/components/auth/protected-route"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { RecruiterAnalyticsContent } from "./recruiter-analytics-content"

export const metadata: Metadata = {
  title: "Analytics - JobPortal",
  description: "View job performance analytics",
}

export default async function RecruiterAnalyticsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  if (session.user.role !== "RECRUITER") {
    redirect("/dashboard")
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <RecruiterAnalyticsContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
