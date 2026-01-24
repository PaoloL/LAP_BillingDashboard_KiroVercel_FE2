import { StatsCards } from "@/components/stats-cards"
import { CostCharts } from "@/components/cost-charts"
import { RecentTransactions } from "@/components/recent-transactions"

export default function Dashboard() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#00243E]">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Overview of your billing and usage metrics</p>
      </div>

      <div className="space-y-8">
        {/* Accounts and Billing Stats */}
        <StatsCards />
        
        {/* Charts Section */}
        <CostCharts />
        
        {/* Recent Transactions */}
        <RecentTransactions />
      </div>
    </main>
  )
}
