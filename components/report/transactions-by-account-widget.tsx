"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/format"
import type { TransactionRow } from "./recent-transactions-widget"

interface TransactionsByAccountWidgetProps {
  transactions: TransactionRow[]
}

export function TransactionsByAccountWidget({ transactions }: TransactionsByAccountWidgetProps) {
  // Group transactions by period and usage account
  const periodMap = new Map<string, Map<string, number>>()

  transactions.forEach((tx) => {
    const period = tx.period
    const accountName = tx.usageAccountName || tx.usageAccountId || 'Unknown'
    const amount = Math.abs(tx.amountEur || 0)

    if (!periodMap.has(period)) {
      periodMap.set(period, new Map())
    }

    const accountMap = periodMap.get(period)!
    accountMap.set(accountName, (accountMap.get(accountName) || 0) + amount)
  })

  // Get all unique account names
  const allAccounts = new Set<string>()
  periodMap.forEach((accountMap) => {
    accountMap.forEach((_, account) => allAccounts.add(account))
  })

  // Convert to chart data format
  const chartData = Array.from(periodMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([period, accountMap]) => {
      const dataPoint: any = {
        period: new Date(period + '-01').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
      }
      allAccounts.forEach((account) => {
        dataPoint[account] = accountMap.get(account) || 0
      })
      return dataPoint
    })

  // Generate colors for accounts
  const colors = [
    '#EC9400', '#00243E', '#026172', '#F59E0B', '#0891B2',
    '#FBBF24', '#22D3EE', '#FCD34D', '#67E8F9', '#FDE68A'
  ]

  const accountColors = Array.from(allAccounts).reduce((acc, account, idx) => {
    acc[account] = colors[idx % colors.length]
    return acc
  }, {} as Record<string, string>)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#00243E]">Transactions by Usage Account</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              {Array.from(allAccounts).map((account) => (
                <Bar
                  key={account}
                  dataKey={account}
                  stackId="a"
                  fill={accountColors[account]}
                  name={account}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[400px] items-center justify-center text-muted-foreground">
            No transaction data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
