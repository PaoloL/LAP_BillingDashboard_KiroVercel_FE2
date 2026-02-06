"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRightLeft } from "lucide-react"
import { formatCurrencyUSD, formatCurrency } from "@/lib/format"

interface ExchangeRateWidgetProps {
  rate: number
  totalUsd: number
  totalEur: number
}

export function ExchangeRateWidget({ rate, totalUsd, totalEur }: ExchangeRateWidgetProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <ArrowRightLeft className="h-4 w-4 text-secondary" />
          Exchange Rate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center rounded-lg bg-muted px-4 py-3">
          <span className="text-lg font-bold text-primary">
            1 USD = {(1 / rate).toFixed(4)} EUR
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total (USD)</span>
            <span className="text-sm font-semibold text-foreground">{formatCurrencyUSD(totalUsd)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total (EUR)</span>
            <span className="text-sm font-semibold text-foreground">{formatCurrency(totalEur)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
