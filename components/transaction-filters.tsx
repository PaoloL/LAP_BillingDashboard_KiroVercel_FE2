"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, ArrowUpDown, Building2, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns"
import { dataService } from "@/lib/data/data-service"
import { cn } from "@/lib/utils"

interface TransactionFiltersProps {
  onDateRangeChange?: (dateRange: { from: Date | undefined; to: Date | undefined }) => void
  onSortChange?: (sortBy: "name" | "date", sortOrder: "asc" | "desc") => void
  onPayerAccountChange?: (payerAccountId: string | undefined) => void
  onUsageAccountChange?: (usageAccountId: string | undefined) => void
}

export function TransactionFilters({
  onDateRangeChange,
  onSortChange,
  onPayerAccountChange,
  onUsageAccountChange,
}: TransactionFiltersProps) {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [payerAccounts, setPayerAccounts] = useState<Array<{ id: string; accountId: string; accountName: string }>>([])
  const [usageAccounts, setUsageAccounts] = useState<Array<{ id: string; accountId: string; accountName: string }>>([])
  const [selectedPayerAccount, setSelectedPayerAccount] = useState<string | undefined>()
  const [selectedUsageAccount, setSelectedUsageAccount] = useState<string | undefined>()
  const [payerPopoverOpen, setPayerPopoverOpen] = useState(false)
  const [usagePopoverOpen, setUsagePopoverOpen] = useState(false)
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>()

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
        const payerAccountsList = payerData.data || []
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

        // If usage accounts API is empty, extract from transactions
        let usageAccountsList = usageData.data || []
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
    setSelectedPreset(undefined)
  }

  const handlePresetChange = (preset: string) => {
    const today = new Date()
    const endDate = endOfMonth(today)
    let startDate: Date

    switch (preset) {
      case "1M":
        startDate = startOfMonth(subMonths(today, 1))
        break
      case "3M":
        startDate = startOfMonth(subMonths(today, 3))
        break
      case "6M":
        startDate = startOfMonth(subMonths(today, 6))
        break
      case "12M":
        startDate = startOfMonth(subMonths(today, 12))
        break
      case "ALL":
        setDateRange({ from: undefined, to: undefined })
        setSelectedPreset("ALL")
        onDateRangeChange?.({ from: undefined, to: undefined })
        return
      default:
        return
    }

    setDateRange({ from: startDate, to: endDate })
    setSelectedPreset(preset)
    onDateRangeChange?.({ from: startDate, to: endDate })
  }

  const handleSortToggle = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc"
    setSortOrder(newSortOrder)
    onSortChange?.("date", newSortOrder)
  }

  const handlePayerAccountChange = (value: string) => {
    const accountId = value === "all" ? undefined : value
    setSelectedPayerAccount(accountId)
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
                {usageAccounts.map((account) => (
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
                {usageAccounts.length === 0 && (
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
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                </>
              ) : (
                format(dateRange.from, "MMM dd, yyyy")
              )
            ) : (
              "Date Range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Quick Select</div>
              <div className="grid grid-cols-5 gap-2">
                {["1M", "3M", "6M", "12M", "ALL"].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "bg-transparent",
                      selectedPreset === preset && "bg-[#026172] text-white hover:bg-[#026172]/90 hover:text-white",
                    )}
                    onClick={() => handlePresetChange(preset)}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">From Period</div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="p-2 border rounded text-sm"
                    value={dateRange.from ? dateRange.from.getMonth() : ""}
                    onChange={(e) => {
                      if (e.target.value !== "") {
                        const month = Number.parseInt(e.target.value)
                        const year = dateRange.from?.getFullYear() || new Date().getFullYear()
                        const newFrom = new Date(year, month, 1)
                        handleDateRangeChange({ from: newFrom, to: dateRange.to })
                      }
                    }}
                  >
                    <option value="">Month</option>
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                      (month, idx) => (
                        <option key={idx} value={idx}>
                          {month}
                        </option>
                      ),
                    )}
                  </select>
                  <select
                    className="p-2 border rounded text-sm"
                    value={dateRange.from?.getFullYear() || ""}
                    onChange={(e) => {
                      if (e.target.value !== "") {
                        const year = Number.parseInt(e.target.value)
                        const month = dateRange.from?.getMonth() || 0
                        const newFrom = new Date(year, month, 1)
                        handleDateRangeChange({ from: newFrom, to: dateRange.to })
                      }
                    }}
                  >
                    <option value="">Year</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">To Period</div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    className="p-2 border rounded text-sm"
                    value={dateRange.to ? dateRange.to.getMonth() : ""}
                    onChange={(e) => {
                      if (e.target.value !== "") {
                        const month = Number.parseInt(e.target.value)
                        const year = dateRange.to?.getFullYear() || new Date().getFullYear()
                        const newTo = new Date(year, month, 1)
                        handleDateRangeChange({ from: dateRange.from, to: newTo })
                      }
                    }}
                  >
                    <option value="">Month</option>
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                      (month, idx) => (
                        <option key={idx} value={idx}>
                          {month}
                        </option>
                      ),
                    )}
                  </select>
                  <select
                    className="p-2 border rounded text-sm"
                    value={dateRange.to?.getFullYear() || ""}
                    onChange={(e) => {
                      if (e.target.value !== "") {
                        const year = Number.parseInt(e.target.value)
                        const month = dateRange.to?.getMonth() || 0
                        const newTo = new Date(year, month, 1)
                        handleDateRangeChange({ from: dateRange.from, to: newTo })
                      }
                    }}
                  >
                    <option value="">Year</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
              </div>
            </div>

            {(dateRange.from || dateRange.to) && (
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={() => {
                  handleDateRangeChange({ from: undefined, to: undefined })
                  setSelectedPreset(undefined)
                }}
              >
                Clear Date Filter
              </Button>
            )}
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
