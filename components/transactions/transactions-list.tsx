"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatCurrencyUSD } from "@/lib/format"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import type { TransactionDetail } from "@/lib/types"
import { dataService } from "@/lib/data/data-service"

function TransactionRow({ transaction }: { transaction: TransactionDetail }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const detailedBreakdown = transaction.details?.entity?.aws?.breakdown || {}
  const marketplaceBreakdown = transaction.details?.entity?.awsmp?.breakdown || {}
  
  const isDeposit = transaction.transactionType === 'DEPOSIT' || transaction.transactionType === 'MANUAL'

  // Generate description based on transaction type
  const getDescription = () => {
    if (isDeposit) {
      // Deposit: "Deposit on <customer-name> in <cost-center>"
      const customerName = transaction.accounts?.payer?.name || 'Unknown Customer'
      const costCenter = transaction.details?.costCenterName || 'Unknown Cost Center'
      return `Deposit on ${customerName} in ${costCenter}`
    } else {
      // Transaction: "Transaction on <usage-account-name> by Amazon Data Export"
      const usageName = transaction.accounts?.usage?.name || 'Unknown Usage'
      return `Transaction on ${usageName} by Amazon Data Export`
    }
  }

  const description = getDescription()
  const exchangeRate = transaction.exchangeRate || null

  // For deposits, margin = deposit amount, costs are empty
  const marginEur = isDeposit 
    ? (transaction.details?.value || 0)
    : (transaction.totals?.customer?.eur || 0) - (transaction.totals?.seller?.eur || 0)
  const marginUsd = isDeposit
    ? (transaction.details?.value || 0)
    : (transaction.totals?.customer?.usd || 0) - (transaction.totals?.seller?.usd || 0)
  const marginColor = marginEur < 0 ? "text-[#F26522]" : "text-green-600"

  return (
    <>
      <tr className="hover:bg-muted/50">
        <td className="px-4 py-3 w-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </td>
        <td className="px-4 py-3">
          <div className="font-medium text-foreground whitespace-nowrap">
            {transaction.billingPeriod
              ? new Date(transaction.billingPeriod + "-01").toLocaleDateString("en-GB", {
                  month: "short",
                  year: "numeric",
                })
              : transaction.dateTime?.toLocaleDateString("en-GB", { month: "short", year: "numeric" }) || 'N/A'}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="space-y-1">
            <div className="text-sm text-foreground">{description}</div>
            <div className="text-xs text-muted-foreground">
              Payer: {transaction.accounts?.payer?.name || 'N/A'} ({transaction.accounts?.payer?.id || 'N/A'})
            </div>
            <div className="text-xs text-muted-foreground">
              Usage: {transaction.accounts?.usage?.name || 'N/A'} ({transaction.accounts?.usage?.id || 'N/A'})
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-right">
          {isDeposit ? (
            <div className="space-y-0.5">
              <div className="font-semibold text-[#026172]">
                +{formatCurrency(transaction.details?.value || 0)}
              </div>
              <div className="text-sm text-[#026172]/70">
                +${(transaction.details?.value || 0).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="font-semibold text-[#EC9400]">
                {formatCurrency(-(transaction.totals?.customer?.eur || 0))}
              </div>
              <div className="text-sm text-[#EC9400]/70">
                ${(-(transaction.totals?.customer?.usd || 0)).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          )}
        </td>
        <td className="px-4 py-3 text-center">
          {exchangeRate && (
            <div className="text-sm text-muted-foreground">
              {exchangeRate.toFixed(2)}
            </div>
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-muted/30">
          <td colSpan={5} className="px-4 py-4">
            <div className="ml-10 space-y-4">
              {isDeposit ? (
                <>
                  <h4 className="text-sm font-semibold text-[#00243E]">Deposit Information</h4>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 rounded-lg border border-border bg-background p-4">
                      <div className="text-sm font-semibold text-muted-foreground">Deposit Amount</div>
                      <div className="space-y-1">
                        <div className="text-xl font-bold text-[#026172]">
                          {formatCurrency(transaction.details?.value || 0)}
                        </div>
                        <div className="text-sm text-[#026172]/70">
                          ${(transaction.details?.value || 0).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 rounded-lg border border-border bg-background p-4">
                      <div className="text-sm font-semibold text-muted-foreground">Details</div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Description: </span>
                          <span className="font-medium">{transaction.details?.description || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Period: </span>
                          <span className="font-medium">
                            {transaction.billingPeriod || 'N/A'}
                            {transaction.dateTime && (
                              <span className="text-muted-foreground">
                                {' '}({transaction.dateTime.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {transaction.dateTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })})
                              </span>
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created By: </span>
                          <span className="font-medium">{transaction.createdBy || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-sm font-semibold text-[#00243E]">Cost Summary</h4>
                  <div className="grid gap-4 md:grid-cols-4 mb-4">
                    <div className="space-y-2 rounded-lg border border-border bg-background p-4">
                      <div className="text-sm font-semibold text-muted-foreground">Distributor Cost</div>
                      <div className="space-y-1">
                        <div className="text-xl font-bold text-foreground">
                          {formatCurrency(transaction.totals?.distributor?.eur || 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${(transaction.totals?.distributor?.usd || 0).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 rounded-lg border border-border bg-background p-4">
                      <div className="text-sm font-semibold text-muted-foreground">Seller Cost</div>
                      <div className="space-y-1">
                        <div className="text-xl font-bold text-foreground">
                          {formatCurrency(transaction.totals?.seller?.eur || 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${(transaction.totals?.seller?.usd || 0).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 rounded-lg border border-border bg-background p-4">
                      <div className="text-sm font-semibold text-muted-foreground">Customer Cost</div>
                      <div className="space-y-1">
                        <div className="text-xl font-bold text-[#F26522]">
                          {formatCurrency(transaction.totals?.customer?.eur || 0)}
                        </div>
                        <div className="text-sm text-[#F26522]/70">
                          ${(transaction.totals?.customer?.usd || 0).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 rounded-lg border border-border bg-background p-4">
                      <div className="text-sm font-semibold text-muted-foreground">Margin</div>
                      <div className="space-y-1">
                        <div className={`text-xl font-bold ${marginColor}`}>
                          {formatCurrency(marginEur)}
                        </div>
                        <div className={`text-sm ${marginColor === "text-[#F26522]" ? "text-[#F26522]/70" : "text-green-600/70"}`}>
                          ${marginUsd.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
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
              <div className="mt-4 rounded-lg border border-[#026172]/20 bg-[#026172]/5 p-3">
                <div className="text-xs text-muted-foreground">
                  Exchange Rate Applied: <span className="font-semibold text-[#026172]">{(transaction.exchangeRate || 1.0).toFixed(4)}</span>
                </div>
              </div>
              </>
              )}
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
  transactionType?: string
}

export function TransactionsList({
  dateRange,
  billingPeriodRange,
  sortBy = "date",
  sortOrder = "desc",
  payerAccountId,
  usageAccountId,
  transactionType,
}: TransactionsListProps) {
  const [transactionsByPeriod, setTransactionsByPeriod] = useState<Record<string, TransactionDetail[]>>({})
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0)
  }, [dateRange, billingPeriodRange, payerAccountId, usageAccountId, transactionType])

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
          limit: 500, // Fetch up to 500 transactions
        })

        // Handle new API response format (flat array) and group by period
        const processedData: Record<string, TransactionDetail[]> = {}

        if (Array.isArray(data.data)) {
          // New format: data is a flat array
          data.data.forEach((tx) => {
            // Filter by transaction type if specified
            if (transactionType && tx.transactionType !== transactionType) {
              return
            }
            
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
              accounts: tx.accounts || { payer: {}, usage: {} },
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
  }, [dateRange, sortBy, sortOrder, payerAccountId, usageAccountId, transactionType, billingPeriodRange])

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

  // Pagination: 20 items per page
  const ITEMS_PER_PAGE = 20
  const allTransactions = useMemo(() => {
    const periods = Object.keys(filteredAndSortedTransactions).sort((a, b) => {
      const dateA = new Date(a.split(' ').reverse().join(' '))
      const dateB = new Date(b.split(' ').reverse().join(' '))
      return dateB.getTime() - dateA.getTime()
    })
    
    const transactions: TransactionDetail[] = []
    periods.forEach(period => {
      transactions.push(...filteredAndSortedTransactions[period])
    })
    return transactions
  }, [filteredAndSortedTransactions])

  const totalPages = Math.ceil(allTransactions.length / ITEMS_PER_PAGE)
  const startIndex = currentPage * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentTransactions = allTransactions.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {allTransactions.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, allTransactions.length)} of {allTransactions.length} transactions
            </h3>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 w-12"></th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Period</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Description</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Amount (EUR / USD)</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Info</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {currentTransactions.map((transaction, index) => (
                      <TransactionRow 
                        key={`${transaction.id}-${transaction.accounts?.usage?.id || index}`} 
                        transaction={transaction} 
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No transactions found for the selected filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
