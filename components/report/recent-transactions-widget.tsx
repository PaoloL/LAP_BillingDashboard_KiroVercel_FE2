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
import { Receipt, ArrowRightLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export interface TransactionRow {
  id: string
  date: string
  description: string
  amountUsd: number
  amountEur: number
  exchangeRate: number
  dataType?: string
}

interface RecentTransactionsWidgetProps {
  transactions: TransactionRow[]
}

export function RecentTransactionsWidget({ transactions }: RecentTransactionsWidgetProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Receipt className="h-4 w-4 text-secondary" />
          Last 10 Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No transactions found
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
                {transactions.map((tx) => (
                  <TableRow key={tx.id} className="border-border">
                    <TableCell className="py-2 text-xs text-muted-foreground whitespace-nowrap">
                      {tx.date}
                    </TableCell>
                    <TableCell className="py-2 text-sm text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[140px]">{tx.description}</span>
                        {tx.dataType && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal shrink-0">
                            {tx.dataType}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-right text-sm font-medium text-foreground whitespace-nowrap">
                      {formatCurrencyUSD(tx.amountUsd)}
                    </TableCell>
                    <TableCell className="py-2 text-right text-sm font-medium text-foreground whitespace-nowrap">
                      {formatCurrency(tx.amountEur)}
                    </TableCell>
                    <TableCell className="py-2 text-right text-xs font-mono text-muted-foreground whitespace-nowrap">
                      {tx.exchangeRate.toFixed(4)}
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
