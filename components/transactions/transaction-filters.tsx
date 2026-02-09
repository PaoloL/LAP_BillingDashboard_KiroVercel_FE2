"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ArrowUpDown, Building2, Users, ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { useState, useEffect } from "react"
import { format, subMonths, startOfMonth, endOfMonth, addMonths } from "date-fns"
import { dataService } from "@/lib/data/data-service"
import { cn } from "@/lib/utils"

interface TransactionFiltersProps {
  onDateRangeChange?: (dateRange: { from: Date | undefined; to: Date | undefined }) => void
  onBillingPeriodRangeChange?: (billingPeriodRange: { startPeriod: string; endPeriod: string }) => void
  onSortChange?: (sortBy: "name" | "date", sortOrder: "asc" | "desc") => void
  onPayerAccountChange?: (payerAccountId: string | undefined) => void
  onUsageAccountChange?: (usageAccountId: string | undefined) => void
  onTransactionTypeChange?: (transactionType: string | undefined) => void
}

export function TransactionFilters({
  onDateRangeChange,
  onBillingPeriodRangeChange,
  onSortChange,
  onPayerAccountChange,
  onUsageAccountChange,
  onTransactionTypeChange,
}: TransactionFiltersProps) {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [payerAccounts, setPayerAccounts] = useState<Array<{ id: string; accountId: string; accountName: string }>>([])
  const [usageAccounts, setUsageAccounts] = useState<Array<{ id: string; accountId: string; accountName: string; payerAccountId?: string }>>([])
  const [selectedPayerAccount, setSelectedPayerAccount] = useState<string | undefined>()
  const [selectedUsageAccount, setSelectedUsageAccount] = useState<string | undefined>()
  const [selectedTransactionType, setSelectedTransactionType] = useState<string | undefined>()
  const [payerPopoverOpen, setPayerPopoverOpen] = useState(false)
  const [usagePopoverOpen, setUsagePopoverOpen] = useState(false)
  const [typePopoverOpen, setTypePopoverOpen] = useState(false)
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [startPeriod, setStartPeriod] = useState<Date>(startOfMonth(new Date()))
  const [endPeriod, setEndPeriod] = useState<Date>(endOfMonth(new Date()))

  // Initialize billing period range on mount
  useEffect(() => {
    const today = new Date()
    const currentPeriod = format(today, "yyyy-MM")
    onBillingPeriodRangeChange?.({ startPeriod: currentPeriod, endPeriod: currentPeriod })
  }, [onBillingPeriodRangeChange])

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoadingAccounts(true)
        const [payerData, usageData, transactionsData] = await Promise.all([
          dataService.getPayerAccounts(),
          dataService.getUsageAccounts(),
          dataService.getTransactions({}), // Get all transactions to extract accounts
        ])

        // Set payer accounts from API and merge with transaction data
        const payerAccountsList = payerData || []
        const payerAccountsMap = new Map()

        // Add API payer accounts
        payerAccountsList.forEach((account) => {
          payerAccountsMap.set(account.accountId, {
            id: account.id,
            accountId: account.accountId,
            accountName: account.accountName,
          })
        })

        // Extract payer accounts from transactions and merge
        if (transactionsData.data) {
          Object.values(transactionsData.data).forEach((transactions) => {
            if (Array.isArray(transactions)) {
              transactions.forEach((tx) => {
                if (tx.payerAccount && !payerAccountsMap.has(tx.payerAccount.id)) {
                  payerAccountsMap.set(tx.payerAccount.id, {
                    id: tx.payerAccount.id,
                    accountId: tx.payerAccount.id,
                    accountName: tx.payerAccount.name,
                  })
                }
              })
            }
          })
        }

        setPayerAccounts(Array.from(payerAccountsMap.values()))

        // Map usage accounts from API to include accountName
        let usageAccountsList = (usageData || []).map((account) => ({
          id: account.id,
          accountId: account.accountId,
          accountName: account.customer, // Map customer to accountName
          payerAccountId: account.payerAccountId,
        }))
        
        // If usage accounts API is empty, extract from transactions
        if (usageAccountsList.length === 0 && transactionsData.data) {
          const uniqueUsageAccounts = new Map()
          Object.values(transactionsData.data).forEach((transactions) => {
            if (Array.isArray(transactions)) {
              transactions.forEach((tx) => {
                if (tx.usageAccount && !uniqueUsageAccounts.has(tx.usageAccount.id)) {
                  uniqueUsageAccounts.set(tx.usageAccount.id, {
                    id: tx.usageAccount.id,
                    accountId: tx.usageAccount.id,
                    accountName: tx.usageAccount.name,
                  })
                }
              })
            }
          })
          usageAccountsList = Array.from(uniqueUsageAccounts.values())
        }

        setUsageAccounts(usageAccountsList)
      } catch (error) {
        console.error("Failed to load accounts:", error)
      } finally {
        setLoadingAccounts(false)
      }
    }
    loadAccounts()
  }, [])

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range)
    onDateRangeChange?.(range)
  }

  const handleStartPeriodChange = (direction: "prev" | "next") => {
    const newStartPeriod = direction === "prev" ? subMonths(startPeriod, 1) : addMonths(startPeriod, 1)
    setStartPeriod(newStartPeriod)

    // Update date range for backward compatibility
    const newFrom = startOfMonth(newStartPeriod)
    const newTo = endOfMonth(endPeriod)
    setDateRange({ from: newFrom, to: newTo })
    onDateRangeChange?.({ from: newFrom, to: newTo })

    // Pass billing period range in YYYY-MM format
    const startPeriodStr = format(newStartPeriod, "yyyy-MM")
    const endPeriodStr = format(endPeriod, "yyyy-MM")
    onBillingPeriodRangeChange?.({ startPeriod: startPeriodStr, endPeriod: endPeriodStr })
  }

  const handleEndPeriodChange = (direction: "prev" | "next") => {
    const newEndPeriod = direction === "prev" ? subMonths(endPeriod, 1) : addMonths(endPeriod, 1)
    setEndPeriod(newEndPeriod)

    // Update date range for backward compatibility
    const newFrom = startOfMonth(startPeriod)
    const newTo = endOfMonth(newEndPeriod)
    setDateRange({ from: newFrom, to: newTo })
    onDateRangeChange?.({ from: newFrom, to: newTo })

    // Pass billing period range in YYYY-MM format
    const startPeriodStr = format(startPeriod, "yyyy-MM")
    const endPeriodStr = format(newEndPeriod, "yyyy-MM")
    onBillingPeriodRangeChange?.({ startPeriod: startPeriodStr, endPeriod: endPeriodStr })
  }

  const handleSortToggle = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc"
    setSortOrder(newSortOrder)
    onSortChange?.("date", newSortOrder)
  }

  const handlePayerAccountChange = (value: string) => {
    const accountId = value === "all" ? undefined : value
    setSelectedPayerAccount(accountId)
    
    // Clear usage account selection when payer changes
    if (accountId !== selectedPayerAccount) {
      setSelectedUsageAccount(undefined)
      onUsageAccountChange?.(undefined)
    }
    
    onPayerAccountChange?.(accountId)
    setPayerPopoverOpen(false)
  }

  const handleUsageAccountChange = (value: string) => {
    const accountId = value === "all" ? undefined : value
    setSelectedUsageAccount(accountId)
    onUsageAccountChange?.(accountId)
    setUsagePopoverOpen(false)
  }

  const selectedPayerName = payerAccounts.find((a) => a.accountId === selectedPayerAccount)?.accountName
  const selectedUsageName = usageAccounts.find((a) => a.accountId === selectedUsageAccount)?.accountName

  // Filter usage accounts by selected payer account
  const filteredUsageAccounts = selectedPayerAccount
    ? usageAccounts.filter((account) => account.payerAccountId === selectedPayerAccount)
    : usageAccounts

  return (
    <div className="flex gap-2">
      <Popover open={payerPopoverOpen} onOpenChange={setPayerPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Building2 className="h-4 w-4" />
            {selectedPayerName || "Payer Account"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <div className="max-h-[300px] overflow-y-auto">
            {loadingAccounts ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">Loading accounts...</div>
            ) : (
              <>
                <button
                  onClick={() => handlePayerAccountChange("all")}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors",
                    !selectedPayerAccount && "bg-accent font-medium",
                  )}
                >
                  All Payer Accounts
                </button>
                {payerAccounts.map((account) => (
                  <button
                    key={account.accountId}
                    onClick={() => handlePayerAccountChange(account.accountId)}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors",
                      selectedPayerAccount === account.accountId && "bg-accent font-medium",
                    )}
                  >
                    {account.accountName}
                  </button>
                ))}
                {payerAccounts.length === 0 && (
                  <div className="px-4 py-2 text-sm text-muted-foreground">No payer accounts found</div>
                )}
              </>
            )}
          </div>
          {selectedPayerAccount && (
            <div className="border-t p-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={() => handlePayerAccountChange("all")}
              >
                Clear Payer Filter
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <Popover open={usagePopoverOpen} onOpenChange={setUsagePopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Users className="h-4 w-4" />
            {selectedUsageName || "Usage Account"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0" align="start">
          <div className="max-h-[300px] overflow-y-auto">
            {loadingAccounts ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">Loading accounts...</div>
            ) : (
              <>
                <button
                  onClick={() => handleUsageAccountChange("all")}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors",
                    !selectedUsageAccount && "bg-accent font-medium",
                  )}
                >
                  All Usage Accounts
                </button>
                {filteredUsageAccounts.map((account) => (
                  <button
                    key={account.accountId}
                    onClick={() => handleUsageAccountChange(account.accountId)}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors",
                      selectedUsageAccount === account.accountId && "bg-accent font-medium",
                    )}
                  >
                    {account.accountName}
                  </button>
                ))}
                {filteredUsageAccounts.length === 0 && (
                  <div className="px-4 py-2 text-sm text-muted-foreground">No usage accounts found</div>
                )}
              </>
            )}
          </div>
          {selectedUsageAccount && (
            <div className="border-t p-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={() => handleUsageAccountChange("all")}
              >
                Clear Usage Filter
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <CalendarIcon className="h-4 w-4" />
            {dateRange.from && dateRange.to ? (
              <>
                {format(dateRange.from, "MMM yyyy")} - {format(dateRange.to, "MMM yyyy")}
              </>
            ) : (
              "Date Range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="p-4 space-y-4">
            {/* Start Billing Period */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Start Billing Period</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => handleStartPeriodChange("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 text-center text-sm font-medium">{format(startPeriod, "MMMM yyyy")}</div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => handleStartPeriodChange("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* End Billing Period */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">End Billing Period</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => handleEndPeriodChange("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 text-center text-sm font-medium">{format(endPeriod, "MMMM yyyy")}</div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => handleEndPeriodChange("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full bg-transparent"
              onClick={() => {
                const today = new Date()
                setStartPeriod(startOfMonth(today))
                setEndPeriod(endOfMonth(today))
                handleDateRangeChange({ from: startOfMonth(today), to: endOfMonth(today) })
                
                // Pass current month billing period
                const currentPeriod = format(today, "yyyy-MM")
                onBillingPeriodRangeChange?.({ startPeriod: currentPeriod, endPeriod: currentPeriod })
              }}
            >
              Reset to Current Month
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Popover open={typePopoverOpen} onOpenChange={setTypePopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <FileText className="h-4 w-4" />
            {selectedTransactionType === "MANUAL" ? "Deposit" : selectedTransactionType === "DATAEXPORT" ? "Transactions" : "Transaction Type"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <div className="max-h-[200px] overflow-y-auto">
            <button
              onClick={() => {
                setSelectedTransactionType(undefined)
                onTransactionTypeChange?.(undefined)
                setTypePopoverOpen(false)
              }}
              className={cn(
                "w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors",
                !selectedTransactionType && "bg-accent font-medium",
              )}
            >
              All Types
            </button>
            <button
              onClick={() => {
                setSelectedTransactionType("MANUAL")
                onTransactionTypeChange?.("MANUAL")
                setTypePopoverOpen(false)
              }}
              className={cn(
                "w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors",
                selectedTransactionType === "MANUAL" && "bg-accent font-medium",
              )}
            >
              Deposit
            </button>
            <button
              onClick={() => {
                setSelectedTransactionType("DATAEXPORT")
                onTransactionTypeChange?.("DATAEXPORT")
                setTypePopoverOpen(false)
              }}
              className={cn(
                "w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors",
                selectedTransactionType === "DATAEXPORT" && "bg-accent font-medium",
              )}
            >
              Transactions
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleSortToggle}>
        <ArrowUpDown className="h-4 w-4" />
        Date ({sortOrder === "asc" ? "Oldest First" : "Newest First"})
      </Button>
    </div>
  )
}
