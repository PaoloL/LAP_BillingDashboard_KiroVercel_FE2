"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { TimeFilter } from "@/components/time-filter"
import { UsageMetrics } from "@/components/usage-metrics"
import { DiscountMetrics } from "@/components/discount-metrics"
import { LatestTransactionsTable } from "@/components/latest-transactions-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TimeRange } from "@/lib/types"

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>("MTD")

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#00243E]">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Overview of your AWS billing and cost management</p>
          </div>
          <TimeFilter value={timeRange} onChange={setTimeRange} />
        </div>

        <div className="space-y-6">
          {/* Row 1: Usage Metrics (Cost Row) */}
          <UsageMetrics timeRange={timeRange} />

          {/* Row 2: Discount Metrics (Savings Row) */}
          <DiscountMetrics timeRange={timeRange} />

          {/* Row 3: Latest Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[#00243E]">Latest 10 Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <LatestTransactionsTable />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
