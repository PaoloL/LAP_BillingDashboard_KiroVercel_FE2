"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { CalendarIcon, Check, ChevronsUpDown, Plus } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { CreateTransactionDTO } from "@/lib/types"

// Mock usage accounts data
const usageAccounts = [
  { id: "UA001", customer: "Acme Corporation" },
  { id: "UA002", customer: "TechStart GmbH" },
  { id: "UA003", customer: "Global Solutions" },
  { id: "UA004", customer: "Innovation Labs" },
  { id: "UA005", customer: "Digital Ventures" },
]

const transactionTypes = [
  { value: "Usage", color: "#EC9400", label: "Usage" },
  { value: "Credit", color: "#026172", label: "Credit" },
  { value: "Deposit", color: "#026172", label: "Deposit" },
  { value: "Fee", color: "#00243E", label: "Fee" },
] as const

export function RegisterTransactionDialog() {
  const [open, setOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<CreateTransactionDTO["type"]>("Usage")
  const [selectedAccount, setSelectedAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [notes, setNotes] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const transaction: CreateTransactionDTO = {
      type: selectedType,
      usageAccountId: selectedAccount,
      amount: Number.parseFloat(amount),
      date: date,
      notes: notes,
    }

    console.log("[v0] Creating transaction:", transaction)

    // Reset form and close dialog
    setSelectedType("Usage")
    setSelectedAccount("")
    setAmount("")
    setDate(new Date())
    setNotes("")
    setOpen(false)
  }

  const selectedAccountData = usageAccounts.find((acc) => acc.id === selectedAccount)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#00243E] hover:bg-[#00243E]/90">
          <Plus className="mr-2 h-4 w-4" />
          Register Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-[#00243E]">Register Transaction</DialogTitle>
            <DialogDescription>Add a new transaction to the billing system. All fields are required.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Transaction Type Selection */}
            <div className="space-y-3">
              <Label>Transaction Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {transactionTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedType(type.value)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border-2 p-4 transition-all hover:border-opacity-60",
                      selectedType === type.value ? "border-current bg-opacity-5" : "border-border bg-background",
                    )}
                    style={{
                      borderColor: selectedType === type.value ? type.color : undefined,
                      backgroundColor: selectedType === type.value ? `${type.color}15` : undefined,
                    }}
                  >
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: type.color }} />
                    <span
                      className="font-medium"
                      style={{
                        color: selectedType === type.value ? type.color : undefined,
                      }}
                    >
                      {type.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Usage Account Selection */}
            <div className="space-y-2">
              <Label htmlFor="account">Usage Account</Label>
              <Popover open={accountOpen} onOpenChange={setAccountOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="account"
                    variant="outline"
                    role="combobox"
                    aria-expanded={accountOpen}
                    className="w-full justify-between bg-transparent"
                  >
                    {selectedAccount
                      ? `${selectedAccountData?.customer} (${selectedAccountData?.id})`
                      : "Select usage account..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[450px] p-0">
                  <Command>
                    <CommandInput placeholder="Search accounts..." />
                    <CommandList>
                      <CommandEmpty>No account found.</CommandEmpty>
                      <CommandGroup>
                        {usageAccounts.map((account) => (
                          <CommandItem
                            key={account.id}
                            value={`${account.customer} ${account.id}`}
                            onSelect={() => {
                              setSelectedAccount(account.id)
                              setAccountOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedAccount === account.id ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {account.customer} ({account.id})
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7"
                  required
                />
              </div>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Notes Textarea */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes / Description</Label>
              <Textarea
                id="notes"
                placeholder="Enter optional details about this transaction..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#00243E] hover:bg-[#00243E]/90" disabled={!selectedAccount || !amount}>
              Save Transaction
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
