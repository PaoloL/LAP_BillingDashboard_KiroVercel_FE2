"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { Wallet, Layers } from "lucide-react"

interface CostCenterBalance {
  costCenterId: string
  costCenterName: string
  totalDeposit: number
  totalCost: number
  availableFund: number
}

interface FundBalanceWidgetProps {
  totalDeposit: number
  totalCost: number
  costCenterBalances: CostCenterBalance[]
}

export function FundBalanceWidget({ totalDeposit, totalCost, costCenterBalances }: FundBalanceWidgetProps) {
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
      <CardContent className="space-y-4">
        {/* Overall Balance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Utilization</span>
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

        {/* Cost Center Breakdown */}
        {costCenterBalances.length > 0 && (
          <div className="border-t border-border pt-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Layers className="h-3.5 w-3.5" />
              <span>By Cost Center</span>
            </div>
            <div className="space-y-3">
              {costCenterBalances.map((cc) => {
                const ccUtilization = cc.totalDeposit > 0 ? Math.min((cc.totalCost / cc.totalDeposit) * 100, 100) : 0
                const ccOverBudget = cc.totalCost > cc.totalDeposit
                return (
                  <div key={cc.costCenterId} className="space-y-1.5 rounded-lg bg-muted/30 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{cc.costCenterName}</span>
                      <span className="text-xs font-semibold text-muted-foreground">{ccUtilization.toFixed(1)}%</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${ccUtilization}%`,
                          backgroundColor: ccOverBudget
                            ? "var(--destructive)"
                            : ccUtilization > 80
                              ? "var(--warning)"
                              : "var(--secondary)",
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {formatCurrency(cc.totalCost)} / {formatCurrency(cc.totalDeposit)}
                      </span>
                      <span className={ccOverBudget ? "text-destructive font-medium" : "text-secondary font-medium"}>
                        {formatCurrency(cc.availableFund)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
