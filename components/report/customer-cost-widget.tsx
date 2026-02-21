"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { Users } from "lucide-react"

interface CustomerCostWidgetProps {
  grossCustomerCost: number
  discountApplied: number
  netCustomerCost: number
}

export function CustomerCostWidget({
  grossCustomerCost,
  discountApplied,
  netCustomerCost,
}: CustomerCostWidgetProps) {
  return (
    <Card className="border-border h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Users className="h-4 w-4 text-secondary" />
          Customer Cost
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center h-[calc(100%-4rem)]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Gross Cost</span>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(grossCustomerCost)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Discount Applied</span>
            <span className="text-sm font-semibold text-secondary">
              {formatCurrency(discountApplied)}
            </span>
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Net Cost</span>
              <span className="text-sm font-bold text-primary">
                {formatCurrency(netCustomerCost)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
