"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { TrendingUp } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export interface DepositRow {
  id: string
  dateTime: string
  period: string
  costCenter: string
  amountEur: number
  description: string
  poNumber: string
}

export interface TransactionRow {
  id: string
  dateTime: string
  period: string
  amountEur: number
}

interface DepositsVsCostsWidgetProps {
  deposits: DepositRow[]
  transactions: TransactionRow[]
}

function getLast12Months(): string[] {
  const months: string[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return months
}

export function DepositsVsCostsWidget({ deposits, transactions }: DepositsVsCostsWidgetProps) {
  const chartData = useMemo(() => {
    const months = getLast12Months()
    
    // Group deposits by period
    const depositsByPeriod = new Map<string, number>()
    deposits.forEach(dep => {
      const current = depositsByPeriod.get(dep.period) || 0
      depositsByPeriod.set(dep.period, current + dep.amountEur)
    })
    
    // Group costs by period
    const costsByPeriod = new Map<string, number>()
    transactions.forEach(tx => {
      const current = costsByPeriod.get(tx.period) || 0
      costsByPeriod.set(tx.period, current + tx.amountEur)
    })
    
    // Build chart data
    return months.map(month => ({
      period: month,
      Deposits: depositsByPeriod.get(month) || 0,
      Costs: costsByPeriod.get(month) || 0
    }))
  }, [deposits, transactions])

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <TrendingUp className="h-4 w-4 text-secondary" />
          Deposits vs Costs (Last 12 Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
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
            <Area 
              type="monotone" 
              dataKey="Deposits" 
              stackId="1"
              stroke="#026172" 
              fill="url(#colorDeposits)" 
            />
            <Area 
              type="monotone" 
              dataKey="Costs" 
              stackId="1"
              stroke="#EC9400" 
              fill="url(#colorCosts)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
