"use client"

import React from "react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
    rebateToSeller: {
      usage: { discountedUsage: boolean; savingsPlanCoveredUsage: boolean }
      fee: { fee: boolean; riFee: boolean; savingsPlanRecurringFee: boolean; savingsPlanUpfrontFee: boolean }
      discount: {
        bundledDiscount: boolean
        discount: boolean
        credit: boolean
        privateRateDiscount: boolean
        distributorDiscount: boolean
      }
      adjustment: { credit: boolean; refund: boolean; savingsPlanNegation: boolean }
    }
    rebateToCustomer: {
      discount: { bundledDiscount: boolean; discount: boolean; credit: boolean; privateRateDiscount: boolean }
      adjustment: { credit: boolean; refund: boolean; savingsPlanNegation: boolean }
    }
  } | null
  onSuccess?: () => void
}

export function EditUsageDialog({ open, onOpenChange, account, onSuccess }: EditUsageDialogProps) {
  const [resellerDiscount, setResellerDiscount] = useState<number>(0)
  const [customerDiscount, setCustomerDiscount] = useState<number>(0)
  const [rebateToSeller, setRebateToSeller] = useState({
    usage: { discountedUsage: false, savingsPlanCoveredUsage: false },
    fee: { fee: false, riFee: false, savingsPlanRecurringFee: false, savingsPlanUpfrontFee: false },
    discount: {
      bundledDiscount: false,
      discount: false,
      credit: false,
      privateRateDiscount: false,
      distributorDiscount: false,
    },
    adjustment: { credit: false, refund: false, savingsPlanNegation: false },
  })
  const [rebateToCustomer, setRebateToCustomer] = useState({
    discount: { bundledDiscount: false, discount: false, credit: false, privateRateDiscount: false },
    adjustment: { credit: false, refund: false, savingsPlanNegation: false },
  })
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  React.useEffect(() => {
    if (account) {
      setResellerDiscount(account.resellerDiscount || 0)
      setCustomerDiscount(account.customerDiscount || 0)
      setRebateToSeller(
        account.rebateToSeller || {
          usage: { discountedUsage: false, savingsPlanCoveredUsage: false },
          fee: { fee: false, riFee: false, savingsPlanRecurringFee: false, savingsPlanUpfrontFee: false },
          discount: {
            bundledDiscount: false,
            discount: false,
            credit: false,
            privateRateDiscount: false,
            distributorDiscount: false,
          },
          adjustment: { credit: false, refund: false, savingsPlanNegation: false },
        },
      )
      setRebateToCustomer(
        account.rebateToCustomer || {
          discount: { bundledDiscount: false, discount: false, credit: false, privateRateDiscount: false },
          adjustment: { credit: false, refund: false, savingsPlanNegation: false },
        },
      )
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
      const vatNumber = formData.get("vat") as string

      await dataService.updateUsageAccount(account.id, {
        vatNumber: vatNumber || "",
        resellerDiscount,
        customerDiscount,
        rebateToSeller,
        rebateToCustomer,
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
                <Input id="edit-vat" name="vat" placeholder="DE123456789" defaultValue={account.vatNumber} />
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
              <h3 className="text-sm font-semibold text-[#00243E]">Rebate Configuration</h3>
              <p className="text-xs text-muted-foreground">
                Configure which cost components are rebated to sellers and customers
              </p>

              {/* Rebate to Seller */}
              <div className="space-y-4 border-l-2 border-[#026172] pl-4">
                <h4 className="text-sm font-medium text-[#00243E]">Rebate to Seller</h4>

                {/* Usage */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Usage</p>
                  <div className="space-y-1.5 ml-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seller-usage-discounted"
                        checked={rebateToSeller.usage.discountedUsage}
                        onCheckedChange={(checked) =>
                          setRebateToSeller((prev) => ({
                            ...prev,
                            usage: { ...prev.usage, discountedUsage: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="seller-usage-discounted" className="text-xs font-normal cursor-pointer">
                        Discounted Usage
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seller-usage-sp"
                        checked={rebateToSeller.usage.savingsPlanCoveredUsage}
                        onCheckedChange={(checked) =>
                          setRebateToSeller((prev) => ({
                            ...prev,
                            usage: { ...prev.usage, savingsPlanCoveredUsage: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="seller-usage-sp" className="text-xs font-normal cursor-pointer">
                        Savings Plan Covered Usage
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Fee */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Fee</p>
                  <div className="space-y-1.5 ml-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seller-fee-fee"
                        checked={rebateToSeller.fee.fee}
                        onCheckedChange={(checked) =>
                          setRebateToSeller((prev) => ({
                            ...prev,
                            fee: { ...prev.fee, fee: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="seller-fee-fee" className="text-xs font-normal cursor-pointer">
                        Fee
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seller-fee-ri"
                        checked={rebateToSeller.fee.riFee}
                        onCheckedChange={(checked) =>
                          setRebateToSeller((prev) => ({
                            ...prev,
                            fee: { ...prev.fee, riFee: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="seller-fee-ri" className="text-xs font-normal cursor-pointer">
                        RI Fee
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seller-fee-sp-recurring"
                        checked={rebateToSeller.fee.savingsPlanRecurringFee}
                        onCheckedChange={(checked) =>
                          setRebateToSeller((prev) => ({
                            ...prev,
                            fee: { ...prev.fee, savingsPlanRecurringFee: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="seller-fee-sp-recurring" className="text-xs font-normal cursor-pointer">
                        Savings Plan Recurring Fee
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seller-fee-sp-upfront"
                        checked={rebateToSeller.fee.savingsPlanUpfrontFee}
                        onCheckedChange={(checked) =>
                          setRebateToSeller((prev) => ({
                            ...prev,
                            fee: { ...prev.fee, savingsPlanUpfrontFee: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="seller-fee-sp-upfront" className="text-xs font-normal cursor-pointer">
                        Savings Plan Upfront Fee
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Discount */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Discount</p>
                  <div className="space-y-1.5 ml-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seller-discount-bundled"
                        checked={rebateToSeller.discount.bundledDiscount}
                        onCheckedChange={(checked) =>
                          setRebateToSeller((prev) => ({
                            ...prev,
                            discount: { ...prev.discount, bundledDiscount: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="seller-discount-bundled" className="text-xs font-normal cursor-pointer">
                        Bundled Discount
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seller-discount-discount"
                        checked={rebateToSeller.discount.discount}
                        onCheckedChange={(checked) =>
                          setRebateToSeller((prev) => ({
                            ...prev,
                            discount: { ...prev.discount, discount: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="seller-discount-discount" className="text-xs font-normal cursor-pointer">
                        Discount
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seller-discount-credit"
                        checked={rebateToSeller.discount.credit}
                        onCheckedChange={(checked) =>
                          setRebateToSeller((prev) => ({
                            ...prev,
                            discount: { ...prev.discount, credit: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="seller-discount-credit" className="text-xs font-normal cursor-pointer">
                        Credit
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seller-discount-private"
                        checked={rebateToSeller.discount.privateRateDiscount}
                        onCheckedChange={(checked) =>
                          setRebateToSeller((prev) => ({
                            ...prev,
                            discount: { ...prev.discount, privateRateDiscount: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="seller-discount-private" className="text-xs font-normal cursor-pointer">
                        Private Rate Discount
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seller-discount-distributor"
                        checked={rebateToSeller.discount.distributorDiscount}
                        onCheckedChange={(checked) =>
                          setRebateToSeller((prev) => ({
                            ...prev,
                            discount: { ...prev.discount, distributorDiscount: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="seller-discount-distributor" className="text-xs font-normal cursor-pointer">
                        Distributor Discount
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Adjustment */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Adjustment</p>
                  <div className="space-y-1.5 ml-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seller-adjustment-credit"
                        checked={rebateToSeller.adjustment.credit}
                        onCheckedChange={(checked) =>
                          setRebateToSeller((prev) => ({
                            ...prev,
                            adjustment: { ...prev.adjustment, credit: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="seller-adjustment-credit" className="text-xs font-normal cursor-pointer">
                        Credit
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seller-adjustment-refund"
                        checked={rebateToSeller.adjustment.refund}
                        onCheckedChange={(checked) =>
                          setRebateToSeller((prev) => ({
                            ...prev,
                            adjustment: { ...prev.adjustment, refund: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="seller-adjustment-refund" className="text-xs font-normal cursor-pointer">
                        Refund
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seller-adjustment-sp"
                        checked={rebateToSeller.adjustment.savingsPlanNegation}
                        onCheckedChange={(checked) =>
                          setRebateToSeller((prev) => ({
                            ...prev,
                            adjustment: { ...prev.adjustment, savingsPlanNegation: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="seller-adjustment-sp" className="text-xs font-normal cursor-pointer">
                        Savings Plan Negation
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rebate to Customer */}
              <div className="space-y-4 border-l-2 border-[#00243E] pl-4">
                <h4 className="text-sm font-medium text-[#00243E]">Rebate to Customer</h4>

                {/* Discount */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Discount</p>
                  <div className="space-y-1.5 ml-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="customer-discount-bundled"
                        checked={rebateToCustomer.discount.bundledDiscount}
                        onCheckedChange={(checked) =>
                          setRebateToCustomer((prev) => ({
                            ...prev,
                            discount: { ...prev.discount, bundledDiscount: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="customer-discount-bundled" className="text-xs font-normal cursor-pointer">
                        Bundled Discount
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="customer-discount-discount"
                        checked={rebateToCustomer.discount.discount}
                        onCheckedChange={(checked) =>
                          setRebateToCustomer((prev) => ({
                            ...prev,
                            discount: { ...prev.discount, discount: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="customer-discount-discount" className="text-xs font-normal cursor-pointer">
                        Discount
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="customer-discount-credit"
                        checked={rebateToCustomer.discount.credit}
                        onCheckedChange={(checked) =>
                          setRebateToCustomer((prev) => ({
                            ...prev,
                            discount: { ...prev.discount, credit: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="customer-discount-credit" className="text-xs font-normal cursor-pointer">
                        Credit
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="customer-discount-private"
                        checked={rebateToCustomer.discount.privateRateDiscount}
                        onCheckedChange={(checked) =>
                          setRebateToCustomer((prev) => ({
                            ...prev,
                            discount: { ...prev.discount, privateRateDiscount: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="customer-discount-private" className="text-xs font-normal cursor-pointer">
                        Private Rate Discount
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Adjustment */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Adjustment</p>
                  <div className="space-y-1.5 ml-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="customer-adjustment-credit"
                        checked={rebateToCustomer.adjustment.credit}
                        onCheckedChange={(checked) =>
                          setRebateToCustomer((prev) => ({
                            ...prev,
                            adjustment: { ...prev.adjustment, credit: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="customer-adjustment-credit" className="text-xs font-normal cursor-pointer">
                        Credit
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="customer-adjustment-refund"
                        checked={rebateToCustomer.adjustment.refund}
                        onCheckedChange={(checked) =>
                          setRebateToCustomer((prev) => ({
                            ...prev,
                            adjustment: { ...prev.adjustment, refund: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="customer-adjustment-refund" className="text-xs font-normal cursor-pointer">
                        Refund
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="customer-adjustment-sp"
                        checked={rebateToCustomer.adjustment.savingsPlanNegation}
                        onCheckedChange={(checked) =>
                          setRebateToCustomer((prev) => ({
                            ...prev,
                            adjustment: { ...prev.adjustment, savingsPlanNegation: checked as boolean },
                          }))
                        }
                      />
                      <Label htmlFor="customer-adjustment-sp" className="text-xs font-normal cursor-pointer">
                        Savings Plan Negation
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#00243E] hover:bg-[#00243E]/90" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
