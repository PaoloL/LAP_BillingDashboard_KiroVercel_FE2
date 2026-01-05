"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Filter, CalendarIcon, ArrowUpDown } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"

interface TransactionFiltersProps {
  onDateRangeChange?: (dateRange: { from: Date | undefined; to: Date | undefined }) => void
  onSortChange?: (sortBy: "name" | "date", sortOrder: "asc" | "desc") => void
}

export function TransactionFilters({ onDateRangeChange, onSortChange }: TransactionFiltersProps) {
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [sortBy, setSortBy] = useState<"name" | "date">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range)
    onDateRangeChange?.(range)
  }

  const handleSortChange = (newSortBy: "name" | "date") => {
    const newSortOrder = sortBy === newSortBy && sortOrder === "asc" ? "desc" : "asc"
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    onSortChange?.(newSortBy, newSortOrder)
  }

  return (
    <div className="flex gap-2">
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

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <ArrowUpDown className="h-4 w-4" />
            Sort by {sortBy === "date" ? "Date" : "Name"} ({sortOrder === "asc" ? "A-Z" : "Z-A"})
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Sort Transactions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={sortBy}>
            <DropdownMenuRadioItem value="date" onClick={() => handleSortChange("date")}>
              Sort by Date
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="name" onClick={() => handleSortChange("name")}>
              Sort by Usage Account Name
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Payer Account
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter by Payer</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value="all">
            <DropdownMenuRadioItem value="all">All Payers</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="prod">Production Payer</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dev">Development Payer</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Usage Account
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter by Usage Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value="all">
            <DropdownMenuRadioItem value="all">All Accounts</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="acme">Acme Corporation</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="tech">TechStart GmbH</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="global">Global Solutions</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
