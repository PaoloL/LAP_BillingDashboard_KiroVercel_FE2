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
import { formatCurrency } from "@/lib/format"
import { BarChart3 } from "lucide-react"

interface CostBreakdownWidgetProps {
  usage: number
  tax: number
  fee: number
  discount: number
  credits: number
  adjustment: number
  rebateEnabled?: boolean
  totalGross?: number  // Customer gross cost (overrides calculation)
}

export function CostBreakdownWidget({
  usage,
  tax,
  fee,
  discount,
  credits,
  adjustment,
  rebateEnabled = false,
  totalGross,
}: CostBreakdownWidgetProps) {
  const allRows = [
    { label: "Usage", value: usage, colorClass: "text-usage" },
    { label: "Fees", value: fee, colorClass: "text-fees" },
    { label: "Discount", value: rebateEnabled ? discount : 0, colorClass: "text-secondary" },
    { label: "Credits", value: rebateEnabled ? credits : 0, colorClass: "text-credits" },
    { label: "Adjustment", value: rebateEnabled ? adjustment : 0, colorClass: "text-muted-foreground" },
  ]

  // Use provided totalGross if available, otherwise calculate
  // Tax is NEVER included, discount/credits/adjustment only if rebate enabled
  const total = totalGross !== undefined 
    ? totalGross 
    : usage + fee + (rebateEnabled ? discount + credits + adjustment : 0)

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
              <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">Amount (EUR)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allRows.map((row) => (
              <TableRow key={row.label} className="border-border">
                <TableCell className="py-2 text-sm text-foreground">{row.label}</TableCell>
                <TableCell className={`py-2 text-right text-sm font-medium ${row.colorClass}`}>
                  {formatCurrency(row.value)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2 border-border font-semibold">
              <TableCell className="py-2.5 text-sm font-bold text-foreground">Total</TableCell>
              <TableCell className="py-2.5 text-right text-sm font-bold text-primary">
                {formatCurrency(total)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
