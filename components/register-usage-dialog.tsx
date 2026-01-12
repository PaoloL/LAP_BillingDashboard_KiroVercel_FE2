"use client"

import type React from "react"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export function RegisterUsageDialog({
  open,
  onOpenChange,
  payerAccount,
  accountId,
  accountName,
  onSuccess,
}: RegisterUsageDialogProps) {
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
      const customerName = formData.get("customer") as string
      const vatNumber = formData.get("vat") as string

      // First update the account with all configuration
      await dataService.updateUsageAccount(accountId, {
        customer: customerName,
        vatNumber: vatNumber || "",
        resellerDiscount,
        customerDiscount,
        rebateConfig,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                  defaultValue={accountId || ""}
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
                  defaultValue={accountName || ""}
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
                      <Label htmlFor="reg-sp-discounted" className="text-sm font-normal cursor-pointer">
                        Discounted Usage
                      </Label>
                      <Switch
                        id="reg-sp-discounted"
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
                      <Label htmlFor="reg-sp-negation" className="text-sm font-normal cursor-pointer">
                        SP Negation
                      </Label>
                      <Switch
                        id="reg-sp-negation"
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
                      <Label htmlFor="reg-discount" className="text-sm font-normal cursor-pointer">
                        Discount
                      </Label>
                      <Switch
                        id="reg-discount"
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
                      <Label htmlFor="reg-bundled" className="text-sm font-normal cursor-pointer">
                        Bundled Discount
                      </Label>
                      <Switch
                        id="reg-bundled"
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
                      <Label htmlFor="reg-discount-credit" className="text-sm font-normal cursor-pointer">
                        Credit
                      </Label>
                      <Switch
                        id="reg-discount-credit"
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
                      <Label htmlFor="reg-private-rate" className="text-sm font-normal cursor-pointer">
                        Private Rate Discount
                      </Label>
                      <Switch
                        id="reg-private-rate"
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
                      <Label htmlFor="reg-adj-credit" className="text-sm font-normal cursor-pointer">
                        Credit
                      </Label>
                      <Switch
                        id="reg-adj-credit"
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
                      <Label htmlFor="reg-adj-refund" className="text-sm font-normal cursor-pointer">
                        Refund
                      </Label>
                      <Switch
                        id="reg-adj-refund"
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
              {isSubmitting ? "Registering..." : "Register Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
