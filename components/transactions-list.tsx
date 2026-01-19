"use client"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, formatCurrencyUSD } from "@/lib/format"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import type { TransactionDetail } from "@/lib/types"
import { dataService } from "@/lib/data/data-service"

function TransactionRow({ transaction }: { transaction: TransactionDetail }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const detailedBreakdown = transaction.details?.entity?.aws?.breakdown || {}
  const marketplaceBreakdown = transaction.details?.entity?.awsmp?.breakdown || {}

  const marginEur = (transaction.customerCost?.eur || 0) - (transaction.sellerCost?.eur || 0)
  const marginUsd = (transaction.customerCost?.usd || 0) - (transaction.sellerCost?.usd || 0)
  const marginColor = marginEur < 0 ? "text-[#F26522]" : "text-green-600"

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
              <div className="font-medium text-foreground whitespace-nowrap">
                {transaction.billingPeriod
                  ? new Date(transaction.billingPeriod + "-01").toLocaleDateString("en-GB", {
                      month: "short",
                      year: "numeric",
                    })
                  : transaction.dateTime.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
              </div>
              <div className="text-xs text-muted-foreground">
                {transaction.dateTime
                  .toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })
                  .replace(/\//g, "/")}{" "}
                -{" "}
                {transaction.dateTime.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
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
            <div className="font-semibold text-foreground">{formatCurrency(transaction.customerCost?.eur || 0)}</div>
            <div className="text-sm text-muted-foreground">
              $
              {(transaction.customerCost?.usd || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="space-y-0.5">
            <div className={`font-semibold ${marginColor}`}>{formatCurrency(marginEur)}</div>
            <div className={`text-sm ${marginColor === "text-[#F26522]" ? "text-[#F26522]/70" : "text-green-600/70"}`}>
              $
              {marginUsd.toLocaleString("en-US", {
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
            <div className="text-xs text-muted-foreground">Rate: {transaction.exchangeRate.toFixed(3)}</div>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-muted/30">
          <td colSpan={8} className="px-4 py-4">
            <div className="ml-10 space-y-4">
              <h4 className="text-sm font-semibold text-[#00243E]">Cost Breakdown</h4>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Usage Section */}
                <div className="space-y-2 rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="text-sm font-semibold text-[#EC9400]">Usage</div>
                    <div className="text-sm font-bold text-[#EC9400]">
                      {formatCurrencyUSD(detailedBreakdown.usage?.totals?.usd || 0)}
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Usage</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(detailedBreakdown.usage?.details?.Usage?.usd || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discounted Usage</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(detailedBreakdown.usage?.details?.DiscountedUsage?.usd || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SP Covered Usage</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(detailedBreakdown.usage?.details?.SavingsPlanCoveredUsage?.usd || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fee Section */}
                <div className="space-y-2 rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="text-sm font-semibold text-[#00243E]">Fee</div>
                    <div className="text-sm font-bold text-[#00243E]">
                      {formatCurrencyUSD(detailedBreakdown.fee?.totals?.usd || 0)}
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fee</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(detailedBreakdown.fee?.details?.Fee?.usd || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">RI Fee</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(detailedBreakdown.fee?.details?.RIFee?.usd || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SP Recurring Fee</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(detailedBreakdown.fee?.details?.SavingsPlanRecurringFee?.usd || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SP Upfront Fee</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(detailedBreakdown.fee?.details?.SavingsPlanUpfrontFee?.usd || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Discount Section */}
                <div className="space-y-2 rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="text-sm font-semibold text-[#026172]">Discount</div>
                    <div className="text-sm font-bold text-[#026172]">
                      {formatCurrencyUSD(Math.abs(detailedBreakdown.discount?.totals?.usd || 0))}
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bundled Discount</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(Math.abs(detailedBreakdown.discount?.details?.BundledDiscount?.usd || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(Math.abs(detailedBreakdown.discount?.details?.Discount?.usd || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Credit</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(Math.abs(detailedBreakdown.discount?.details?.Credit?.usd || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Private Rate Discount</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(
                          Math.abs(detailedBreakdown.discount?.details?.PrivateRateDiscount?.usd || 0),
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distributor Discount</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(
                          Math.abs(detailedBreakdown.discount?.details?.DistributorDiscount?.usd || 0),
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Adjustment Section */}
                <div className="space-y-2 rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="text-sm font-semibold text-green-600">Adjustment</div>
                    <div className="text-sm font-bold text-green-600">
                      {formatCurrencyUSD(Math.abs(detailedBreakdown.adjustment?.totals?.usd || 0))}
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Credit</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(Math.abs(detailedBreakdown.adjustment?.details?.Credit?.usd || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Refund</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(Math.abs(detailedBreakdown.adjustment?.details?.Refund?.usd || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SP Negation</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(
                          Math.abs(detailedBreakdown.adjustment?.details?.SavingsPlanNegation?.usd || 0),
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tax Section */}
                <div className="space-y-2 rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="text-sm font-semibold text-foreground">Tax</div>
                    <div className="text-sm font-bold text-foreground">
                      {formatCurrencyUSD(detailedBreakdown.tax?.totals?.usd || 0)}
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(detailedBreakdown.tax?.details?.Tax?.usd || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Marketplace Section */}
                <div className="space-y-2 rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <div className="text-sm font-semibold text-purple-600">Marketplace</div>
                    <div className="text-sm font-bold text-purple-600">
                      {formatCurrencyUSD(marketplaceBreakdown.totals?.usd || 0)}
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Usage</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(marketplaceBreakdown.usage?.totals?.usd || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fee</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(marketplaceBreakdown.fee?.totals?.usd || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(marketplaceBreakdown.tax?.totals?.usd || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(Math.abs(marketplaceBreakdown.discount?.totals?.usd || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Adjustment</span>
                      <span className="font-medium">
                        {formatCurrencyUSD(Math.abs(marketplaceBreakdown.adjustment?.totals?.usd || 0))}
                      </span>
                    </div>
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
  billingPeriodRange?: { startPeriod: string; endPeriod: string } // YYYY-MM format
  sortBy?: "name" | "date"
  sortOrder?: "asc" | "desc"
  payerAccountId?: string
  usageAccountId?: string
}

export function TransactionsList({
  dateRange,
  billingPeriodRange,
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
          // Use billing periods if available, otherwise fall back to dates
          ...(billingPeriodRange
            ? {
                startPeriod: billingPeriodRange.startPeriod,
                endPeriod: billingPeriodRange.endPeriod,
              }
            : {
                startDate: dateRange?.from,
                endDate: dateRange?.to,
              }),
          sortBy,
          sortOrder,
          payerAccountId,
          usageAccountId,
        })

        // Handle new API response format (flat array) and group by period
        const processedData: Record<string, TransactionDetail[]> = {}

        if (Array.isArray(data.data)) {
          // New format: data is a flat array
          data.data.forEach((tx) => {
            const billingPeriod = tx.billingPeriod || ""
            const periodKey = billingPeriod
              ? new Date(billingPeriod + "-01").toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })
              : "Unknown Period"

            if (!processedData[periodKey]) {
              processedData[periodKey] = []
            }

            processedData[periodKey].push({
              ...tx,
              dateTime: new Date(tx.updatedAt || tx.dateTime),
              // Keep the full details structure for detailed breakdown display
              details: tx.details,
              // Map new structure to old costBreakdown format for compatibility
              costBreakdown: {
                usage: tx.details?.customer?.entity?.aws?.usage?.totals?.usd || 0,
                fee: tx.details?.customer?.entity?.aws?.fee?.totals?.usd || 0,
                discount: Math.abs(tx.details?.customer?.entity?.aws?.discount?.totals?.usd || 0),
                credits: Math.abs(tx.details?.customer?.entity?.aws?.adjustment?.totals?.usd || 0),
                adjustment: 0,
                tax: tx.details?.customer?.entity?.aws?.tax?.totals?.usd || 0,
              },
              distributorCost: tx.summary?.distributor || {},
              sellerCost: tx.summary?.seller || {},
              customerCost: tx.summary?.customer || {},
              payerAccount: tx.accounts?.payer || {},
              usageAccount: tx.accounts?.usage || {},
            })
          })
        } else {
          // Old format: data is grouped by period (backward compatibility)
          Object.entries(data.data || {}).forEach(([period, transactions]) => {
            if (Array.isArray(transactions)) {
              processedData[period] = transactions.map((tx) => ({
                ...tx,
                dateTime: new Date(tx.dateTime),
              }))
            }
          })
        }

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
        const dateA = new Date(periodA + " 1, 2000") // Convert "January 2026" to date
        const dateB = new Date(periodB + " 1, 2000")
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
          const billingDate = new Date(transaction.billingPeriod + "-01")

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
      const dateA = new Date(periodA + " 1, 2000")
      const dateB = new Date(periodB + " 1, 2000")
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
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Margin</th>
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
