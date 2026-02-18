"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
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
  costByCustomer: { name: string; value: number }[]
  trendData: { period: string; usage: number; deposit: number }[]
}

const PAYER_COLORS = ["#00243E", "#026172", "#0891B2", "#22D3EE", "#67E8F9"]
const USAGE_COLORS = ["#EC9400", "#F59E0B", "#FBBF24", "#FCD34D", "#FDE68A", "#FEF3C7", "#D97706", "#B45309", "#92400E", "#78350F"]
const CUSTOMER_COLORS = ["#10B981", "#059669", "#34D399", "#6EE7B7", "#A7F3D0"]

export function CostCharts() {
  const [chartData, setChartData] = useState<ChartData>({
    costByPayer: [],
    costByUsage: [],
    costByCustomer: [],
    trendData: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadChartData() {
      try {
        setLoading(true)

        const currentYear = new Date().getFullYear()

        // Fetch transactions, usage accounts, and customers
        const [transactions, usageAccounts, customers] = await Promise.all([
          dataService.getTransactions({
            startPeriod: `${currentYear}-01`,
            endPeriod: `${currentYear}-12`,
          }),
          dataService.getUsageAccounts(),
          dataService.getCustomers(),
        ])

        // Create usage account to customer map
        const usageToCustomerMap = new Map<string, string>()
        usageAccounts.forEach((acc: UsageAccount) => {
          if (acc.customer) {
            usageToCustomerMap.set(acc.accountId, acc.customer)
          }
        })
        
        // Create customer name map
        const customerNameMap = new Map<string, string>()
        customers.forEach((cust: any) => {
          customerNameMap.set(cust.vatNumber, cust.name || cust.vatNumber)
        })

        // Group by payer, usage, and customer
        const payerMap = new Map<string, { name: string; value: number }>()
        const usageMap = new Map<string, { name: string; value: number }>()
        const customerMap = new Map<string, { name: string; value: number }>()
        const trendMap = new Map<string, { usage: number; deposit: number }>()

        transactions.data.forEach(tx => {
          const isDataExport = tx.transactionType === 'DATAEXPORT'
          const sellerCost = isDataExport ? (tx.totals?.seller?.net?.eur || tx.totals?.seller?.eur || 0) : 0

          console.log('Transaction:', {
            type: tx.transactionType,
            isDataExport,
            sellerCost,
            totals: tx.totals,
            payer: tx.accounts?.payer,
            usage: tx.accounts?.usage
          })

          // Aggregate by payer (only DATAEXPORT)
          if (isDataExport && sellerCost > 0) {
            const payerId = tx.accounts?.payer?.id
            const payerName = tx.accounts?.payer?.name || payerId
            if (payerId) {
              const current = payerMap.get(payerId)
              if (current) {
                current.value += sellerCost
              } else {
                payerMap.set(payerId, { name: payerName, value: sellerCost })
              }
            }

            // Aggregate by usage account
            const usageId = tx.accounts?.usage?.id
            const usageName = tx.accounts?.usage?.name || usageId
            if (usageId) {
              const current = usageMap.get(usageId)
              if (current) {
                current.value += sellerCost
              } else {
                usageMap.set(usageId, { name: usageName, value: sellerCost })
              }

              // Aggregate by customer
              const customerVat = usageToCustomerMap.get(usageId)
              if (customerVat) {
                const customerName = customerNameMap.get(customerVat) || customerVat
                const current2 = customerMap.get(customerVat)
                if (current2) {
                  current2.value += sellerCost
                } else {
                  customerMap.set(customerVat, { name: customerName, value: sellerCost })
                }
              }
            }
          }

          // Build trend data by month
          const period = tx.billingPeriod
          if (period) {
            if (isDataExport) {
              if (trendMap.has(period)) {
                trendMap.get(period)!.usage += sellerCost
              } else {
                trendMap.set(period, { usage: sellerCost, deposit: 0 })
              }
            } else if (tx.transactionType === 'MANUAL' || tx.transactionType === 'DEPOSIT') {
              const depositAmount = Math.abs(tx.details?.amount?.eur || tx.details?.value || 0)
              if (trendMap.has(period)) {
                trendMap.get(period)!.deposit += depositAmount
              } else {
                trendMap.set(period, { usage: 0, deposit: depositAmount })
              }
            }
          }
        })

        // Get top payers, usage accounts, and customers
        const costByPayer = Array.from(payerMap.values())
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)

        const costByUsage = Array.from(usageMap.values())
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)

        const costByCustomer = Array.from(customerMap.values())
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)

        // Format trend data
        const trendData = Array.from(trendMap.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([period, data]) => ({
            period: new Date(period + "-01").toLocaleDateString("en-GB", {
              month: "short",
              year: "numeric",
            }),
            usage: data.usage,
            deposit: data.deposit,
          }))

        setChartData({
          costByPayer,
          costByUsage,
          costByCustomer,
          trendData,
        })

        console.log('Chart data set:', {
          costByPayer,
          costByUsage,
          costByCustomer,
          totalTransactions: transactions.data.length
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
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
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
      <div className="grid gap-6 lg:grid-cols-3">
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

        {/* Seller Cost by Usage Account (Pie Chart, Top 5) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#00243E]">Total Seller Cost by Usage Account (Top 5)</CardTitle>
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

        {/* Seller Cost by Customer (Pie Chart, Top 5) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#00243E]">Total Seller Cost by Customer (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.costByCustomer.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.costByCustomer}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {chartData.costByCustomer.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CUSTOMER_COLORS[index % CUSTOMER_COLORS.length]} />
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

      {/* Deposits vs Costs Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#00243E]">Deposits vs Costs (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData.trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#026172" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#026172" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC9400" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EC9400" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} iconType="square" />
                <Area
                  type="monotone"
                  dataKey="deposit"
                  name="Deposits"
                  stroke="#026172"
                  fill="url(#colorDeposits)"
                />
                <Area
                  type="monotone"
                  dataKey="usage"
                  name="Costs"
                  stroke="#EC9400"
                  fill="url(#colorCosts)"
                />
              </AreaChart>
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
