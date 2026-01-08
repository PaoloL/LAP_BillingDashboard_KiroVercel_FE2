"use client"

import { DashboardNav } from "@/components/dashboard-nav"
import { TransactionsList } from "@/components/transactions-list"
import { TransactionFilters } from "@/components/transaction-filters"
import { RegisterTransactionDialog } from "@/components/register-transaction-dialog"
import { useState } from "react"

export default function TransactionsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [sortBy, setSortBy] = useState<"name" | "date">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [payerAccountId, setPayerAccountId] = useState<string | undefined>()
  const [usageAccountId, setUsageAccountId] = useState<string | undefined>()

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#00243E]">Transactions</h1>
            <p className="mt-2 text-muted-foreground">Complete billing history with detailed breakdowns</p>
          </div>
          <div className="flex items-center gap-3">
            <TransactionFilters
              onDateRangeChange={setDateRange}
              onSortChange={(newSortBy, newSortOrder) => {
                setSortBy(newSortBy)
                setSortOrder(newSortOrder)
              }}
              onPayerAccountChange={setPayerAccountId}
              onUsageAccountChange={setUsageAccountId}
            />
            <RegisterTransactionDialog />
          </div>
        </div>

        <TransactionsList 
          dateRange={dateRange} 
          sortBy={sortBy} 
          sortOrder={sortOrder}
          payerAccountId={payerAccountId}
          usageAccountId={usageAccountId}
        />
      </main>
    </div>
  )
}
