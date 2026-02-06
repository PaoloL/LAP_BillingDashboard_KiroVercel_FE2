"use client"

import { useEffect, useState, useCallback } from "react"
import { ReportHeader } from "@/components/report/report-header"
import { FundBalanceWidget } from "@/components/report/fund-balance-widget"
import { CostBreakdownWidget } from "@/components/report/cost-breakdown-widget"
import { ExchangeRateWidget } from "@/components/report/exchange-rate-widget"
import { AwsVsMarketplaceWidget } from "@/components/report/aws-vs-marketplace-widget"
import { dataService } from "@/lib/data/data-service"
import { Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { UsageAccount, TransactionDetail } from "@/lib/types"

interface ReportData {
  payerName: string
  payerAccountId: string
  usageAccountName: string
  usageAccountId: string
  billingPeriod: string
  generatedDate: string
  status: string
  totalDeposit: number
  totalCost: number
  costBreakdown: {
    usage: number
    tax: number
    fee: number
    discount: number
    credits: number
    adjustment: number
  }
  exchangeRate: number
  totalUsd: number
  totalEur: number
  awsTotal: number
  marketplaceTotal: number
}

export default function ReportPage() {
  const [loading, setLoading] = useState(true)
  const [usageAccounts, setUsageAccounts] = useState<UsageAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [reportData, setReportData] = useState<ReportData | null>(null)

  // Load usage accounts
  useEffect(() => {
    async function loadAccounts() {
      try {
        const accounts = await dataService.getUsageAccounts()
        const registered = accounts.filter((a) => a.status === "Registered")
        setUsageAccounts(registered)
        if (registered.length > 0) {
          setSelectedAccountId(registered[0].accountId)
        }
      } catch (error) {
        console.error("Failed to load usage accounts:", error)
      }
    }
    loadAccounts()
  }, [])

  const loadReportData = useCallback(async (accountId: string) => {
    if (!accountId) return
    setLoading(true)
    try {
      // Fetch account details
      const accounts = await dataService.getUsageAccounts()
      const account = accounts.find((a) => a.accountId === accountId)
      if (!account) {
        setLoading(false)
        return
      }

      // Fetch transactions for this account
      const now = new Date()
      const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
      const transactionsResponse = await dataService.getTransactions({
        usageAccountId: accountId,
        startPeriod: currentPeriod,
        endPeriod: currentPeriod,
      })

      // Aggregate transaction data
      let totalUsage = 0
      let totalTax = 0
      let totalFee = 0
      let totalDiscount = 0
      let totalCredits = 0
      let totalAdjustment = 0
      let totalUsd = 0
      let totalEur = 0
      let awsTotal = 0
      let marketplaceTotal = 0
      let lastExchangeRate = 0
      let lastDate = ""

      const transactions: TransactionDetail[] = []

      if (transactionsResponse.data) {
        // Handle both array and object response
        if (Array.isArray(transactionsResponse.data)) {
          transactions.push(...transactionsResponse.data)
        } else {
          // Mock data comes as grouped object
          Object.values(transactionsResponse.data).forEach((group: unknown) => {
            if (Array.isArray(group)) {
              transactions.push(...(group as TransactionDetail[]))
            }
          })
        }
      }

      transactions.forEach((tx: any) => {
        // Cost breakdown
        if (tx.costBreakdown) {
          totalUsage += tx.costBreakdown.usage || 0
          totalTax += tx.costBreakdown.tax || 0
          totalFee += tx.costBreakdown.fee || 0
          totalDiscount += tx.costBreakdown.discount || 0
          totalCredits += tx.costBreakdown.credits || 0
          totalAdjustment += tx.costBreakdown.adjustment || 0
        }

        // Totals from distributor costs
        if (tx.distributorCost) {
          totalUsd += tx.distributorCost.usd || 0
          totalEur += tx.distributorCost.eur || 0
        } else if (tx.totals?.distributor) {
          totalUsd += tx.totals.distributor.usd || 0
          totalEur += tx.totals.distributor.eur || 0
        }

        // Exchange rate
        if (tx.exchangeRate) {
          lastExchangeRate = tx.exchangeRate
        }

        // AWS vs Marketplace split from entity data
        if (tx.details?.entity) {
          awsTotal += tx.details.entity.aws || 0
          marketplaceTotal += tx.details.entity.awsmp || 0
        }

        // Track latest date
        if (tx.dateTime) {
          const txDate = new Date(tx.dateTime)
          if (!lastDate || txDate.toISOString() > lastDate) {
            lastDate = txDate.toISOString()
          }
        }
      })

      // If no entity-level split, estimate from totals
      if (awsTotal === 0 && marketplaceTotal === 0 && totalUsd > 0) {
        awsTotal = totalUsd * 0.82
        marketplaceTotal = totalUsd * 0.18
      }

      // If no exchange rate found, try to get from exchange rate settings
      if (!lastExchangeRate) {
        try {
          const rates = await dataService.getExchangeRates({ billingPeriod: currentPeriod })
          if (rates.length > 0) {
            lastExchangeRate = rates[0].exchangeRate
          }
        } catch {
          lastExchangeRate = 1.093 // Fallback
        }
      }

      // Get payer info
      const payerAccounts = await dataService.getPayerAccounts()
      const payer = payerAccounts.find((p) => p.accountId === account.payerAccountId) || payerAccounts[0]

      const formattedDate = lastDate
        ? new Date(lastDate).toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })

      setReportData({
        payerName: payer?.accountName || "N/A",
        payerAccountId: payer?.accountId || "N/A",
        usageAccountName: account.accountName || account.name || account.customer,
        usageAccountId: account.accountId,
        billingPeriod: currentPeriod,
        generatedDate: formattedDate,
        status: account.status,
        totalDeposit: account.totalDeposit || 0,
        totalCost: account.totalCustomerCost || totalEur || 0,
        costBreakdown: {
          usage: totalUsage,
          tax: totalTax,
          fee: totalFee,
          discount: totalDiscount,
          credits: totalCredits,
          adjustment: totalAdjustment,
        },
        exchangeRate: lastExchangeRate || 1.093,
        totalUsd,
        totalEur,
        awsTotal,
        marketplaceTotal,
      })
    } catch (error) {
      console.error("Failed to load report data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedAccountId) {
      loadReportData(selectedAccountId)
    }
  }, [selectedAccountId, loadReportData])

  if (loading && !reportData) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Title & Account Selector */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Billing report for the selected usage account
          </p>
        </div>
        {usageAccounts.length > 0 && (
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {usageAccounts.map((account) => (
                <SelectItem key={account.accountId} value={account.accountId}>
                  {account.accountName || account.customer} ({account.accountId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {reportData ? (
        <div className="space-y-6">
          {/* Header Section */}
          <ReportHeader
            payerName={reportData.payerName}
            payerAccountId={reportData.payerAccountId}
            usageAccountName={reportData.usageAccountName}
            usageAccountId={reportData.usageAccountId}
            billingPeriod={reportData.billingPeriod}
            generatedDate={reportData.generatedDate}
            status={reportData.status}
          />

          {/* Fund Balance - Full Width */}
          <FundBalanceWidget
            totalDeposit={reportData.totalDeposit}
            totalCost={reportData.totalCost}
          />

          {/* Top Row: Cost Breakdown + Exchange Rate */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CostBreakdownWidget
              usage={reportData.costBreakdown.usage}
              tax={reportData.costBreakdown.tax}
              fee={reportData.costBreakdown.fee}
              discount={reportData.costBreakdown.discount}
              credits={reportData.costBreakdown.credits}
              adjustment={reportData.costBreakdown.adjustment}
            />
            <ExchangeRateWidget
              rate={reportData.exchangeRate}
              totalUsd={reportData.totalUsd}
              totalEur={reportData.totalEur}
            />
          </div>

          {/* Bottom Row: AWS vs Marketplace */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <AwsVsMarketplaceWidget
              awsTotal={reportData.awsTotal}
              marketplaceTotal={reportData.marketplaceTotal}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-24">
          <p className="text-lg font-medium text-muted-foreground">No report data available</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a usage account to generate the report
          </p>
        </div>
      )}
    </main>
  )
}
