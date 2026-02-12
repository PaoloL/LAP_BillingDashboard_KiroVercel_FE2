"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format"
import { Receipt } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export interface TransactionRow {
  id: string
  dateTime: string
  period: string
  payerAccount: string
  payerAccountId: string
  usageAccountName: string
  usageAccountId: string
  amountUsd: number
  amountEur: number
  exchangeRate: number
}

interface RecentTransactionsWidgetProps {
  transactions: TransactionRow[]
  costCenters: Array<{ costCenterId: string; costCenterName: string; usageAccountIds: string[] }>
}

type RangeFilter = "3M" | "6M" | "12M"

const COLORS = ['#026172', '#EC9400', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899']

function getMonthsCutoff(months: number): Date {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  d.setHours(0, 0, 0, 0)
  return d
}

export function RecentTransactionsWidget({ transactions, costCenters }: RecentTransactionsWidgetProps) {
  const [range, setRange] = useState<RangeFilter>("3M")

  const chartData = useMemo(() => {
    const months = range === "3M" ? 3 : range === "6M" ? 6 : 12
    const cutoff = getMonthsCutoff(months)
    
    const filtered = transactions.filter((tx) => new Date(tx.dateTime) >= cutoff)
    
    // Build usage account to cost center mapping
    const accountToCostCenter = new Map<string, { id: string; name: string }>()
    costCenters.forEach(cc => {
      cc.usageAccountIds.forEach(accountId => {
        accountToCostCenter.set(accountId, { id: cc.costCenterId, name: cc.costCenterName })
      })
    })
    
    // Group by period and cost center
    const grouped = new Map<string, Map<string, number>>()
    
    filtered.forEach(tx => {
      const costCenter = accountToCostCenter.get(tx.usageAccountId)
      if (!costCenter) return
      
      if (!grouped.has(tx.period)) {
        grouped.set(tx.period, new Map())
      }
      
      const periodGroup = grouped.get(tx.period)!
      const current = periodGroup.get(costCenter.name) || 0
      periodGroup.set(costCenter.name, current + tx.amountEur)
    })
    
    // Convert to chart format
    return Array.from(grouped.entries())
      .map(([period, costCenters]) => {
        const data: any = { period }
        costCenters.forEach((value, ccName) => {
          data[ccName] = value
        })
        return data
      })
      .sort((a, b) => a.period.localeCompare(b.period))
  }, [transactions, costCenters, range])

  const costCenterNames = useMemo(() => {
    const names = new Set<string>()
    chartData.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'period') names.add(key)
      })
    })
    return Array.from(names)
  }, [chartData])

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Receipt className="h-4 w-4 text-secondary" />
            Transactions by Cost Center
          </CardTitle>
          <div className="flex items-center gap-1">
            {(["3M", "6M", "12M"] as RangeFilter[]).map((r) => (
              <Button
                key={r}
                variant={range === r ? "default" : "outline"}
                size="sm"
                className={`h-7 px-2.5 text-xs ${range === r ? "" : "text-muted-foreground"}`}
                onClick={() => setRange(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No transactions found in the last {range === "3M" ? "3 months" : range === "6M" ? "6 months" : "12 months"}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
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
                wrapperStyle={{ fontSize: '12px' }}
                iconType="square"
              />
              {costCenterNames.map((name, index) => (
                <Bar 
                  key={name} 
                  dataKey={name} 
                  stackId="a" 
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
