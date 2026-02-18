"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts"

interface DashboardData {
  costByPayer: Array<{ name: string; value: number }>
  costByUsage: Array<{ name: string; value: number }>
  costByCustomer: Array<{ name: string; value: number }>
  trendByMonth: Record<string, { usage: number; deposit: number }>
}

interface CostChartsProps {
  dashboardData: DashboardData | null
}

const COLORS = ['#EC9400', '#026172', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899']

export function CostCharts({ dashboardData }: CostChartsProps) {
  if (!dashboardData) {
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
      </div>
    )
  }

  const { costByPayer, costByUsage, costByCustomer, trendByMonth } = dashboardData

  // Format trend data for chart
  const trendData = Object.entries(trendByMonth || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, data]) => ({
      period: new Date(period + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      usage: data.usage,
      deposit: data.deposit
    }))

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#00243E]">Charts</h2>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cost by Payer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost by Payer (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            {costByPayer && costByPayer.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costByPayer}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `€${entry.value.toFixed(0)}`}
                  >
                    {costByPayer.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost by Usage Account */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost by Usage Account (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            {costByUsage && costByUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costByUsage}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `€${entry.value.toFixed(0)}`}
                  >
                    {costByUsage.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cost by Customer */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost by Customer (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            {costByCustomer && costByCustomer.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costByCustomer}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
                  <Bar dataKey="value" fill="#EC9400" />
                </BarChart>
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
          <CardTitle className="text-base">Deposits vs Costs (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {trendData && trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="dashboardColorDeposits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dashboardColorCosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EC9400" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#EC9400" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
                <Area type="monotone" dataKey="deposit" stroke="#10B981" fillOpacity={1} fill="url(#dashboardColorDeposits)" />
                <Area type="monotone" dataKey="usage" stroke="#EC9400" fillOpacity={1} fill="url(#dashboardColorCosts)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No trend data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
