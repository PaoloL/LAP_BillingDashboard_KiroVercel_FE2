"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, ArrowUpDown } from "lucide-react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { dataService } from "@/lib/data/data-service"

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

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const [payerData, usageData] = await Promise.all([
          dataService.getPayerAccounts(),
          dataService.getUsageAccounts(),
        ])
        setPayerAccounts(payerData.data || [])
        setUsageAccounts(usageData.data || [])
      } catch (error) {
        console.error("Failed to load accounts:", error)
      }
    }
    loadAccounts()
  }, [])

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range)
    onDateRangeChange?.(range)
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
  }

  const handleUsageAccountChange = (value: string) => {
    const accountId = value === "all" ? undefined : value
    setSelectedUsageAccount(accountId)
    onUsageAccountChange?.(accountId)
  }

  return (
    <div className="flex gap-2">
      <Select onValueChange={handlePayerAccountChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Payer Account" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payer Accounts</SelectItem>
          {payerAccounts.map((account) => (
            <SelectItem key={account.accountId} value={account.accountId}>
              {account.accountName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={handleUsageAccountChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Usage Account" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Usage Accounts</SelectItem>
          {usageAccounts.map((account) => (
            <SelectItem key={account.accountId} value={account.accountId}>
              {account.accountName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
          <Calendar
            mode="range"
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range) => handleDateRangeChange({ from: range?.from, to: range?.to })}
            numberOfMonths={2}
            initialFocus
          />
          {(dateRange.from || dateRange.to) && (
            <div className="border-t p-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={() => handleDateRangeChange({ from: undefined, to: undefined })}
              >
                Clear Date Filter
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleSortToggle}>
        <ArrowUpDown className="h-4 w-4" />
        Date ({sortOrder === "asc" ? "Oldest First" : "Newest First"})
      </Button>
    </div>
  )
}
