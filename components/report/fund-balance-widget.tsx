"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { Wallet } from "lucide-react"

interface FundBalanceWidgetProps {
  totalDeposit: number
  totalCost: number
}

export function FundBalanceWidget({ totalDeposit, totalCost }: FundBalanceWidgetProps) {
  const availableFund = totalDeposit - totalCost
  const utilizationPercent = totalDeposit > 0 ? Math.min((totalCost / totalDeposit) * 100, 100) : 0
  const isOverBudget = totalCost > totalDeposit

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Wallet className="h-4 w-4 text-secondary" />
          Fund Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
      </CardContent>
    </Card>
  )
}
