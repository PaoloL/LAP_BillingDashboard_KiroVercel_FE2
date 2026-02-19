"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from "recharts"
import { apiClient } from "@/lib/data/api-client"

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

const PERIOD_OPTIONS = [
  { label: '1M', value: 1 },
  { label: '3M', value: 3 },
  { label: '6M', value: 6 },
  { label: '12M', value: 12 },
]

export function CostCharts({ dashboardData }: CostChartsProps) {
  const [payerPeriod, setPayerPeriod] = useState(12)
  const [usagePeriod, setUsagePeriod] = useState(12)
  const [customerPeriod, setCustomerPeriod] = useState(12)
  
  const [payerData, setPayerData] = useState<Array<{ name: string; value: number }> | null>(null)
  const [usageData, setUsageData] = useState<Array<{ name: string; value: number }> | null>(null)
  const [customerData, setCustomerData] = useState<Array<{ name: string; value: number }> | null>(null)
  
  const [payerLoading, setPayerLoading] = useState(false)
  const [usageLoading, setUsageLoading] = useState(false)
  const [customerLoading, setCustomerLoading] = useState(false)

  // Initialize with dashboard data
  useEffect(() => {
    if (dashboardData) {
      setPayerData(dashboardData.costByPayer)
      setUsageData(dashboardData.costByUsage)
      setCustomerData(dashboardData.costByCustomer)
    }
  }, [dashboardData])

  const loadPayerData = async (months: number) => {
    setPayerLoading(true)
    try {
      const data = await apiClient.getDashboard(months)
      setPayerData(data.costByPayer)
    } finally {
      setPayerLoading(false)
    }
  }

  const loadUsageData = async (months: number) => {
    setUsageLoading(true)
    try {
      const data = await apiClient.getDashboard(months)
      setUsageData(data.costByUsage)
    } finally {
      setUsageLoading(false)
    }
  }

  const loadCustomerData = async (months: number) => {
    setCustomerLoading(true)
    try {
      const data = await apiClient.getDashboard(months)
      setCustomerData(data.costByCustomer)
    } finally {
      setCustomerLoading(false)
    }
  }

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

  const { trendByMonth } = dashboardData

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
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Seller Cost by Payer (Top 5)</CardTitle>
              <div className="flex gap-1">
                {PERIOD_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={payerPeriod === option.value ? "default" : "outline"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setPayerPeriod(option.value)
                      loadPayerData(option.value)
                    }}
                    disabled={payerLoading}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {payerLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : payerData && payerData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={payerData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => entry.name}
                  >
                    {payerData.map((_, index) => (
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Seller Cost by Usage Account (Top 5)</CardTitle>
              <div className="flex gap-1">
                {PERIOD_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={usagePeriod === option.value ? "default" : "outline"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setUsagePeriod(option.value)
                      loadUsageData(option.value)
                    }}
                    disabled={usageLoading}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {usageLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : usageData && usageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={usageData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => entry.name}
                  >
                    {usageData.map((_, index) => (
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Seller Cost by Customer (Top 5)</CardTitle>
              <div className="flex gap-1">
                {PERIOD_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={customerPeriod === option.value ? "default" : "outline"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      setCustomerPeriod(option.value)
                      loadCustomerData(option.value)
                    }}
                    disabled={customerLoading}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {customerLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : customerData && customerData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={customerData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => entry.name}
                  >
                    {customerData.map((_, index) => (
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
