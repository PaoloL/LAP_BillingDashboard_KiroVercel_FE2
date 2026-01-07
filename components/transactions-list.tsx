"use client"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import type { TransactionDetail } from "@/lib/types"
import { dataService } from "@/lib/data/data-service"

function TransactionRow({ transaction }: { transaction: TransactionDetail }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      <tr className="cursor-pointer hover:bg-muted/50" onClick={() => setIsExpanded(!isExpanded)}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <div className="space-y-0.5">
              <div className="font-medium text-foreground">{transaction.dateTime.toLocaleDateString("en-GB")}</div>
              <div className="text-sm text-muted-foreground">
                {transaction.dateTime.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="space-y-0.5">
            <div className="font-medium text-foreground">{transaction.payerAccount.name}</div>
            <div className="text-sm font-mono text-muted-foreground">{transaction.payerAccount.id}</div>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="space-y-0.5">
            <div className="font-medium text-foreground">{transaction.usageAccount.name}</div>
            <div className="text-sm font-mono text-muted-foreground">{transaction.usageAccount.id}</div>
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="space-y-0.5">
            <div className="font-semibold text-foreground">{formatCurrency(transaction.distributorCost.eur)}</div>
            <div className="text-sm text-muted-foreground">
              $
              {transaction.distributorCost.usd.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="space-y-0.5">
            <div className="font-semibold text-foreground">{formatCurrency(transaction.sellerCost.eur)}</div>
            <div className="text-sm text-muted-foreground">
              $
              {transaction.sellerCost.usd.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="space-y-0.5">
            <div className="text-lg font-semibold text-[#00243E]">{formatCurrency(transaction.customerCost.eur)}</div>
            <div className="text-sm text-muted-foreground">
              $
              {transaction.customerCost.usd.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-mono text-foreground">{transaction.exchangeRate.toFixed(3)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  transaction.dataType === "Export"
                    ? "bg-[#026172]/10 text-[#026172]"
                    : "bg-[#EC9400]/10 text-[#EC9400]"
                }`}
              >
                {transaction.dataType}
              </span>
            </div>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-muted/30">
          <td colSpan={7} className="px-4 py-4">
            <div className="ml-10 space-y-3">
              <h4 className="text-sm font-semibold text-[#00243E]">Cost Breakdown</h4>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Usage</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#EC9400]" />
                    <div className="font-semibold text-[#EC9400]">
                      {formatCurrency(transaction.costBreakdown.usage)}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Fee</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#00243E]" />
                    <div className="font-semibold text-[#00243E]">{formatCurrency(transaction.costBreakdown.fee)}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Discount</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#026172]" />
                    <div className="font-semibold text-[#026172]">
                      {formatCurrency(transaction.costBreakdown.discount)}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Adjustment</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#909090]" />
                    <div className="font-semibold text-foreground">
                      {formatCurrency(transaction.costBreakdown.adjustment)}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Tax</div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#909090]" />
                    <div className="font-semibold text-foreground">{formatCurrency(transaction.costBreakdown.tax)}</div>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

interface TransactionsListProps {
  dateRange?: { from: Date | undefined; to: Date | undefined }
  sortBy?: "name" | "date"
  sortOrder?: "asc" | "desc"
}

export function TransactionsList({ dateRange, sortBy = "date", sortOrder = "desc" }: TransactionsListProps) {
  const [transactionsByPeriod, setTransactionsByPeriod] = useState<Record<string, TransactionDetail[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const data = await dataService.getTransactions({
          startDate: dateRange?.from,
          endDate: dateRange?.to,
          sortBy,
          sortOrder,
        })
        setTransactionsByPeriod(data)
      } catch (error) {
        console.error("[v0] Failed to load transactions:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [dateRange, sortBy, sortOrder])

  const filteredAndSortedTransactions = useMemo(() => {
    let allTransactions: TransactionDetail[] = []

    Object.values(transactionsByPeriod).forEach((transactions) => {
      allTransactions = [...allTransactions, ...transactions]
    })

    if (dateRange?.from || dateRange?.to) {
      allTransactions = allTransactions.filter((transaction) => {
        const txDate = transaction.dateTime
        if (dateRange.from && txDate < dateRange.from) return false
        if (dateRange.to) {
          const endOfDay = new Date(dateRange.to)
          endOfDay.setHours(23, 59, 59, 999)
          if (txDate > endOfDay) return false
        }
        return true
      })
    }

    allTransactions.sort((a, b) => {
      if (sortBy === "date") {
        const comparison = a.dateTime.getTime() - b.dateTime.getTime()
        return sortOrder === "asc" ? comparison : -comparison
      } else {
        const comparison = a.usageAccount.name.localeCompare(b.usageAccount.name)
        return sortOrder === "asc" ? comparison : -comparison
      }
    })

    const grouped: Record<string, TransactionDetail[]> = {}
    allTransactions.forEach((transaction) => {
      const period = transaction.dateTime.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      if (!grouped[period]) {
        grouped[period] = []
      }
      grouped[period].push(transaction)
    })

    return grouped
  }, [transactionsByPeriod, dateRange, sortBy, sortOrder])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {Object.entries(filteredAndSortedTransactions).map(([period, transactions]) => (
        <div key={period}>
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">{period}</h3>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date and Time</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Payer Account</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Usage Account</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                        Distributor Cost
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Seller Cost</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Customer Cost</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Info</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((transaction) => (
                      <TransactionRow key={transaction.id} transaction={transaction} />
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
      {Object.keys(filteredAndSortedTransactions).length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No transactions found for the selected filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
