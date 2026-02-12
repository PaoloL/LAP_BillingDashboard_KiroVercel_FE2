"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/format"
import { PiggyBank } from "lucide-react"

export interface DepositRow {
  id: string
  dateTime: string
  period: string
  costCenter: string
  amountEur: number
  description: string
  poNumber: string
}

interface RecentDepositsWidgetProps {
  deposits: DepositRow[]
}

type RangeFilter = "3M" | "6M" | "12M"

function getMonthsCutoff(months: number): Date {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  d.setHours(0, 0, 0, 0)
  return d
}

export function RecentDepositsWidget({ deposits }: RecentDepositsWidgetProps) {
  const [range, setRange] = useState<RangeFilter>("3M")

  const filtered = useMemo(() => {
    const months = range === "3M" ? 3 : range === "6M" ? 6 : 12
    const cutoff = getMonthsCutoff(months)
    return deposits
      .filter((dep) => new Date(dep.dateTime) >= cutoff)
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
  }, [deposits, range])

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <PiggyBank className="h-4 w-4 text-secondary" />
            Deposits
          </CardTitle>
          <div className="flex items-center gap-1">
            {(["3M", "6M", "12M"] as RangeFilter[]).map((r) => (
              <Button
                key={r}
                variant={range === r ? "default" : "outline"}
                size="sm"
                className={`h-7 px-2.5 text-xs ${range === r ? "" : "text-muted-foreground"}`}
                onClick={() => setRange(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No deposits found in the last {range === "3M" ? "3 months" : range === "6M" ? "6 months" : "12 months"}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Period</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Cost Center</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Description</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">Value (EUR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((dep) => (
                  <TableRow key={dep.id} className="border-border">
                    <TableCell className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">
                      {dep.period}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-foreground whitespace-nowrap">
                      {dep.costCenter}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-muted-foreground">
                      {dep.description || '-'}
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm font-semibold text-secondary whitespace-nowrap">
                      {formatCurrency(dep.amountEur)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
