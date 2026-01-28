"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, DollarSign, Wallet, PiggyBank, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { useEffect, useState } from "react"
import { dataService } from "@/lib/data/data-service"
import type { PayerAccount, UsageAccount, TransactionDetail } from "@/lib/types"

interface BillingPeriodStats {
  sellerCost: number
  customerCost: number
  deposit: number
  margin: number
}

interface DashboardStats {
  totalPayerAccounts: number
  totalUsageAccounts: number
  registeredUsageAccounts: number
  unregisteredUsageAccounts: number
  currentMonth: BillingPeriodStats
  currentYear: BillingPeriodStats
}

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPayerAccounts: 0,
    totalUsageAccounts: 0,
    registeredUsageAccounts: 0,
    unregisteredUsageAccounts: 0,
    currentMonth: { sellerCost: 0, customerCost: 0, deposit: 0, margin: 0 },
    currentYear: { sellerCost: 0, customerCost: 0, deposit: 0, margin: 0 },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true)
        
        // Fetch all data in parallel
        const [payerAccounts, usageAccounts, transactionsResponse] = await Promise.all([
          dataService.getPayerAccounts(),
          dataService.getUsageAccounts(),
          dataService.getTransactions({}),
        ])

        // Calculate account stats
        const activePayerAccounts = payerAccounts.filter((a: PayerAccount) => a.status !== "Archived")
        const activeUsageAccounts = usageAccounts.filter((a: UsageAccount) => a.status !== "Archived")
        const registeredUsage = activeUsageAccounts.filter((a: UsageAccount) => a.status === "Registered")
        const unregisteredUsage = activeUsageAccounts.filter((a: UsageAccount) => a.status === "Unregistered")

        // Calculate billing stats from transactions
        const now = new Date()
        const currentMonthStr = now.toISOString().slice(0, 7) // YYYY-MM
        const currentYear = now.getFullYear()

        let monthSellerCost = 0
        let monthCustomerCost = 0
        let yearSellerCost = 0
        let yearCustomerCost = 0

        // Handle transaction data - could be array or object with periods
        const transactions = Array.isArray(transactionsResponse.data) 
          ? transactionsResponse.data 
          : Object.values(transactionsResponse.data || {}).flat()

        transactions.forEach((tx: TransactionDetail) => {
          const txDate = tx.billingPeriod || (tx.dateTime ? new Date(tx.dateTime).toISOString().slice(0, 7) : "")
          const txYear = txDate ? parseInt(txDate.slice(0, 4), 10) : 0
          const sellerCost = tx.sellerCost?.eur || 0
          const customerCost = tx.customerCost?.eur || 0

          // Current month
          if (txDate === currentMonthStr) {
            monthSellerCost += sellerCost
            monthCustomerCost += customerCost
          }

          // Current year (Jan-Dec)
          if (txYear === currentYear) {
            yearSellerCost += sellerCost
            yearCustomerCost += customerCost
          }
        })

        // Calculate total deposit from usage accounts
        let totalDeposit = 0
        usageAccounts.forEach((account: UsageAccount) => {
          totalDeposit += account.totalDeposit || 0
        })

        // For simplicity, assume deposit is distributed - use full deposit for both periods
        const monthDeposit = totalDeposit
        const yearDeposit = totalDeposit

        setStats({
          totalPayerAccounts: activePayerAccounts.length,
          totalUsageAccounts: activeUsageAccounts.length,
          registeredUsageAccounts: registeredUsage.length,
          unregisteredUsageAccounts: unregisteredUsage.length,
          currentMonth: {
            sellerCost: monthSellerCost,
            customerCost: monthCustomerCost,
            deposit: monthDeposit,
            margin: monthCustomerCost - monthSellerCost,
          },
          currentYear: {
            sellerCost: yearSellerCost,
            customerCost: yearCustomerCost,
            deposit: yearDeposit,
            margin: yearCustomerCost - yearSellerCost,
          },
        })
      } catch (error) {
        console.error("Failed to load dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const accountStats = [
    {
      title: "Total Payer Accounts",
      value: stats.totalPayerAccounts.toString(),
      icon: Building2,
      color: "text-[#00243E]",
      bgColor: "bg-[#00243E]/10",
      isCurrency: false,
    },
    {
      title: "Total Usage Accounts",
      value: stats.totalUsageAccounts.toString(),
      subtitle: `${stats.registeredUsageAccounts} registered / ${stats.unregisteredUsageAccounts} unregistered`,
      icon: Users,
      color: "text-[#026172]",
      bgColor: "bg-[#026172]/10",
      isCurrency: false,
    },
  ]

  const now = new Date()
  const currentMonthName = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" })

  const monthlyBillingStats = [
    {
      title: "Seller Cost",
      value: stats.currentMonth.sellerCost,
      icon: DollarSign,
      color: "text-[#EC9400]",
      bgColor: "bg-[#EC9400]/10",
    },
    {
      title: "Customer Cost",
      value: stats.currentMonth.customerCost,
      icon: Wallet,
      color: "text-[#00243E]",
      bgColor: "bg-[#00243E]/10",
    },
    {
      title: "Deposit",
      value: stats.currentMonth.deposit,
      icon: PiggyBank,
      color: "text-[#026172]",
      bgColor: "bg-[#026172]/10",
    },
    {
      title: "Margin",
      value: stats.currentMonth.margin,
      icon: TrendingUp,
      color: stats.currentMonth.margin >= 0 ? "text-green-600" : "text-[#F26522]",
      bgColor: stats.currentMonth.margin >= 0 ? "bg-green-600/10" : "bg-[#F26522]/10",
    },
  ]

  const yearlyBillingStats = [
    {
      title: "Seller Cost",
      value: stats.currentYear.sellerCost,
      icon: DollarSign,
      color: "text-[#EC9400]",
      bgColor: "bg-[#EC9400]/10",
    },
    {
      title: "Customer Cost",
      value: stats.currentYear.customerCost,
      icon: Wallet,
      color: "text-[#00243E]",
      bgColor: "bg-[#00243E]/10",
    },
    {
      title: "Deposit",
      value: stats.currentYear.deposit,
      icon: PiggyBank,
      color: "text-[#026172]",
      bgColor: "bg-[#026172]/10",
    },
    {
      title: "Margin",
      value: stats.currentYear.margin,
      icon: TrendingUp,
      color: stats.currentYear.margin >= 0 ? "text-green-600" : "text-[#F26522]",
      bgColor: stats.currentYear.margin >= 0 ? "bg-green-600/10" : "bg-[#F26522]/10",
    },
  ]

  const currentYearNum = new Date().getFullYear()

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="mb-3 text-base font-semibold text-[#00243E]">Accounts</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="py-3">
                <CardContent className="flex items-center justify-between px-4 py-0">
                  <div className="space-y-1">
                    <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    <div className="h-6 w-12 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-base font-semibold text-[#00243E]">Billing</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i} className="py-3">
                <CardContent className="px-4 py-0">
                  <div className="mb-2 h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="space-y-1">
                        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                        <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Accounts Section */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-[#00243E]">Accounts</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {accountStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="py-3">
                <CardContent className="flex items-center justify-between px-4 py-0">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                    <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
                    {stat.subtitle && (
                      <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                    )}
                  </div>
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", stat.bgColor)}>
                    <Icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Billing Section */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-[#00243E]">Billing</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Current Month */}
          <Card className="py-3">
            <CardContent className="px-4 py-0">
              <p className="mb-2 text-sm font-medium text-[#00243E]">{currentMonthName}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {monthlyBillingStats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.title} className="flex items-center gap-2">
                      <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", stat.bgColor)}>
                        <Icon className={cn("h-3.5 w-3.5", stat.color)} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs text-muted-foreground">{stat.title}</p>
                        <p className={cn("text-sm font-semibold", stat.color)}>
                          {formatCurrency(stat.value)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Current Year */}
          <Card className="py-3">
            <CardContent className="px-4 py-0">
              <p className="mb-2 text-sm font-medium text-[#00243E]">Year {currentYearNum} (Jan-Dec)</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {yearlyBillingStats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.title} className="flex items-center gap-2">
                      <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", stat.bgColor)}>
                        <Icon className={cn("h-3.5 w-3.5", stat.color)} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs text-muted-foreground">{stat.title}</p>
                        <p className={cn("text-sm font-semibold", stat.color)}>
                          {formatCurrency(stat.value)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
