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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { validateDiscounts } from "@/lib/types"

interface RegisterUsageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegisterUsageDialog({ open, onOpenChange }: RegisterUsageDialogProps) {
  const [resellerDiscount, setResellerDiscount] = useState<number>(0)
  const [customerDiscount, setCustomerDiscount] = useState<number>(0)
  const [rebateCredits, setRebateCredits] = useState<boolean>(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const error = validateDiscounts(resellerDiscount, customerDiscount)
    if (error) {
      setValidationError(error)
      return
    }

    // Handle form submission
    onOpenChange(false)
  }

  const handleResellerDiscountChange = (value: string) => {
    const num = Number(value)
    setResellerDiscount(num)
    const error = validateDiscounts(num, customerDiscount)
    setValidationError(error)
  }

  const handleCustomerDiscountChange = (value: string) => {
    const num = Number(value)
    setCustomerDiscount(num)
    const error = validateDiscounts(resellerDiscount, num)
    setValidationError(error)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-[#00243E]">Register Usage Account</DialogTitle>
          <DialogDescription>Add a new usage account with billing configuration</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid gap-4">
              <h3 className="text-sm font-semibold text-[#00243E]">Account Information</h3>
              <div className="grid gap-2">
                <Label htmlFor="usage-id">Account ID</Label>
                <Input id="usage-id" placeholder="345678901234" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer">Customer Name</Label>
                <Input id="customer" placeholder="Acme Corporation" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vat">VAT Number</Label>
                <Input id="vat" placeholder="DE123456789" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="payer">Payer Account</Label>
                <Select>
                  <SelectTrigger id="payer">
                    <SelectValue placeholder="Select payer account" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prod">Production Payer</SelectItem>
                    <SelectItem value="dev">Development Payer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4">
              <h3 className="text-sm font-semibold text-[#00243E]">Financial Configuration</h3>
              <div className="grid gap-2">
                <Label htmlFor="reseller-discount">Reseller Discount (%)</Label>
                <Input
                  id="reseller-discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="15"
                  value={resellerDiscount}
                  onChange={(e) => handleResellerDiscountChange(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer-discount">Customer Discount (%)</Label>
                <Input
                  id="customer-discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="10"
                  value={customerDiscount}
                  onChange={(e) => handleCustomerDiscountChange(e.target.value)}
                  required
                />
              </div>
              {validationError && <p className="text-sm text-[#EBB700]">{validationError}</p>}
            </div>

            <div className="grid gap-4">
              <h3 className="text-sm font-semibold text-[#00243E]">Credit Handling</h3>
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1">
                  <Label htmlFor="rebate" className="cursor-pointer font-medium">
                    Rebate Credits to Usage Account
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    If enabled, credit notes will be deducted from the Usage Account's total cost.
                  </p>
                </div>
                <Switch id="rebate" checked={rebateCredits} onCheckedChange={setRebateCredits} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#00243E] hover:bg-[#00243E]/90">
              Register Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
