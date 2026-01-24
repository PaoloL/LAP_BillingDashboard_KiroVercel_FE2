"use client"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, DollarSign, Wallet, PiggyBank, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import { useEffect, useState } from "react"
import { dataService } from "@/lib/data/data-service"
import type { PayerAccount, UsageAccount, TransactionDetail } from "@/lib/types"

interface DashboardStats {
  totalPayerAccounts: number
  totalUsageAccounts: number
  registeredUsageAccounts: number
  unregisteredUsageAccounts: number
  totalSellerCost: number
  totalCustomerCost: number
  totalDeposit: number
  totalMargin: number
}

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPayerAccounts: 0,
    totalUsageAccounts: 0,
    registeredUsageAccounts: 0,
    unregisteredUsageAccounts: 0,
    totalSellerCost: 0,
    totalCustomerCost: 0,
    totalDeposit: 0,
    totalMargin: 0,
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
        let totalSellerCost = 0
        let totalCustomerCost = 0
        let totalDeposit = 0

        // Handle transaction data - could be array or object with periods
        const transactions = Array.isArray(transactionsResponse.data) 
          ? transactionsResponse.data 
          : Object.values(transactionsResponse.data || {}).flat()

        transactions.forEach((tx: TransactionDetail) => {
          totalSellerCost += tx.sellerCost?.eur || 0
          totalCustomerCost += tx.customerCost?.eur || 0
        })

        // Calculate total deposit from usage accounts
        usageAccounts.forEach((account: UsageAccount) => {
          totalDeposit += account.totalDeposit || 0
        })

        const totalMargin = totalCustomerCost - totalSellerCost

        setStats({
          totalPayerAccounts: activePayerAccounts.length,
          totalUsageAccounts: activeUsageAccounts.length,
          registeredUsageAccounts: registeredUsage.length,
          unregisteredUsageAccounts: unregisteredUsage.length,
          totalSellerCost,
          totalCustomerCost,
          totalDeposit,
          totalMargin,
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
      title: "Total Seller Cost",
      value: stats.totalSellerCost,
      icon: DollarSign,
      color: "text-[#EC9400]",
      bgColor: "bg-[#EC9400]/10",
      isCurrency: true,
    },
    {
      title: "Total Customer Cost",
      value: stats.totalCustomerCost,
      icon: Wallet,
      color: "text-[#00243E]",
      bgColor: "bg-[#00243E]/10",
      isCurrency: true,
    },
    {
      title: "Total Deposit",
      value: stats.totalDeposit,
      icon: PiggyBank,
      color: "text-[#026172]",
      bgColor: "bg-[#026172]/10",
      isCurrency: true,
    },
    {
      title: "Total Margin",
      value: stats.totalMargin,
      icon: TrendingUp,
      color: stats.totalMargin >= 0 ? "text-green-600" : "text-[#F26522]",
      bgColor: stats.totalMargin >= 0 ? "bg-green-600/10" : "bg-[#F26522]/10",
      isCurrency: true,
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
                <CardContent className="flex items-center justify-between px-4 py-0">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                    <div className={cn("text-2xl font-bold", stat.color)}>
                      {stat.isCurrency ? formatCurrency(stat.value as number) : stat.value}
                    </div>
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
    </div>
  )
}
