import { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import ProtectedRoute from "@/components/auth/protected-route"
import DashboardLayout from "@/components/layout/dashboard-layout"
import { RecruiterCompanyContent } from "./recruiter-company-content"

export const metadata: Metadata = {
  title: "Company Profile - JobPortal",
  description: "Manage your company profile",
}

export default async function RecruiterCompanyPage() {
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
        <RecruiterCompanyContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
