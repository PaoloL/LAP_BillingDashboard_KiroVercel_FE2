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
import { formatCurrencyUSD, formatCurrency } from "@/lib/format"
import { Receipt, ArrowRightLeft, ChevronLeft, ChevronRight } from "lucide-react"

export interface TransactionRow {
  id: string
  dateTime: string
  period: string
  payerAccount: string
  payerAccountId: string
  usageAccountName: string
  usageAccountId: string
  amountUsd: number
  amountEur: number
  exchangeRate: number
}

interface RecentTransactionsWidgetProps {
  transactions: TransactionRow[]
}

type RangeFilter = "3M" | "6M" | "12M"

function getMonthsCutoff(months: number): Date {
  const d = new Date()
  d.setMonth(d.getMonth() - months)
  d.setHours(0, 0, 0, 0)
  return d
}

const ITEMS_PER_PAGE = 10

export function RecentTransactionsWidget({ transactions }: RecentTransactionsWidgetProps) {
  const [range, setRange] = useState<RangeFilter>("3M")
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const months = range === "3M" ? 3 : range === "6M" ? 6 : 12
    const cutoff = getMonthsCutoff(months)
    return transactions
      .filter((tx) => new Date(tx.dateTime) >= cutoff)
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
  }, [transactions, range])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginatedData = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  const handleRangeChange = (r: RangeFilter) => {
    setRange(r)
    setPage(0)
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Receipt className="h-4 w-4 text-secondary" />
            Transactions
          </CardTitle>
          <div className="flex items-center gap-1">
            {(["3M", "6M", "12M"] as RangeFilter[]).map((r) => (
              <Button
                key={r}
                variant={range === r ? "default" : "outline"}
                size="sm"
                className={`h-7 px-2.5 text-xs ${range === r ? "" : "text-muted-foreground"}`}
                onClick={() => handleRangeChange(r)}
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
            No transactions found in the last {range === "3M" ? "3 months" : range === "6M" ? "6 months" : "12 months"}
          </p>
        ) : (
          <>
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
                  {paginatedData.map((tx) => (
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
            
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {page * ITEMS_PER_PAGE + 1}-{Math.min((page + 1) * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
