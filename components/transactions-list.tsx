"use client"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState, useMemo } from "react"
import type { TransactionDetail } from "@/lib/types"

const transactionsByPeriod: Record<string, TransactionDetail[]> = {
  "January 2025": [
    {
      id: "txn-001",
      dateTime: new Date("2025-01-15T14:30:00"),
      payerAccount: {
        name: "AWS Main Account",
        id: "123456789012",
      },
      usageAccount: {
        name: "Acme Corporation",
        id: "aws-123456",
      },
      costBreakdown: {
        usage: 12345.67,
        fee: 100.0,
        discount: -1234.56,
        adjustment: -50.0,
        tax: 2345.67,
      },
      distributorCost: {
        usd: 13500.0,
        eur: 12345.67,
      },
      sellerCost: {
        usd: 12150.0,
        eur: 11111.1,
      },
      customerCost: {
        usd: 10930.0,
        eur: 10000.0,
      },
      exchangeRate: 1.093,
      dataType: "Export",
      info: "Monthly AWS usage",
    },
    {
      id: "txn-002",
      dateTime: new Date("2025-01-20T09:15:00"),
      payerAccount: {
        name: "AWS Main Account",
        id: "123456789012",
      },
      usageAccount: {
        name: "TechStart GmbH",
        id: "aws-789012",
      },
      costBreakdown: {
        usage: 8765.43,
        fee: 50.0,
        discount: -876.54,
        adjustment: 0,
        tax: 1576.23,
      },
      distributorCost: {
        usd: 9500.0,
        eur: 8765.43,
      },
      sellerCost: {
        usd: 8550.0,
        eur: 7888.89,
      },
      customerCost: {
        usd: 7588.0,
        eur: 7000.0,
      },
      exchangeRate: 1.084,
      dataType: "Manual",
      info: "AWS EC2 and S3 usage",
    },
  ],
  "December 2024": [
    {
      id: "txn-003",
      dateTime: new Date("2024-12-10T16:45:00"),
      payerAccount: {
        name: "AWS Main Account",
        id: "123456789012",
      },
      usageAccount: {
        name: "Global Solutions",
        id: "aws-345678",
      },
      costBreakdown: {
        usage: 15678.9,
        fee: 150.0,
        discount: -1567.89,
        adjustment: 100.0,
        tax: 2981.09,
      },
      distributorCost: {
        usd: 17000.0,
        eur: 15678.9,
      },
      sellerCost: {
        usd: 15300.0,
        eur: 14111.01,
      },
      customerCost: {
        usd: 14634.0,
        eur: 13500.0,
      },
      exchangeRate: 1.084,
      dataType: "Export",
      info: "Full stack deployment",
    },
  ],
}

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
  const filteredAndSortedTransactions = useMemo(() => {
    let allTransactions: TransactionDetail[] = []

    // Flatten all transactions
    Object.values(transactionsByPeriod).forEach((transactions) => {
      allTransactions = [...allTransactions, ...transactions]
    })

    // Apply date range filter
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

    // Apply sorting
    allTransactions.sort((a, b) => {
      if (sortBy === "date") {
        const comparison = a.dateTime.getTime() - b.dateTime.getTime()
        return sortOrder === "asc" ? comparison : -comparison
      } else {
        // Sort by usage account name
        const comparison = a.usageAccount.name.localeCompare(b.usageAccount.name)
        return sortOrder === "asc" ? comparison : -comparison
      }
    })

    // Group by period
    const grouped: Record<string, TransactionDetail[]> = {}
    allTransactions.forEach((transaction) => {
      const period = transaction.dateTime.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      if (!grouped[period]) {
        grouped[period] = []
      }
      grouped[period].push(transaction)
    })

    return grouped
  }, [dateRange, sortBy, sortOrder])

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
