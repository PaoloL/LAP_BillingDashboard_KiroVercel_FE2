"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrencyUSD } from "@/lib/format"
import { Cloud } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface AwsVsMarketplaceWidgetProps {
  awsTotal: number
  marketplaceTotal: number
}

const COLORS = ["var(--primary)", "var(--accent)"]

export function AwsVsMarketplaceWidget({ awsTotal, marketplaceTotal }: AwsVsMarketplaceWidgetProps) {
  const grandTotal = awsTotal + marketplaceTotal
  const awsPercent = grandTotal > 0 ? (awsTotal / grandTotal) * 100 : 0
  const mpPercent = grandTotal > 0 ? (marketplaceTotal / grandTotal) * 100 : 0

  const data = [
    { name: "AWS", value: awsTotal },
    { name: "Marketplace", value: marketplaceTotal },
  ]

  return (
    <Card className="border-border h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Cloud className="h-4 w-4 text-secondary" />
          AWS vs Marketplace
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <div className="h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={68}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrencyUSD(value)}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">AWS</span>
              <span className="text-xs text-muted-foreground">({awsPercent.toFixed(1)}%)</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{formatCurrencyUSD(awsTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="text-sm text-muted-foreground">Marketplace</span>
              <span className="text-xs text-muted-foreground">({mpPercent.toFixed(1)}%)</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{formatCurrencyUSD(marketplaceTotal)}</span>
          </div>
          <div className="border-t border-border pt-2">
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
