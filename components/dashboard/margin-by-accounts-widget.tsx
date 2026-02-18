"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface MarginByAccountsWidgetProps {
  dashboardData: any
}

const COLORS = [
  "#026172", "#EC9400", "#10B981", "#F59E0B", "#3B82F6",
  "#8B5CF6", "#EF4444", "#14B8A6", "#F97316", "#6366F1"
]

function getLast12Months(): string[] {
  const months: string[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

export function MarginByAccountsWidget({ dashboardData }: MarginByAccountsWidgetProps) {
  const chartData = useMemo(() => {
    if (!dashboardData || !dashboardData.marginByAccountByMonth) {
      return []
    }

    const months = getLast12Months()
    const marginByAccountByMonth = dashboardData.marginByAccountByMonth
    
    // Get all unique account names
    const allAccounts = new Set<string>()
    Object.values(marginByAccountByMonth).forEach((monthData: any) => {
      Object.keys(monthData).forEach(accountName => allAccounts.add(accountName))
    })
    
    // Get top 10 accounts by total margin
    const accountTotals = new Map<string, number>()
    Object.values(marginByAccountByMonth).forEach((monthData: any) => {
      Object.entries(monthData).forEach(([accountName, margin]: [string, any]) => {
        const current = accountTotals.get(accountName) || 0
        accountTotals.set(accountName, current + margin)
      })
    })
    
    const topAccounts = Array.from(accountTotals.entries())
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 10)
      .map(([name]) => name)
    
    // Build chart data
    return months.map(month => {
      const data: any = { 
        period: new Date(month + "-01").toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
        })
      }
      const monthData = marginByAccountByMonth[month] || {}
      
      topAccounts.forEach(accountName => {
        data[accountName] = monthData[accountName] || 0
      })
      
      return data
    })
  }, [dashboardData])
  
  const accountKeys = useMemo(() => {
    if (chartData.length === 0) return []
    return Object.keys(chartData[0]).filter(key => key !== 'period')
  }, [chartData])

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <TrendingUp className="h-4 w-4 text-secondary" />
          Margin by Account (Last 12 Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
              tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '11px' }}
              iconType="square"
            />
            {accountKeys.map((key, index) => (
              <Bar 
                key={key}
                dataKey={key}
                stackId="margin"
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
