import { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import ProtectedRoute from "@/components/auth/protected-route"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { RecruiterJobsContent } from "./recruiter-jobs-content"

export const metadata: Metadata = {
  title: "My Jobs - JobPortal",
  description: "Manage your posted jobs",
}

export default async function RecruiterJobsPage() {
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
        <RecruiterJobsContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
