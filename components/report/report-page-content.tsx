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
import type { Customer } from "@/lib/types"

interface CostCenterBalance {
  costCenterId: string
  costCenterName: string
  totalDeposit: number
  totalCost: number
  availableFund: number
}

interface ReportData {
  customerName: string
  customerVat: string
  contactName: string
  contactEmail: string
  billingPeriod: string
  generatedDate: string
  status: string
  totalDeposit: number
  totalCost: number
  costCenterBalances: CostCenterBalance[]
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

export function ReportPageContent() {
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomerVat, setSelectedCustomerVat] = useState<string>("")
  const [reportData, setReportData] = useState<ReportData | null>(null)

  useEffect(() => {
    async function loadCustomers() {
      try {
        const customerList = await dataService.getCustomers()
        const active = customerList.filter((c) => c.status === "Active")
        setCustomers(active)
        if (active.length > 0) {
          setSelectedCustomerVat(active[0].vatNumber)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error("Failed to load customers:", error)
        setLoading(false)
      }
    }
    loadCustomers()
  }, [])

  const loadReportData = useCallback(async (vatNumber: string) => {
    if (!vatNumber) return
    setLoading(true)
    try {
      const customer = await dataService.getCustomer(vatNumber)
      if (!customer) {
        setLoading(false)
        return
      }

      // Get all usage account IDs from all cost centers
      const allUsageAccountIds = customer.costCenters.flatMap(cc => cc.usageAccountIds)

      // Fetch all transactions for these usage accounts
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

      // Filter transactions for this customer's usage accounts
      const customerTransactions = allTransactions.filter((tx: any) => {
        const usageId = tx.accounts?.usage?.id || tx.usageAccount?.id
        return allUsageAccountIds.includes(usageId)
      })

      // Calculate cost center balances
      const costCenterBalances: CostCenterBalance[] = customer.costCenters.map(cc => {
        // Get transactions for this cost center's usage accounts
        const ccTransactions = customerTransactions.filter((tx: any) => {
          const usageId = tx.accounts?.usage?.id || tx.usageAccount?.id
          return cc.usageAccountIds.includes(usageId)
        })

        // Calculate total cost for this cost center
        let ccTotalCost = 0
        ccTransactions.forEach((tx: any) => {
          if (tx.totals?.customer?.eur) {
            ccTotalCost += tx.totals.customer.eur
          } else if (tx.distributorCost?.eur) {
            ccTotalCost += tx.distributorCost.eur
          }
        })

        // TODO: Get actual deposit amount per cost center from deposits
        const ccTotalDeposit = 0 // Will be calculated from deposits

        return {
          costCenterId: cc.id,
          costCenterName: cc.name,
          totalDeposit: ccTotalDeposit,
          totalCost: ccTotalCost,
          availableFund: ccTotalDeposit - ccTotalCost
        }
      })

      // Aggregate total cost breakdown
      let totalUsage = 0, totalTax = 0, totalFee = 0, totalDiscount = 0, totalCredits = 0, totalAdjustment = 0
      let totalEur = 0
      let awsTotal = 0, marketplaceTotal = 0
      let lastDate = ""

      customerTransactions.forEach((tx: any) => {
        if (tx.costBreakdown) {
          totalUsage += tx.costBreakdown.usage || 0
          totalTax += tx.costBreakdown.tax || 0
          totalFee += tx.costBreakdown.fee || 0
          totalDiscount += tx.costBreakdown.discount || 0
          totalCredits += tx.costBreakdown.credits || 0
          totalAdjustment += tx.costBreakdown.adjustment || 0
        }
        if (tx.totals?.customer?.eur) {
          totalEur += tx.totals.customer.eur
        } else if (tx.distributorCost?.eur) {
          totalEur += tx.distributorCost.eur
        }
        if (tx.details?.entity) {
          awsTotal += tx.details.entity.aws || 0
          marketplaceTotal += tx.details.entity.awsmp || 0
        }
        if (tx.dateTime) {
          const txDate = new Date(tx.dateTime)
          if (!lastDate || txDate.toISOString() > lastDate) lastDate = txDate.toISOString()
        }
      })

      // Build transaction rows
      const sortedTransactions = [...customerTransactions].sort((a, b) => {
        const dateA = new Date(a.dateTime || 0).getTime()
        const dateB = new Date(b.dateTime || 0).getTime()
        return dateB - dateA
      })
      const transactionRows: TransactionRow[] = sortedTransactions.slice(0, 10).map((tx: any) => {
        const txUsd = tx.distributorCost?.usd || tx.totals?.distributor?.usd || 0
        const txEur = tx.distributorCost?.eur || tx.totals?.distributor?.eur || 0
        const txRate = tx.exchangeRate || 1.093
        const txDate = tx.dateTime ? new Date(tx.dateTime) : new Date()
        const period = txDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
        const txUsageName = tx.accounts?.usage?.name || tx.usageAccount?.name || 'N/A'
        const txUsageId = tx.accounts?.usage?.id || tx.usageAccount?.id || 'N/A'
        return {
          id: tx.id,
          dateTime: txDate.toISOString(),
          period,
          payerAccount: customer.legalName,
          usageAccountName: txUsageName,
          usageAccountId: txUsageId,
          amountUsd: txUsd,
          amountEur: txEur,
          exchangeRate: txRate,
        }
      })

      // TODO: Get actual deposits for this customer
      const depositRows: DepositRow[] = []

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

      const totalDeposit = costCenterBalances.reduce((sum, cc) => sum + cc.totalDeposit, 0)

      setReportData({
        customerName: customer.legalName,
        customerVat: customer.vatNumber,
        contactName: customer.contactName,
        contactEmail: customer.contactEmail,
        billingPeriod: currentPeriod,
        generatedDate: formattedDate,
        status: customer.status,
        totalDeposit,
        totalCost: totalEur,
        costCenterBalances,
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
    if (selectedCustomerVat) {
      loadReportData(selectedCustomerVat)
    }
  }, [selectedCustomerVat, loadReportData])

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
      {/* Page Title & Customer Selector */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Report</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Billing report for the selected customer
          </p>
        </div>
        {customers.length > 0 && (
          <Select value={selectedCustomerVat} onValueChange={setSelectedCustomerVat}>
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.vatNumber} value={customer.vatNumber}>
                  {customer.legalName} ({customer.vatNumber})
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
            customerName={reportData.customerName}
            customerVat={reportData.customerVat}
            contactName={reportData.contactName}
            contactEmail={reportData.contactEmail}
            billingPeriod={reportData.billingPeriod}
            generatedDate={reportData.generatedDate}
            status={reportData.status}
          />

          {/* Fund Balance by Cost Center */}
          <FundBalanceWidget
            totalDeposit={reportData.totalDeposit}
            totalCost={reportData.totalCost}
            costCenterBalances={reportData.costCenterBalances}
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
