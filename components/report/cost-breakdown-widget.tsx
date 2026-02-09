"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrencyUSD } from "@/lib/format"
import { BarChart3 } from "lucide-react"

interface CostBreakdownWidgetProps {
  usage: number
  tax: number
  fee: number
  discount: number
  credits: number
  adjustment: number
}

export function CostBreakdownWidget({
  usage,
  tax,
  fee,
  discount,
  credits,
  adjustment,
}: CostBreakdownWidgetProps) {
  const rows = [
    { label: "Usage", value: usage, colorClass: "text-usage" },
    { label: "Tax", value: tax, colorClass: "text-tax" },
    { label: "Fees", value: fee, colorClass: "text-fees" },
    { label: "Discount", value: discount, colorClass: "text-secondary" },
    { label: "Credits", value: credits, colorClass: "text-credits" },
    { label: "Adjustment", value: adjustment, colorClass: "text-muted-foreground" },
  ]

  const total = usage + tax + fee + discount + credits + adjustment

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BarChart3 className="h-4 w-4 text-secondary" />
          Cost Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Category</TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">Amount (USD)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label} className="border-border">
                <TableCell className="py-2 text-sm text-foreground">{row.label}</TableCell>
                <TableCell className={`py-2 text-right text-sm font-medium ${row.colorClass}`}>
                  {formatCurrencyUSD(row.value)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2 border-border font-semibold">
              <TableCell className="py-2.5 text-sm font-bold text-foreground">Total</TableCell>
              <TableCell className="py-2.5 text-right text-sm font-bold text-primary">
                {formatCurrencyUSD(total)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
