"use client"

import { StatsCards } from "@/components/dashboard/stats-cards"
import { CostCharts } from "@/components/dashboard/cost-charts"
import { MarginByAccountsWidget } from "@/components/dashboard/margin-by-accounts-widget"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/data/api-client"

export function DashboardPageContent() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        const data = await apiClient.getDashboard()
        setDashboardData(data)
      } catch (error) {
        console.error("Failed to load dashboard:", error)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#00243E]">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Overview of your billing and usage metrics</p>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#00243E]">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Overview of your billing and usage metrics</p>
      </div>

      <StatsCards />
      <CostCharts dashboardData={dashboardData} />
      <MarginByAccountsWidget dashboardData={dashboardData} />
    </div>
  )
}
