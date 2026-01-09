"use client"

import type React from "react"
import React, { useState } from "react"

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
import { Switch } from "@/components/ui/switch"
import { validateDiscounts } from "@/lib/types"
import { dataService } from "@/lib/data/data-service"

interface EditUsageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: {
    id: string
    customer: string
    status: "Unregistered" | "Registered" | "Archived"
    vatNumber: string
    resellerDiscount: number
    customerDiscount: number
    rebateCredits: boolean
    rebateFee: boolean
    rebateDiscount: boolean
    rebateAdjustment: boolean
  } | null
  onSuccess?: () => void
}

export function EditUsageDialog({ open, onOpenChange, account, onSuccess }: EditUsageDialogProps) {
  const [resellerDiscount, setResellerDiscount] = useState<number>(0)
  const [customerDiscount, setCustomerDiscount] = useState<number>(0)
  const [rebateCredits, setRebateCredits] = useState<boolean>(false)
  const [rebateFee, setRebateFee] = useState<boolean>(false)
  const [rebateDiscount, setRebateDiscount] = useState<boolean>(false)
  const [rebateAdjustment, setRebateAdjustment] = useState<boolean>(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  // Reset form when account changes
  React.useEffect(() => {
    if (account) {
      setResellerDiscount(account.resellerDiscount || 0)
      setCustomerDiscount(account.customerDiscount || 0)
      setRebateCredits(account.rebateCredits || false)
      setRebateFee(account.rebateFee || false)
      setRebateDiscount(account.rebateDiscount || false)
      setRebateAdjustment(account.rebateAdjustment || false)
      setValidationError(null)
    }
  }, [account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const error = validateDiscounts(resellerDiscount, customerDiscount)
    if (error) {
      setValidationError(error)
      return
    }

    if (!account) return

    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const vatNumber = formData.get('vat') as string

      await dataService.updateUsageAccount(account.id, {
        vatNumber: vatNumber || '',
        resellerDiscount,
        customerDiscount,
        rebateCredits,
        rebateFee,
        rebateDiscount,
        rebateAdjustment
      })

      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to update account:", error)
      setValidationError("Failed to update account. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
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

  if (!account) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-[#00243E]">Edit Usage Account</DialogTitle>
          <DialogDescription>Update billing configuration for {account.customer}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid gap-4">
              <h3 className="text-sm font-semibold text-[#00243E]">Account Information</h3>
              <div className="grid gap-2">
                <Label htmlFor="edit-usage-id">Account ID</Label>
                <Input id="edit-usage-id" value={account.id} disabled className="bg-muted" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-customer">Customer Name</Label>
                <Input id="edit-customer" value={account.customer} disabled className="bg-muted" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-vat">VAT Number</Label>
                <Input id="edit-vat" placeholder="DE123456789" defaultValue={account.vatNumber} />
              </div>
            </div>

            <div className="grid gap-4">
              <h3 className="text-sm font-semibold text-[#00243E]">Financial Configuration</h3>
              <div className="grid gap-2">
                <Label htmlFor="edit-reseller-discount">Reseller Discount (%)</Label>
                <Input
                  id="edit-reseller-discount"
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
                <Label htmlFor="edit-customer-discount">Customer Discount (%)</Label>
                <Input
                  id="edit-customer-discount"
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
                  <Label htmlFor="edit-rebate" className="cursor-pointer font-medium">
                    Rebate Credits to Usage Account
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    If enabled, credit will be rebated to the Usage Account.
                  </p>
                </div>
                <Switch id="edit-rebate" checked={rebateCredits} onCheckedChange={setRebateCredits} />
              </div>
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1">
                  <Label htmlFor="edit-rebate-fee" className="cursor-pointer font-medium">
                    Rebate Fee to Usage Account
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    If enabled, fees will be rebated to the Usage Account.
                  </p>
                </div>
                <Switch id="edit-rebate-fee" checked={rebateFee} onCheckedChange={setRebateFee} />
              </div>
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1">
                  <Label htmlFor="edit-rebate-discount" className="cursor-pointer font-medium">
                    Rebate Discount to Usage Account
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    If enabled, discounts will be rebated to the Usage Account.
                  </p>
                </div>
                <Switch id="edit-rebate-discount" checked={rebateDiscount} onCheckedChange={setRebateDiscount} />
              </div>
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1">
                  <Label htmlFor="edit-rebate-adjustment" className="cursor-pointer font-medium">
                    Rebate Adjustment to Usage Account
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    If enabled, adjustments will be rebated to the Usage Account.
                  </p>
                </div>
                <Switch id="edit-rebate-adjustment" checked={rebateAdjustment} onCheckedChange={setRebateAdjustment} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#00243E] hover:bg-[#00243E]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
