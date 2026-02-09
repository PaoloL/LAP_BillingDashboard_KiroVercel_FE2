import type React from "react"
import { DashboardNav } from "@/components/layout/dashboard-nav"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  )
}
