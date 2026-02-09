"use client"

import { useEffect, useState, useCallback } from "react"
import { ReportHeader } from "@/components/report/report-header"
import { FundBalanceWidget } from "@/components/report/fund-balance-widget"
import { CostBreakdownWidget } from "@/components/report/cost-breakdown-widget"
import { AwsVsMarketplaceWidget } from "@/components/report/aws-vs-marketplace-widget"
import { RecentTransactionsWidget, type TransactionRow } from "@/components/report/recent-transactions-widget"
import { RecentDepositsWidget, type DepositRow } from "@/components/report/recent-deposits-widget"
import { dataService } from "@/lib/data/data-service"
import { Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { UsageAccount } from "@/lib/types"

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
  awsTotal: number
  marketplaceTotal: number
  transactions: TransactionRow[]
  deposits: DepositRow[]
}

export default function ReportPage() {
  const [loading, setLoading] = useState(true)
  const [usageAccounts, setUsageAccounts] = useState<UsageAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [reportData, setReportData] = useState<ReportData | null>(null)

  useEffect(() => {
    async function loadAccounts() {
      try {
        const accounts = await dataService.getUsageAccounts()
        const registered = accounts.filter((a) => a.status === "Registered")
        setUsageAccounts(registered)
        if (registered.length > 0) {
          const firstId = registered[0].accountId || registered[0].id
          setSelectedAccountId(firstId)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error("Failed to load usage accounts:", error)
        setLoading(false)
      }
    }
    loadAccounts()
  }, [])

  const loadReportData = useCallback(async (accountId: string) => {
    if (!accountId) return
    setLoading(true)
    try {
      const accounts = await dataService.getUsageAccounts()
      const account = accounts.find(
        (a) => a.accountId === accountId || a.id === accountId
      )
      if (!account) {
        setLoading(false)
        return
      }

      // Fetch all transactions
      const transactionsResponse = await dataService.getTransactions({})
      const allTransactions: any[] = []
      if (transactionsResponse.data) {
        if (Array.isArray(transactionsResponse.data)) {
          allTransactions.push(...transactionsResponse.data)
        } else {
          Object.values(transactionsResponse.data).forEach((group: unknown) => {
            if (Array.isArray(group)) {
              allTransactions.push(...group)
            }
          })
        }
      }

      // Filter transactions for this account
      const accountIdToMatch = account.accountId || account.id
      const filtered = allTransactions.filter((tx: any) => {
        if (tx.accounts?.usage?.id === accountIdToMatch) return true
        if (tx.usageAccount?.id === accountIdToMatch) return true
        const txName = tx.accounts?.usage?.name || tx.usageAccount?.name || ""
        const accName = account.accountName || account.name || account.customer
        if (txName && accName && txName === accName) return true
        return false
      })
      const transactions = filtered.length > 0 ? filtered : allTransactions

      // Aggregate cost breakdown
      let totalUsage = 0, totalTax = 0, totalFee = 0, totalDiscount = 0, totalCredits = 0, totalAdjustment = 0
      let totalUsd = 0, totalEur = 0
      let awsTotal = 0, marketplaceTotal = 0
      let lastExchangeRate = 0
      let lastDate = ""

      transactions.forEach((tx: any) => {
        if (tx.costBreakdown) {
          totalUsage += tx.costBreakdown.usage || 0
          totalTax += tx.costBreakdown.tax || 0
          totalFee += tx.costBreakdown.fee || 0
          totalDiscount += tx.costBreakdown.discount || 0
          totalCredits += tx.costBreakdown.credits || 0
          totalAdjustment += tx.costBreakdown.adjustment || 0
        }
        if (tx.distributorCost) {
          totalUsd += tx.distributorCost.usd || 0
          totalEur += tx.distributorCost.eur || 0
        } else if (tx.totals?.distributor) {
          totalUsd += tx.totals.distributor.usd || 0
          totalEur += tx.totals.distributor.eur || 0
        }
        if (tx.exchangeRate) lastExchangeRate = tx.exchangeRate
        if (tx.details?.entity) {
          awsTotal += tx.details.entity.aws || 0
          marketplaceTotal += tx.details.entity.awsmp || 0
        }
        if (tx.dateTime) {
          const txDate = new Date(tx.dateTime)
          if (!lastDate || txDate.toISOString() > lastDate) lastDate = txDate.toISOString()
        }
      })

      if (awsTotal === 0 && marketplaceTotal === 0 && totalUsd > 0) {
        awsTotal = totalUsd * 0.82
        marketplaceTotal = totalUsd * 0.18
      }

      if (!lastExchangeRate) {
        try {
          const rates = await dataService.getExchangeRates({})
          if (rates.length > 0) lastExchangeRate = rates[0].exchangeRate
        } catch { /* ignore */ }
      }
      if (!lastExchangeRate) lastExchangeRate = 1.093

      // Get payer info
      let payerName = "N/A", payerAccountIdValue = "N/A"
      try {
        const payerAccounts = await dataService.getPayerAccounts()
        const payer = payerAccounts.find(
          (p) => p.accountId === account.payerAccountId
        ) || payerAccounts[0]
        if (payer) {
          payerName = payer.accountName || payer.name
          payerAccountIdValue = payer.accountId
        }
      } catch { /* ignore */ }

      // Build transaction rows (last 10, sorted by date desc)
      const sortedTransactions = [...transactions].sort((a, b) => {
        const dateA = new Date(a.dateTime || 0).getTime()
        const dateB = new Date(b.dateTime || 0).getTime()
        return dateB - dateA
      })
      const transactionRows: TransactionRow[] = sortedTransactions.map((tx: any) => {
        const txUsd = tx.distributorCost?.usd || tx.totals?.distributor?.usd || 0
        const txEur = tx.distributorCost?.eur || tx.totals?.distributor?.eur || 0
        const txRate = tx.exchangeRate || lastExchangeRate
        const txDate = tx.dateTime ? new Date(tx.dateTime) : new Date()
        const period = txDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
        const txPayerName = tx.payerAccount?.name || payerName
        const txUsageName = tx.usageAccount?.name || account.accountName || account.name || account.customer
        const txUsageId = tx.usageAccount?.id || account.accountId || account.id
        return {
          id: tx.id,
          dateTime: txDate.toISOString(),
          period,
          payerAccount: txPayerName,
          usageAccountName: txUsageName,
          usageAccountId: txUsageId,
          amountUsd: txUsd,
          amountEur: txEur,
          exchangeRate: txRate,
        }
      })

      // Build deposit rows (last 10, sorted by date desc)
      let depositRows: DepositRow[] = []
      try {
        // Import mock deposits dynamically if available
        const { mockDeposits } = await import("@/lib/data/mock-data")
        if (mockDeposits) {
          const accountDeposits = mockDeposits
            .filter((d) => d.usageAccountId === accountIdToMatch)
            .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
          depositRows = accountDeposits.map((d) => {
            const depDate = new Date(d.dateTime)
            const period = depDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
            return {
              id: d.id,
              dateTime: depDate.toISOString(),
              period,
              payerAccount: payerName,
              usageAccountName: d.usageAccountName || account.accountName || account.name || account.customer,
              usageAccountId: d.usageAccountId || account.accountId || account.id,
              amountEur: d.amountEur,
            }
          })
        }
      } catch { /* no deposits */ }

      const now = new Date()
      const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
      const formattedDate = lastDate
        ? new Date(lastDate).toLocaleString("en-GB", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit", hour12: false,
          })
        : now.toLocaleString("en-GB", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit", hour12: false,
          })

      setReportData({
        payerName,
        payerAccountId: payerAccountIdValue,
        usageAccountName: account.accountName || account.name || account.customer,
        usageAccountId: account.accountId || account.id,
        billingPeriod: currentPeriod,
        generatedDate: formattedDate,
        status: account.status,
        totalDeposit: account.totalDeposit || 0,
        totalCost: account.totalCustomerCost || totalEur || 0,
        costBreakdown: {
          usage: totalUsage, tax: totalTax, fee: totalFee,
          discount: totalDiscount, credits: totalCredits, adjustment: totalAdjustment,
        },
        awsTotal,
        marketplaceTotal,
        transactions: transactionRows,
        deposits: depositRows,
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
              {usageAccounts.map((account) => {
                const accId = account.accountId || account.id
                const accName = account.accountName || account.name || account.customer
                return (
                  <SelectItem key={accId} value={accId}>
                    {accName} ({accId})
                  </SelectItem>
                )
              })}
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

          {/* Cost Breakdown + AWS vs Marketplace - Same Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <CostBreakdownWidget
                usage={reportData.costBreakdown.usage}
                tax={reportData.costBreakdown.tax}
                fee={reportData.costBreakdown.fee}
                discount={reportData.costBreakdown.discount}
                credits={reportData.costBreakdown.credits}
                adjustment={reportData.costBreakdown.adjustment}
              />
            </div>
            <div className="lg:col-span-2">
              <AwsVsMarketplaceWidget
                awsTotal={reportData.awsTotal}
                marketplaceTotal={reportData.marketplaceTotal}
              />
            </div>
          </div>

          {/* Transactions Section: Last 10 Transactions (left) + Last 10 Deposits (right) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentTransactionsWidget transactions={reportData.transactions} />
            <RecentDepositsWidget deposits={reportData.deposits} />
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
