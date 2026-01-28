"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { formatCurrency } from "@/lib/format"
import { useEffect, useState } from "react"
import { dataService } from "@/lib/data/data-service"
import type { TransactionDetail, UsageAccount } from "@/lib/types"

interface ChartData {
  costByPayer: { name: string; value: number }[]
  costByUsage: { name: string; value: number }[]
  trendData: { period: string; usage: number; deposit: number }[]
}

const PAYER_COLORS = ["#00243E", "#026172", "#0891B2", "#22D3EE", "#67E8F9"]
const USAGE_COLORS = ["#EC9400", "#F59E0B", "#FBBF24", "#FCD34D", "#FDE68A", "#FEF3C7", "#D97706", "#B45309", "#92400E", "#78350F"]

export function CostCharts() {
  const [chartData, setChartData] = useState<ChartData>({
    costByPayer: [],
    costByUsage: [],
    trendData: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadChartData() {
      try {
        setLoading(true)

        const [transactionsResponse, usageAccounts] = await Promise.all([
          dataService.getTransactions({}),
          dataService.getUsageAccounts(),
        ])

        // Handle transaction data - could be array or object with periods
        const transactions = Array.isArray(transactionsResponse.data)
          ? transactionsResponse.data
          : Object.values(transactionsResponse.data || {}).flat()

        // Aggregate seller cost by payer account
        const payerCostMap = new Map<string, { name: string; value: number }>()
        // Aggregate seller cost by usage account
        const usageCostMap = new Map<string, { name: string; value: number }>()
        // Aggregate by billing period for trend
        const trendMap = new Map<string, { period: string; usage: number; deposit: number }>()

        transactions.forEach((tx: TransactionDetail) => {
          const sellerCost = tx.sellerCost?.eur || 0

          // Payer aggregation
          const payerId = tx.payerAccount?.id || "Unknown"
          const payerName = tx.payerAccount?.name || "Unknown Payer"
          if (payerCostMap.has(payerId)) {
            payerCostMap.get(payerId)!.value += sellerCost
          } else {
            payerCostMap.set(payerId, { name: payerName, value: sellerCost })
          }

          // Usage aggregation
          const usageId = tx.usageAccount?.id || "Unknown"
          const usageName = tx.usageAccount?.name || "Unknown Account"
          if (usageCostMap.has(usageId)) {
            usageCostMap.get(usageId)!.value += sellerCost
          } else {
            usageCostMap.set(usageId, { name: usageName, value: sellerCost })
          }

          // Trend aggregation by billing period
          const period = tx.billingPeriod || new Date(tx.dateTime).toISOString().slice(0, 7)
          if (trendMap.has(period)) {
            trendMap.get(period)!.usage += sellerCost
          } else {
            trendMap.set(period, { period, usage: sellerCost, deposit: 0 })
          }
        })

        // Calculate deposit per period from usage accounts
        // For simplicity, distribute total deposit evenly across periods
        const totalDeposit = usageAccounts.reduce((sum: number, acc: UsageAccount) => sum + (acc.totalDeposit || 0), 0)
        const periods = Array.from(trendMap.keys()).sort()
        const depositPerPeriod = periods.length > 0 ? totalDeposit / periods.length : 0

        periods.forEach((period) => {
          if (trendMap.has(period)) {
            trendMap.get(period)!.deposit = depositPerPeriod
          }
        })

        // Sort and limit payer data (Top 5)
        const costByPayer = Array.from(payerCostMap.values())
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)

        // Sort and limit usage data (Top 10)
        const costByUsage = Array.from(usageCostMap.values())
          .sort((a, b) => b.value - a.value)
          .slice(0, 10)

        // Sort trend data by period
        const trendData = Array.from(trendMap.values())
          .sort((a, b) => a.period.localeCompare(b.period))
          .map((item) => ({
            ...item,
            period: new Date(item.period + "-01").toLocaleDateString("en-GB", {
              month: "short",
              year: "numeric",
            }),
          }))

        setChartData({
          costByPayer,
          costByUsage,
          trendData,
        })
      } catch (error) {
        console.error("Failed to load chart data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadChartData()
  }, [])

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: {
    cx: number
    cy: number
    midAngle: number
    innerRadius: number
    outerRadius: number
    percent: number
    name: string
  }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-[#00243E]">Charts</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-48 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-[300px] animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-[350px] animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#00243E]">Charts</h2>

      {/* Pie Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Seller Cost by Payer Account (Pie Chart, Top 5) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#00243E]">Total Seller Cost by Payer Account (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.costByPayer.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.costByPayer}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {chartData.costByPayer.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PAYER_COLORS[index % PAYER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px" }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: "20px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seller Cost by Usage Account (Pie Chart, Top 10) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#00243E]">Total Seller Cost by Usage Account (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.costByUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.costByUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {chartData.costByUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={USAGE_COLORS[index % USAGE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px" }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage vs Deposit Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#00243E]">Usage vs Deposit Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={chartData.trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === "usage" ? "Usage (Seller Cost)" : "Deposit",
                  ]}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px" }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="deposit"
                  name="Deposit"
                  fill="#026172"
                  fillOpacity={0.2}
                  stroke="#026172"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="usage"
                  name="Usage (Seller Cost)"
                  stroke="#EC9400"
                  strokeWidth={2}
                  dot={{ fill: "#EC9400", r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[350px] items-center justify-center text-muted-foreground">
              No trend data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
