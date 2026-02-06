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

export interface TransactionRow {
  id: string
  period: string
  payerAccount: string
  usageAccountName: string
  usageAccountId: string
  amountUsd: number
  amountEur: number
  exchangeRate: number
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
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Period</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Payer Account</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Usage Account</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} className="border-border">
                    <TableCell className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">
                      {tx.period}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-foreground whitespace-nowrap">
                      {tx.payerAccount}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground">{tx.usageAccountName}</span>
                        <span className="text-xs font-mono text-muted-foreground">{tx.usageAccountId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-sm font-semibold text-foreground">{formatCurrencyUSD(tx.amountUsd)}</span>
                        <span className="text-xs text-muted-foreground">{formatCurrency(tx.amountEur)}</span>
                        <span className="flex items-center gap-0.5 text-[10px] font-mono text-muted-foreground">
                          <ArrowRightLeft className="h-2.5 w-2.5" />
                          {tx.exchangeRate.toFixed(4)}
                        </span>
                      </div>
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
