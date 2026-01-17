"use client"

import { useState } from "react"
import { TransactionsList } from "@/components/transactions-list"
import { TransactionFilters } from "@/components/transaction-filters"

export default function Transactions() {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [billingPeriodRange, setBillingPeriodRange] = useState<{ startPeriod: string; endPeriod: string } | undefined>()
  const [sortBy, setSortBy] = useState<"name" | "date">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [payerAccountId, setPayerAccountId] = useState<string | undefined>()
  const [usageAccountId, setUsageAccountId] = useState<string | undefined>()

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#00243E]">Transactions</h1>
        <p className="mt-2 text-muted-foreground">View and manage your billing transactions</p>
      </div>

      <div className="mb-6">
        <TransactionFilters
          onDateRangeChange={setDateRange}
          onBillingPeriodRangeChange={setBillingPeriodRange}
          onSortChange={(newSortBy, newSortOrder) => {
            setSortBy(newSortBy)
            setSortOrder(newSortOrder)
          }}
          onPayerAccountChange={setPayerAccountId}
          onUsageAccountChange={setUsageAccountId}
        />
      </div>

      <TransactionsList
        dateRange={dateRange}
        billingPeriodRange={billingPeriodRange}
        sortBy={sortBy}
        sortOrder={sortOrder}
        payerAccountId={payerAccountId}
        usageAccountId={usageAccountId}
      />
    </main>
  )
}
