"use client"

import React from "react"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { validateDiscounts } from "@/lib/types" // Import validateDiscounts
import { dataService } from "@/lib/data/data-service" // Import dataService

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
    rebateConfig: {
      savingsPlansRI: {
        discountedUsage: boolean
        savingsPlanNegation: boolean
      }
      discount: {
        discount: boolean
        bundledDiscount: boolean
        credit: boolean
        privateRateDiscount: boolean
      }
      adjustment: {
        credit: boolean
        refund: boolean
      }
    }
  } | null
  onSuccess?: () => void
}

export function EditUsageDialog({ open, onOpenChange, account, onSuccess }: EditUsageDialogProps) {
  const [resellerDiscount, setResellerDiscount] = useState<number>(0)
  const [customerDiscount, setCustomerDiscount] = useState<number>(0)
  const [rebateConfig, setRebateConfig] = useState({
    savingsPlansRI: {
      discountedUsage: false,
      savingsPlanNegation: false,
    },
    discount: {
      discount: false,
      bundledDiscount: false,
      credit: false,
      privateRateDiscount: false,
    },
    adjustment: {
      credit: false,
      refund: false,
    },
  })
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  React.useEffect(() => {
    if (account) {
      setResellerDiscount(account.resellerDiscount || 0)
      setCustomerDiscount(account.customerDiscount || 0)
      setRebateConfig(
        account.rebateConfig || {
          savingsPlansRI: {
            discountedUsage: false,
            savingsPlanNegation: false,
          },
          discount: {
            discount: false,
            bundledDiscount: false,
            credit: false,
            privateRateDiscount: false,
          },
          adjustment: {
            credit: false,
            refund: false,
          },
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
        rebateConfig,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
              <p className="text-xs text-muted-foreground">Configure which AWS cost components should be rebated</p>

              <div className="space-y-4">
                {/* Savings Plans / RI */}
                <Card className="border-[#026172] border-l-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-[#026172]">Savings Plans / RI</CardTitle>
                    <p className="text-xs text-muted-foreground">Rebate Saving Plans or RI benefits</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-sp-discounted" className="text-sm font-normal cursor-pointer">
                        Discounted Usage
                      </Label>
                      <Switch
                        id="edit-sp-discounted"
                        checked={rebateConfig.savingsPlansRI.discountedUsage}
                        onCheckedChange={(checked) =>
                          setRebateConfig((prev) => ({
                            ...prev,
                            savingsPlansRI: { ...prev.savingsPlansRI, discountedUsage: checked },
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-sp-negation" className="text-sm font-normal cursor-pointer">
                        SP Negation
                      </Label>
                      <Switch
                        id="edit-sp-negation"
                        checked={rebateConfig.savingsPlansRI.savingsPlanNegation}
                        onCheckedChange={(checked) =>
                          setRebateConfig((prev) => ({
                            ...prev,
                            savingsPlansRI: { ...prev.savingsPlansRI, savingsPlanNegation: checked },
                          }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Discount */}
                <Card className="border-[#026172] border-l-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-[#026172]">Discount</CardTitle>
                    <p className="text-xs text-muted-foreground">Rebate any discounts that AWS applied to your usage</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-discount" className="text-sm font-normal cursor-pointer">
                        Discount
                      </Label>
                      <Switch
                        id="edit-discount"
                        checked={rebateConfig.discount.discount}
                        onCheckedChange={(checked) =>
                          setRebateConfig((prev) => ({
                            ...prev,
                            discount: { ...prev.discount, discount: checked },
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-bundled" className="text-sm font-normal cursor-pointer">
                        Bundled Discount
                      </Label>
                      <Switch
                        id="edit-bundled"
                        checked={rebateConfig.discount.bundledDiscount}
                        onCheckedChange={(checked) =>
                          setRebateConfig((prev) => ({
                            ...prev,
                            discount: { ...prev.discount, bundledDiscount: checked },
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-discount-credit" className="text-sm font-normal cursor-pointer">
                        Credit
                      </Label>
                      <Switch
                        id="edit-discount-credit"
                        checked={rebateConfig.discount.credit}
                        onCheckedChange={(checked) =>
                          setRebateConfig((prev) => ({
                            ...prev,
                            discount: { ...prev.discount, credit: checked },
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-private-rate" className="text-sm font-normal cursor-pointer">
                        Private Rate Discount
                      </Label>
                      <Switch
                        id="edit-private-rate"
                        checked={rebateConfig.discount.privateRateDiscount}
                        onCheckedChange={(checked) =>
                          setRebateConfig((prev) => ({
                            ...prev,
                            discount: { ...prev.discount, privateRateDiscount: checked },
                          }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Adjustment */}
                <Card className="border-[#026172] border-l-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-[#026172]">Adjustment</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Rebate any adjustment that AWS applied to your usage
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-adj-credit" className="text-sm font-normal cursor-pointer">
                        Credit
                      </Label>
                      <Switch
                        id="edit-adj-credit"
                        checked={rebateConfig.adjustment.credit}
                        onCheckedChange={(checked) =>
                          setRebateConfig((prev) => ({
                            ...prev,
                            adjustment: { ...prev.adjustment, credit: checked },
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="edit-adj-refund" className="text-sm font-normal cursor-pointer">
                        Refund
                      </Label>
                      <Switch
                        id="edit-adj-refund"
                        checked={rebateConfig.adjustment.refund}
                        onCheckedChange={(checked) =>
                          setRebateConfig((prev) => ({
                            ...prev,
                            adjustment: { ...prev.adjustment, refund: checked },
                          }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !!validationError}
              className="bg-[#00243E] hover:bg-[#00243E]/90"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
