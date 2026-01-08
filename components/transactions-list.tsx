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
            <div className="font-medium text-foreground">
              {transaction.billingPeriod ? 
                new Date(transaction.billingPeriod + '-01').toLocaleDateString("en-GB", { month: "long", year: "numeric" }) :
                transaction.dateTime.toLocaleDateString("en-GB", { month: "long", year: "numeric" })
              }
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
            <div className="font-semibold text-foreground">{formatCurrency(transaction.distributorCost?.eur || 0)}</div>
            <div className="text-sm text-muted-foreground">
              $
              {(transaction.distributorCost?.usd || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="space-y-0.5">
            <div className="font-semibold text-foreground">{formatCurrency(transaction.sellerCost?.eur || 0)}</div>
            <div className="text-sm text-muted-foreground">
              $
              {(transaction.sellerCost?.usd || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="space-y-0.5">
            <div className="text-lg font-semibold text-[#00243E]">
              {formatCurrency(transaction.customerCost?.eur || 0)}
            </div>
            <div className="text-sm text-muted-foreground">
              $
              {(transaction.customerCost?.usd || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
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
            <div className="text-xs text-muted-foreground" style={{ fontSize: '0.75em' }}>
              {transaction.dateTime.toLocaleDateString("en-GB")} {transaction.dateTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="text-xs text-muted-foreground" style={{ fontSize: '0.5em' }}>
              Rate: {transaction.exchangeRate.toFixed(2)}
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
                  <div className="font-semibold text-[#EC9400]">{formatCurrency(transaction.costBreakdown.usage)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Fee</div>
                  <div className="font-semibold text-[#00243E]">{formatCurrency(transaction.costBreakdown.fee)}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Discount</div>
                  <div className="font-semibold text-[#026172]">
                    {formatCurrency(transaction.costBreakdown.discount)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Adjustment</div>
                  <div className="font-semibold text-foreground">
                    {formatCurrency(transaction.costBreakdown.adjustment)}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">Tax</div>
                  <div className="font-semibold text-foreground">{formatCurrency(transaction.costBreakdown.tax)}</div>
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
  payerAccountId?: string
  usageAccountId?: string
}

export function TransactionsList({
  dateRange,
  sortBy = "date",
  sortOrder = "desc",
  payerAccountId,
  usageAccountId,
}: TransactionsListProps) {
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
          payerAccountId,
          usageAccountId,
        })

        // Convert dateTime strings to Date objects
        const processedData: Record<string, TransactionDetail[]> = {}
        Object.entries(data.data || {}).forEach(([period, transactions]) => {
          if (Array.isArray(transactions)) {
            processedData[period] = transactions.map((tx) => ({
              ...tx,
              dateTime: new Date(tx.dateTime),
            }))
          }
        })

        setTransactionsByPeriod(processedData)
      } catch (error) {
        console.error("[v0] Failed to load transactions:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [dateRange, sortBy, sortOrder, payerAccountId, usageAccountId])

  const filteredAndSortedTransactions = useMemo(() => {
    // If no date filtering is needed, return the original period grouping
    if (!dateRange?.from && !dateRange?.to) {
      // Sort periods by date
      const sortedPeriods = Object.entries(transactionsByPeriod).sort(([periodA], [periodB]) => {
        const dateA = new Date(periodA + ' 1, 2000') // Convert "January 2026" to date
        const dateB = new Date(periodB + ' 1, 2000')
        return sortOrder === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
      })
      
      const result: Record<string, TransactionDetail[]> = {}
      sortedPeriods.forEach(([period, transactions]) => {
        if (Array.isArray(transactions)) {
          // Sort transactions within each period
          const sortedTransactions = [...transactions].sort((a, b) => {
            if (sortBy === "date") {
              const comparison = a.dateTime.getTime() - b.dateTime.getTime()
              return sortOrder === "asc" ? comparison : -comparison
            } else {
              const comparison = a.usageAccount.name.localeCompare(b.usageAccount.name)
              return sortOrder === "asc" ? comparison : -comparison
            }
          })
          result[period] = sortedTransactions
        }
      })
      return result
    }

    // Apply date filtering while preserving period grouping
    const filtered: Record<string, TransactionDetail[]> = {}
    
    Object.entries(transactionsByPeriod).forEach(([period, transactions]) => {
      if (Array.isArray(transactions)) {
        const filteredTransactions = transactions.filter((transaction) => {
          // Use billing period for date filtering instead of dateTime
          if (!transaction.billingPeriod) return true
          
          // Convert billing period (YYYY-MM) to date for comparison
          const billingDate = new Date(transaction.billingPeriod + '-01')
          
          if (dateRange.from) {
            const fromMonth = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), 1)
            if (billingDate < fromMonth) return false
          }
          if (dateRange.to) {
            const toMonth = new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), 1)
            if (billingDate > toMonth) return false
          }
          return true
        })
        
        if (filteredTransactions.length > 0) {
          // Sort transactions within each period
          filteredTransactions.sort((a, b) => {
            if (sortBy === "date") {
              const comparison = a.dateTime.getTime() - b.dateTime.getTime()
              return sortOrder === "asc" ? comparison : -comparison
            } else {
              const comparison = a.usageAccount.name.localeCompare(b.usageAccount.name)
              return sortOrder === "asc" ? comparison : -comparison
            }
          })
          
          filtered[period] = filteredTransactions
        }
      }
    })

    // Sort filtered periods by date
    const sortedFilteredPeriods = Object.entries(filtered).sort(([periodA], [periodB]) => {
      const dateA = new Date(periodA + ' 1, 2000')
      const dateB = new Date(periodB + ' 1, 2000')
      return sortOrder === "asc" ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
    })
    
    const result: Record<string, TransactionDetail[]> = {}
    sortedFilteredPeriods.forEach(([period, transactions]) => {
      result[period] = transactions
    })
    
    return result
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Period</th>
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
