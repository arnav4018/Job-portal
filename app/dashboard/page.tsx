"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import CandidateDashboard from "@/components/dashboard/candidate-dashboard"
import RecruiterDashboard from "@/components/dashboard/recruiter-dashboard"
import AdminDashboard from "@/components/dashboard/admin-dashboard"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) return null

  const { role } = session.user

  return (
    <div className="min-h-screen bg-gray-50">
      {role === "CANDIDATE" && <CandidateDashboard />}
      {role === "RECRUITER" && <RecruiterDashboard />}
      {role === "ADMIN" && <AdminDashboard />}
    </div>
  )
}