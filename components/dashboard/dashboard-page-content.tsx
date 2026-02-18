"use client"

import { StatsCards } from "@/components/dashboard/stats-cards"
import { CostCharts } from "@/components/dashboard/cost-charts"
import { MarginByAccountsWidget } from "@/components/dashboard/margin-by-accounts-widget"
import { useEffect, useState } from "react"
import { dataService } from "@/lib/data/data-service"

export function DashboardPageContent() {
  const [transactions, setTransactions] = useState<any[]>([])
  
  useEffect(() => {
    async function loadTransactions() {
      try {
        // Get transactions for the last 12 months
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1)
        const endDate = new Date(now.getFullYear(), now.getMonth(), 1)
        const startPeriod = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`
        const endPeriod = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`
        
        console.log('Dashboard fetching transactions:', { startPeriod, endPeriod })
        
        const response = await dataService.getTransactions({ 
          startPeriod,
          endPeriod,
          limit: 1000 
        })
        // Extract the data array from the response
        setTransactions(response?.data || response || [])
      } catch (error) {
        console.error("Failed to load transactions:", error)
        setTransactions([])
      }
    }
    loadTransactions()
  }, [])
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#00243E]">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Overview of your billing and usage metrics</p>
      </div>

      <StatsCards />
      <CostCharts />
      <MarginByAccountsWidget transactions={transactions} />
    </div>
  )
}
