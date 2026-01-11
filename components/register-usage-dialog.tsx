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
import { Switch } from "@/components/ui/switch"
import { validateDiscounts } from "@/lib/types"
import type { PayerAccount } from "@/lib/types"
import { dataService } from "@/lib/data/data-service"

interface RegisterUsageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payerAccount?: PayerAccount | null
  accountId?: string
  accountName?: string
  onSuccess?: () => void
}

export function RegisterUsageDialog({ open, onOpenChange, payerAccount, accountId, accountName, onSuccess }: RegisterUsageDialogProps) {
  const [resellerDiscount, setResellerDiscount] = useState<number>(0)
  const [customerDiscount, setCustomerDiscount] = useState<number>(0)
  const [rebateCredits, setRebateCredits] = useState<boolean>(false)
  const [rebateFee, setRebateFee] = useState<boolean>(false)
  const [rebateDiscount, setRebateDiscount] = useState<boolean>(false)
  const [rebateAdjustment, setRebateAdjustment] = useState<boolean>(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const error = validateDiscounts(resellerDiscount, customerDiscount)
    if (error) {
      setValidationError(error)
      return
    }

    if (!accountId) {
      setValidationError("Account ID is required")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const customerName = formData.get('customer') as string
      const vatNumber = formData.get('vat') as string

      // First update the account with all configuration
      await dataService.updateUsageAccount(accountId, {
        customer: customerName,
        vatNumber: vatNumber || '',
        resellerDiscount,
        customerDiscount,
        rebateCredits,
        rebateFee,
        rebateDiscount,
        rebateAdjustment
      })

      // Then change status to Registered
      await dataService.changeUsageAccountStatus(accountId, "Registered")
      
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Failed to register account:", error)
      setValidationError("Failed to register account. Please try again.")
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-[#00243E]">Register Usage Account</DialogTitle>
          <DialogDescription>
            {payerAccount
              ? `Add a new usage account under ${payerAccount.accountName}`
              : "Add a new usage account with billing configuration"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="grid gap-4">
              <h3 className="text-sm font-semibold text-[#00243E]">Account Information</h3>
              <div className="grid gap-2">
                <Label htmlFor="usage-id">Account ID</Label>
                <Input 
                  id="usage-id" 
                  placeholder="345678901234" 
                  defaultValue={accountId || ''} 
                  disabled
                  className="bg-muted"
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="account-name">Account Name</Label>
                <Input 
                  id="account-name" 
                  placeholder="Account Name" 
                  defaultValue={accountName || ''} 
                  disabled
                  className="bg-muted"
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer">Customer Name</Label>
                <Input id="customer" name="customer" placeholder="Acme Corporation" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vat">VAT Number</Label>
                <Input id="vat" name="vat" placeholder="DE123456789" />
              </div>
              {payerAccount && (
                <div className="grid gap-2">
                  <Label htmlFor="payer">Payer Account</Label>
                  <Input
                    id="payer"
                    value={`${payerAccount.accountName} (${payerAccount.accountId})`}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}
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
                    If enabled, credit will be rebated to the Usage Account.
                  </p>
                </div>
                <Switch id="rebate" checked={rebateCredits} onCheckedChange={setRebateCredits} />
              </div>
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1">
                  <Label htmlFor="rebate-fee" className="cursor-pointer font-medium">
                    Rebate Fee to Usage Account
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    If enabled, fees will be rebated to the Usage Account.
                  </p>
                </div>
                <Switch id="rebate-fee" checked={rebateFee} onCheckedChange={setRebateFee} />
              </div>
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1">
                  <Label htmlFor="rebate-discount" className="cursor-pointer font-medium">
                    Rebate Discount to Usage Account
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    If enabled, discounts will be rebated to the Usage Account.
                  </p>
                </div>
                <Switch id="rebate-discount" checked={rebateDiscount} onCheckedChange={setRebateDiscount} />
              </div>
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1">
                  <Label htmlFor="rebate-adjustment" className="cursor-pointer font-medium">
                    Rebate Adjustment to Usage Account
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    If enabled, adjustments will be rebated to the Usage Account.
                  </p>
                </div>
                <Switch id="rebate-adjustment" checked={rebateAdjustment} onCheckedChange={setRebateAdjustment} />
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
