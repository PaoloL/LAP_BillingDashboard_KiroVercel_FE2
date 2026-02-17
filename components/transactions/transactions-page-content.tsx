"use client"

import { useState } from "react"
import { TransactionsList } from "@/components/transactions/transactions-list"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { MakeDepositDialog } from "@/components/transactions/make-deposit-dialog"
import { Button } from "@/components/ui/button"
import { RefreshCw, Plus } from "lucide-react"

export function TransactionsPageContent() {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [billingPeriodRange, setBillingPeriodRange] = useState<{ startPeriod: string; endPeriod: string } | undefined>()
  const [sortBy, setSortBy] = useState<"name" | "date">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [payerAccountId, setPayerAccountId] = useState<string | undefined>()
  const [usageAccountId, setUsageAccountId] = useState<string | undefined>()
  const [transactionType, setTransactionType] = useState<string | undefined>()
  const [refreshKey, setRefreshKey] = useState(0)
  const [showDepositDialog, setShowDepositDialog] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#00243E]">Transactions</h1>
          <p className="mt-2 text-muted-foreground">View and manage your billing transactions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowDepositDialog(true)} className="bg-primary hover:bg-primary-hover">
            <Plus className="h-4 w-4 mr-2" />
            Make Deposit
          </Button>
          <Button onClick={() => setRefreshKey(prev => prev + 1)} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <TransactionFilters
        onDateRangeChange={setDateRange}
        onBillingPeriodRangeChange={setBillingPeriodRange}
        onSortChange={(newSortBy, newSortOrder) => {
          setSortBy(newSortBy)
          setSortOrder(newSortOrder)
        }}
        onPayerAccountChange={setPayerAccountId}
        onUsageAccountChange={setUsageAccountId}
        onTransactionTypeChange={setTransactionType}
      />

      <MakeDepositDialog
        open={showDepositDialog}
        onOpenChange={setShowDepositDialog}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />

      <TransactionsList
        key={refreshKey}
        dateRange={dateRange}
        billingPeriodRange={billingPeriodRange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        payerAccountId={payerAccountId}
        usageAccountId={usageAccountId}
        transactionType={transactionType}
      />
    </div>
  )
}
