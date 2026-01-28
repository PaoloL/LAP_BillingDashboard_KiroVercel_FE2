"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, DollarSign, Wallet, PiggyBank, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { useEffect, useState } from "react"
import { dataService } from "@/lib/data/data-service"
import type { PayerAccount, UsageAccount } from "@/lib/types"

interface DashboardStats {
  totalPayerAccounts: number
  totalUsageAccounts: number
  registeredUsageAccounts: number
  unregisteredUsageAccounts: number
  year: {
    totalSellerCost: number
    totalCustomerCost: number
    totalDeposit: number
    totalMargin: number
  }
  month: {
    totalSellerCost: number
    totalCustomerCost: number
    totalDeposit: number
    totalMargin: number
    period: string
  }
}

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPayerAccounts: 0,
    totalUsageAccounts: 0,
    registeredUsageAccounts: 0,
    unregisteredUsageAccounts: 0,
    year: {
      totalSellerCost: 0,
      totalCustomerCost: 0,
      totalDeposit: 0,
      totalMargin: 0,
    },
    month: {
      totalSellerCost: 0,
      totalCustomerCost: 0,
      totalDeposit: 0,
      totalMargin: 0,
      period: '',
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true)
        
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0')
        const currentPeriod = `${currentYear}-${currentMonth}`
        const startPeriod = `${currentYear}-01`
        const endPeriod = `${currentYear}-12`
        
        console.log('Fetching stats:', { currentPeriod, startPeriod, endPeriod })
        
        // Fetch accounts and both year and month summaries in parallel
        const [payerAccounts, usageAccounts, yearSummary, monthSummary] = await Promise.all([
          dataService.getPayerAccounts(),
          dataService.getUsageAccounts(),
          dataService.getDashboardSummary({ startPeriod, endPeriod }),
          dataService.getDashboardSummary({ period: currentPeriod }),
        ])

        console.log('Year summary:', yearSummary.totals)
        console.log('Month summary:', monthSummary.totals)

        // Calculate account stats
        const activePayerAccounts = payerAccounts.filter((a: PayerAccount) => a.status !== "Archived")
        const activeUsageAccounts = usageAccounts.filter((a: UsageAccount) => a.status !== "Archived")
        const registeredUsage = activeUsageAccounts.filter((a: UsageAccount) => a.status === "Registered")
        const unregisteredUsage = activeUsageAccounts.filter((a: UsageAccount) => a.status === "Unregistered")

        // Calculate total deposit from usage accounts
        const totalDeposit = usageAccounts.reduce((sum: number, acc: UsageAccount) => sum + (acc.totalDeposit || 0), 0)

        console.log('Year summary:', yearSummary)
        console.log('Month summary:', monthSummary)

        setStats({
          totalPayerAccounts: activePayerAccounts.length,
          totalUsageAccounts: activeUsageAccounts.length,
          registeredUsageAccounts: registeredUsage.length,
          unregisteredUsageAccounts: unregisteredUsage.length,
          year: {
            totalSellerCost: yearSummary.totals.seller,
            totalCustomerCost: yearSummary.totals.customer,
            totalDeposit,
            totalMargin: yearSummary.totals.margin,
          },
          month: {
            totalSellerCost: monthSummary.totals.seller,
            totalCustomerCost: monthSummary.totals.customer,
            totalDeposit: 0,
            totalMargin: monthSummary.totals.margin,
            period: monthSummary.period,
          },
        })
        
        console.log('Stats set:', {
          year: yearSummary.totals,
          month: monthSummary.totals
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

  const billingStats = [
    {
      title: "Seller Cost",
      yearValue: stats.year.totalSellerCost,
      monthValue: stats.month.totalSellerCost,
      icon: DollarSign,
      color: "text-[#EC9400]",
      bgColor: "bg-[#EC9400]/10",
    },
    {
      title: "Customer Cost",
      yearValue: stats.year.totalCustomerCost,
      monthValue: stats.month.totalCustomerCost,
      icon: Wallet,
      color: "text-[#00243E]",
      bgColor: "bg-[#00243E]/10",
    },
    {
      title: "Margin",
      yearValue: stats.year.totalMargin,
      monthValue: stats.month.totalMargin,
      icon: TrendingUp,
      color: stats.year.totalMargin >= 0 ? "text-green-600" : "text-[#F26522]",
      bgColor: stats.year.totalMargin >= 0 ? "bg-green-600/10" : "bg-[#F26522]/10",
    },
    {
      title: "Deposit",
      yearValue: stats.year.totalDeposit,
      monthValue: null,
      icon: PiggyBank,
      color: "text-[#026172]",
      bgColor: "bg-[#026172]/10",
    },
  ]

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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="py-3">
                <CardContent className="flex items-center justify-between px-4 py-0">
                  <div className="space-y-1">
                    <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                    <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {billingStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="py-3">
                <CardContent className="px-4 py-0">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", stat.bgColor)}>
                      <Icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                  </div>
                  
                  {/* Year Total */}
                  <div className="mb-2">
                    <div className="text-xs text-muted-foreground mb-1">Year {new Date().getFullYear()}</div>
                    <div className={cn("text-xl font-bold", stat.color)}>
                      {formatCurrency(stat.yearValue as number)}
                    </div>
                  </div>
                  
                  {/* Month Total */}
                  {stat.monthValue !== null && (
                    <div className="pt-2 border-t border-muted">
                      <div className="text-xs text-muted-foreground mb-1">
                        {new Date(stats.month.period + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </div>
                      <div className={cn("text-lg font-semibold", stat.color)}>
                        {formatCurrency(stat.monthValue as number)}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
