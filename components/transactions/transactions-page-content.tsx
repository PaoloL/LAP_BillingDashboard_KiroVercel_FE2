"use client"

import { useState } from "react"
import { TransactionsList } from "@/components/transactions/transactions-list"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { RegisterDepositDialog } from "@/components/transactions/register-deposit-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

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
  const [depositDialogOpen, setDepositDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleDepositSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#00243E]">Transactions</h1>
          <p className="mt-2 text-muted-foreground">View and manage your billing transactions</p>
        </div>
        <Button
          onClick={() => setDepositDialogOpen(true)}
          className="gap-2 bg-[#026172] hover:bg-[#026172]/90"
        >
          <Plus className="h-4 w-4" />
          Register Deposit
        </Button>
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

      <RegisterDepositDialog
        open={depositDialogOpen}
        onOpenChange={setDepositDialogOpen}
        onSuccess={handleDepositSuccess}
      />
    </div>
  )
}
