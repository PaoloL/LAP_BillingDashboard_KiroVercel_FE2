"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrencyUSD } from "@/lib/format"
import { Cloud } from "lucide-react"

interface AwsVsMarketplaceWidgetProps {
  awsTotal: number
  marketplaceTotal: number
}

export function AwsVsMarketplaceWidget({ awsTotal, marketplaceTotal }: AwsVsMarketplaceWidgetProps) {
  const grandTotal = awsTotal + marketplaceTotal
  const awsPercent = grandTotal > 0 ? (awsTotal / grandTotal) * 100 : 0
  const mpPercent = grandTotal > 0 ? (marketplaceTotal / grandTotal) * 100 : 0

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Cloud className="h-4 w-4 text-secondary" />
          AWS vs Marketplace
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stacked bar */}
        <div className="space-y-2">
          <div className="flex h-4 w-full overflow-hidden rounded-full">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${awsPercent}%` }}
            />
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${mpPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{awsPercent.toFixed(1)}% AWS</span>
            <span>{mpPercent.toFixed(1)}% Marketplace</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">AWS</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{formatCurrencyUSD(awsTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="text-sm text-muted-foreground">Marketplace</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{formatCurrencyUSD(marketplaceTotal)}</span>
          </div>
          <div className="border-t border-border pt-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Grand Total</span>
              <span className="text-sm font-bold text-primary">{formatCurrencyUSD(grandTotal)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
