"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, ArrowUpDown, Building2, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
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
