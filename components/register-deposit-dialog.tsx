"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { dataService } from "@/lib/data/data-service"
import { useAuth } from "@/lib/auth/auth-context"
import type { UsageAccount } from "@/lib/types"

interface RegisterDepositDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function RegisterDepositDialog({ open, onOpenChange, onSuccess }: RegisterDepositDialogProps) {
  const { user } = useAuth()
  const [usageAccounts, setUsageAccounts] = useState<UsageAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [date, setDate] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [amountEur, setAmountEur] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    if (open) {
      loadUsageAccounts()
      const now = new Date()
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
      setDate(localDateTime)
      setError("")
    }
  }, [open])

  const loadUsageAccounts = async () => {
    try {
      const accounts = await dataService.getUsageAccounts()
      setUsageAccounts(accounts.filter(a => a.status === "Registered"))
    } catch (error) {
      console.error("Failed to load usage accounts:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!selectedAccountId || !date || !description || !amountEur) {
      setError("All fields are required")
      return
    }

    const amount = parseFloat(amountEur)
    if (amount <= 0) {
      setError("Amount must be greater than 0")
      return
    }

    if (description.length < 1 || description.length > 255) {
      setError("Description must be between 1 and 255 characters")
      return
    }

    try {
      setLoading(true)
      
      await dataService.createDeposit({
        usageAccountId: selectedAccountId,
        amountEur: amount,
        date: new Date(date).toISOString(),
        description: description.trim(),
        createdBy: user?.email || 'unknown',
      })

      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error("Failed to register deposit:", error)
      setError(error instanceof Error ? error.message : "Failed to register deposit")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedAccountId("")
    setDate("")
    setDescription("")
    setAmountEur("")
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-[#00243E]">Register Deposit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="usageAccount">Usage Account *</Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Select usage account" />
              </SelectTrigger>
              <SelectContent>
                {usageAccounts.map((account) => (
                  <SelectItem key={account.accountId} value={account.accountId}>
                    {account.customer} ({account.accountId})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date and Time *</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Q1 2025 Budget Top-up"
              maxLength={255}
              rows={3}
              required
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/255 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amountEur">Amount (EUR) *</Label>
            <Input
              id="amountEur"
              type="number"
              step="0.01"
              min="0.01"
              value={amountEur}
              onChange={(e) => setAmountEur(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#026172] hover:bg-[#026172]/90"
              disabled={loading || !selectedAccountId || !date || !description || !amountEur}
            >
              {loading ? "Registering..." : "Register Deposit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
