"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { Wallet } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface CostCenterBalance {
  costCenterId: string
  costCenterName: string
  totalDeposit: number
  totalCost: number
  availableFund: number
  usageAccountCount?: number
}

interface FundBalanceWidgetProps {
  totalDeposit: number
  totalCost: number
  costCenterBalances: CostCenterBalance[]
}

const COLORS = ['#026172', '#EC9400', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899']

export function FundBalanceWidget({ totalDeposit, totalCost, costCenterBalances }: FundBalanceWidgetProps) {
  const availableFund = totalDeposit - totalCost
  const utilizationPercent = totalDeposit > 0 ? Math.min((totalCost / totalDeposit) * 100, 100) : 0
  const isOverBudget = totalCost > totalDeposit

  const pieData = costCenterBalances.map((cc) => ({
    name: cc.costCenterName,
    value: cc.totalCost,
  }))

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Wallet className="h-4 w-4 text-secondary" />
          Fund Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          {/* Left: Metrics (2/3) */}
          <div className="flex-[2] space-y-4">
            {/* Overall Utilization */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Overall Utilization</span>
                <span className="font-semibold text-foreground">{utilizationPercent.toFixed(1)}%</span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${utilizationPercent}%`,
                    backgroundColor: isOverBudget
                      ? "var(--destructive)"
                      : utilizationPercent > 80
                        ? "var(--warning)"
                        : "var(--secondary)",
                  }}
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Deposit</span>
                <span className="text-sm font-semibold text-foreground">{formatCurrency(totalDeposit)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Cost</span>
                <span className="text-sm font-semibold text-usage">{formatCurrency(totalCost)}</span>
              </div>
              <div className="border-t border-border pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Available Fund</span>
                  <span
                    className={`text-sm font-bold ${
                      isOverBudget ? "text-destructive" : "text-secondary"
                    }`}
                  >
                    {formatCurrency(availableFund)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Pie Chart (1/3) */}
          {costCenterBalances.length > 0 && totalCost > 0 && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-xs font-medium text-muted-foreground mb-2">Cost by Center</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1 w-full">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-muted-foreground truncate flex-1">{entry.name}</span>
                    <span className="font-medium">{formatCurrency(entry.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
