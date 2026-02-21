"use client"

import { useEffect, useState, useCallback } from "react"
import { ReportHeader } from "@/components/report/report-header"
import { FundBalanceWidget } from "@/components/report/fund-balance-widget"
import { CustomerCostWidget } from "@/components/report/customer-cost-widget"
import { CostByCenterWidget } from "@/components/report/cost-by-center-widget"
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
  totalGross: number
  costCenterBalances: CostCenterBalance[]
  costBreakdown: {
    usage: number
    tax: number
    fee: number
    discount: number
    credits: number
    adjustment: number
  }
  rebateEnabled: boolean
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
      const report = await dataService.getCustomerReport(vatNumber)
      
      if (!report) {
        setLoading(false)
        return
      }

      const customer = customers.find(c => c.vatNumber === vatNumber)

      // Transform transactions
      const transactionRows: TransactionRow[] = (report.transactions || []).map((tx: any) => ({
        id: tx.id,
        dateTime: tx.createdAt,
        period: tx.billingPeriod,
        payerAccount: tx.accounts?.payer?.name || '',
        payerAccountId: tx.accounts?.payer?.id || '',
        usageAccountName: tx.accounts?.usage?.name || '',
        usageAccountId: tx.accounts?.usage?.id || '',
        amountUsd: tx.totals?.customer?.net?.usd || 0,
        amountEur: tx.totals?.customer?.net?.eur || 0,
        exchangeRate: tx.exchangeRate || 1.0,
      }))

      // Transform deposits
      const depositRows: DepositRow[] = (report.deposits || []).map((dep: any) => ({
        id: dep.id,
        dateTime: dep.createdAt,
        period: dep.billingPeriod,
        costCenter: dep.details?.costCenterName || '',
        amountEur: dep.details?.value || 0,
        description: dep.details?.description || '',
        poNumber: dep.details?.poNumber || '',
      }))

      setReportData({
        customerName: customer?.legalName || customer?.name || '',
        customerVat: report.customerVat,
        contactName: customer?.contactName || '',
        contactEmail: customer?.contactEmail || '',
        billingPeriod: report.billingPeriod || '',
        generatedDate: report.lastUpdated,
        status: customer?.status || 'Active',
        totalDeposit: report.totalDeposit,
        totalCost: report.totalCost,
        totalGross: report.totalGross || report.totalCost,
        costCenterBalances: report.costCenterBalances || [],
        costBreakdown: {
          usage: report.costBreakdown?.usage?.eur || 0,
          tax: report.costBreakdown?.tax?.eur || 0,
          fee: report.costBreakdown?.fee?.eur || 0,
          discount: report.costBreakdown?.discount?.eur || 0,
          credits: report.costBreakdown?.credits?.eur || 0,
          adjustment: report.costBreakdown?.adjustment?.eur || 0,
        },
        rebateEnabled: report.rebateEnabled || false,
        awsTotal: report.awsTotal,
        marketplaceTotal: report.marketplaceTotal,
        transactions: transactionRows,
        deposits: depositRows,
      })
    } catch (error) {
      console.error("Failed to load report data:", error)
    } finally {
      setLoading(false)
    }
  }, [customers])

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
            generatedDate={reportData.generatedDate}
            status={reportData.status}
          />

          {/* Fund Balance + Customer Cost + Cost by Center - Same Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <FundBalanceWidget
              totalDeposit={reportData.totalDeposit}
              totalCost={reportData.totalCost}
            />
            <CustomerCostWidget
              grossCustomerCost={reportData.totalGross || 0}
              discountApplied={reportData.totalGross - reportData.totalCost}
              netCustomerCost={reportData.totalCost}
            />
            <CostByCenterWidget
              costCenterBalances={reportData.costCenterBalances}
            />
          </div>

          {/* Deposits vs Costs - Stacked Area Chart */}
          <DepositsVsCostsWidget
            deposits={reportData.deposits}
            transactions={reportData.transactions}
          />

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
