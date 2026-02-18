"use client"

import { useEffect, useState, useCallback } from "react"
import { ReportHeader } from "@/components/report/report-header"
import { FundBalanceWidget } from "@/components/report/fund-balance-widget"
import { CostBreakdownWidget } from "@/components/report/cost-breakdown-widget"
import { AwsVsMarketplaceWidget } from "@/components/report/aws-vs-marketplace-widget"
import { RecentTransactionsWidget, type TransactionRow } from "@/components/report/recent-transactions-widget"
import { DepositsVsCostsWidget, type DepositRow } from "@/components/report/deposits-vs-costs-widget"
import { TransactionsByAccountWidget } from "@/components/report/transactions-by-account-widget"
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
      // Use the backend reports API
      const report = await dataService.getCustomerReport(vatNumber)
      
      if (!report) {
        setLoading(false)
        return
      }

      // Transform backend response to match frontend format
      const transactionRows: TransactionRow[] = (report.transactions || []).map((tx: any) => ({
        id: tx.id || tx.transactionId,
        dateTime: tx.createdAt || tx.dateTime || tx.updatedAt,
        period: tx.billingPeriod || '',
        payerAccount: tx.accounts?.payer?.name || report.customerName,
        payerAccountId: tx.accounts?.payer?.id || '',
        usageAccountName: tx.accounts?.usage?.name || '',
        usageAccountId: tx.accounts?.usage?.id || '',
        amountUsd: tx.totals?.customer?.net?.usd || tx.totals?.customer?.usd || 0,
        amountEur: tx.totals?.customer?.net?.eur || tx.totals?.customer?.eur || 0,
        exchangeRate: tx.exchangeRate || 1.0,
      }))

      const depositRows: DepositRow[] = (report.deposits || []).map((dep: any) => ({
        id: dep.id,
        dateTime: dep.createdAt || dep.dateTime,
        period: dep.billingPeriod || '',
        costCenter: dep.details?.costCenterName || '',
        amountEur: dep.details?.value || 0,
        description: dep.details?.description || '',
        poNumber: dep.details?.poNumber || '',
      }))

      setReportData({
        customerName: report.customerName,
        customerVat: report.customerVat,
        contactName: report.contactName || '',
        contactEmail: report.contactEmail || '',
        billingPeriod: report.billingPeriod || '',
        generatedDate: report.generatedDate || new Date().toISOString(),
        status: report.status || 'Active',
        totalDeposit: report.totalDeposit || 0,
        totalCost: report.totalCost || 0,
        costCenterBalances: report.costCenterBalances || [],
        costBreakdown: report.costBreakdown || {
          usage: 0, tax: 0, fee: 0, discount: 0, credits: 0, adjustment: 0
        },
        awsTotal: report.awsTotal || 0,
        marketplaceTotal: report.marketplaceTotal || 0,
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

          {/* Deposits vs Costs - Stacked Area Chart */}
          <DepositsVsCostsWidget
            deposits={reportData.deposits}
            transactions={reportData.transactions}
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

          {/* Transactions Section */}
          <RecentTransactionsWidget 
            transactions={reportData.transactions} 
            costCenters={reportData.costCenterBalances.map(cc => ({
              costCenterId: cc.costCenterId,
              costCenterName: cc.costCenterName,
              usageAccountIds: cc.usageAccountIds || []
            }))}
          />

          {/* Transactions by Usage Account - Stacked Bar Chart */}
          <TransactionsByAccountWidget transactions={reportData.transactions} />
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
