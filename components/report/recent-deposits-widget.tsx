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
import { formatCurrencyUSD, formatCurrency } from "@/lib/format"
import { PiggyBank, ArrowRightLeft } from "lucide-react"

export interface DepositRow {
  id: string
  date: string
  description: string
  amountUsd: number
  amountEur: number
  exchangeRate: number
}

interface RecentDepositsWidgetProps {
  deposits: DepositRow[]
}

export function RecentDepositsWidget({ deposits }: RecentDepositsWidgetProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <PiggyBank className="h-4 w-4 text-secondary" />
          Last 10 Deposits
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deposits.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No deposits found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Date</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Description</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">USD</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">EUR</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">
                    <span className="flex items-center justify-end gap-1">
                      <ArrowRightLeft className="h-3 w-3" />
                      Rate
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.map((dep) => (
                  <TableRow key={dep.id} className="border-border">
                    <TableCell className="py-2 text-xs text-muted-foreground whitespace-nowrap">
                      {dep.date}
                    </TableCell>
                    <TableCell className="py-2 text-sm text-foreground">
                      <span className="truncate max-w-[180px] block">{dep.description}</span>
                    </TableCell>
                    <TableCell className="py-2 text-right text-sm font-medium text-secondary whitespace-nowrap">
                      {formatCurrencyUSD(dep.amountUsd)}
                    </TableCell>
                    <TableCell className="py-2 text-right text-sm font-medium text-secondary whitespace-nowrap">
                      {formatCurrency(dep.amountEur)}
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {dep.exchangeRate.toFixed(4)}
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
