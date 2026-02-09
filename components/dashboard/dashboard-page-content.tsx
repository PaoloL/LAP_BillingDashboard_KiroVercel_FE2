import { StatsCards } from "@/components/stats-cards"
import { CostCharts } from "@/components/cost-charts"

export function DashboardPageContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#00243E]">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Overview of your billing and usage metrics</p>
      </div>

      <StatsCards />
      <CostCharts />
    </div>
  )
}
