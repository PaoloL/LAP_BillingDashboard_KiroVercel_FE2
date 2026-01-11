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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
        rebateToSeller,
        rebateToCustomer,
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
              <p className="text-xs text-muted-foreground">
                Configure which cost components are rebated to sellers and customers
              </p>

              {/* Split rebate configuration into tabs */}
              <Tabs defaultValue="seller" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="seller">Rebate to Seller</TabsTrigger>
                  <TabsTrigger value="customer">Rebate to Customer</TabsTrigger>
                </TabsList>

                <TabsContent value="seller" className="mt-4">
                  <Card className="border-[#026172] border-l-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-[#026172]">Seller Rebate Components</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Usage */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Usage</p>
                        <div className="space-y-2 ml-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="reg-seller-usage-discounted" className="text-xs font-normal cursor-pointer">
                              Discounted Usage
                            </Label>
                            <Switch
                              id="reg-seller-usage-discounted"
                              checked={rebateToSeller.usage.discountedUsage}
                              onCheckedChange={(checked) =>
                                setRebateToSeller((prev) => ({
                                  ...prev,
                                  usage: { ...prev.usage, discountedUsage: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="reg-seller-usage-sp" className="text-xs font-normal cursor-pointer">
                              Savings Plan Covered Usage
                            </Label>
                            <Switch
                              id="reg-seller-usage-sp"
                              checked={rebateToSeller.usage.savingsPlanCoveredUsage}
                              onCheckedChange={(checked) =>
                                setRebateToSeller((prev) => ({
                                  ...prev,
                                  usage: { ...prev.usage, savingsPlanCoveredUsage: checked },
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Fee */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Fee</p>
                        <div className="space-y-2 ml-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="reg-seller-fee" className="text-xs font-normal cursor-pointer">
                              Fee
                            </Label>
                            <Switch
                              id="reg-seller-fee"
                              checked={rebateToSeller.fee.fee}
                              onCheckedChange={(checked) =>
                                setRebateToSeller((prev) => ({
                                  ...prev,
                                  fee: { ...prev.fee, fee: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="reg-seller-ri-fee" className="text-xs font-normal cursor-pointer">
                              RI Fee
                            </Label>
                            <Switch
                              id="reg-seller-ri-fee"
                              checked={rebateToSeller.fee.riFee}
                              onCheckedChange={(checked) =>
                                setRebateToSeller((prev) => ({
                                  ...prev,
                                  fee: { ...prev.fee, riFee: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="reg-seller-sp-recurring-fee" className="text-xs font-normal cursor-pointer">
                              Savings Plan Recurring Fee
                            </Label>
                            <Switch
                              id="reg-seller-sp-recurring-fee"
                              checked={rebateToSeller.fee.savingsPlanRecurringFee}
                              onCheckedChange={(checked) =>
                                setRebateToSeller((prev) => ({
                                  ...prev,
                                  fee: { ...prev.fee, savingsPlanRecurringFee: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="reg-seller-sp-upfront-fee" className="text-xs font-normal cursor-pointer">
                              Savings Plan Upfront Fee
                            </Label>
                            <Switch
                              id="reg-seller-sp-upfront-fee"
                              checked={rebateToSeller.fee.savingsPlanUpfrontFee}
                              onCheckedChange={(checked) =>
                                setRebateToSeller((prev) => ({
                                  ...prev,
                                  fee: { ...prev.fee, savingsPlanUpfrontFee: checked },
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Discount */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Discount</p>
                        <div className="space-y-2 ml-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="reg-seller-discount-bundled" className="text-xs font-normal cursor-pointer">
                              Bundled Discount
                            </Label>
                            <Switch
                              id="reg-seller-discount-bundled"
                              checked={rebateToSeller.discount.bundledDiscount}
                              onCheckedChange={(checked) =>
                                setRebateToSeller((prev) => ({
                                  ...prev,
                                  discount: { ...prev.discount, bundledDiscount: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="reg-seller-discount-discount"
                              className="text-xs font-normal cursor-pointer"
                            >
                              Discount
                            </Label>
                            <Switch
                              id="reg-seller-discount-discount"
                              checked={rebateToSeller.discount.discount}
                              onCheckedChange={(checked) =>
                                setRebateToSeller((prev) => ({
                                  ...prev,
                                  discount: { ...prev.discount, discount: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="reg-seller-discount-credit" className="text-xs font-normal cursor-pointer">
                              Credit
                            </Label>
                            <Switch
                              id="reg-seller-discount-credit"
                              checked={rebateToSeller.discount.credit}
                              onCheckedChange={(checked) =>
                                setRebateToSeller((prev) => ({
                                  ...prev,
                                  discount: { ...prev.discount, credit: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="reg-seller-discount-private-rate"
                              className="text-xs font-normal cursor-pointer"
                            >
                              Private Rate Discount
                            </Label>
                            <Switch
                              id="reg-seller-discount-private-rate"
                              checked={rebateToSeller.discount.privateRateDiscount}
                              onCheckedChange={(checked) =>
                                setRebateToSeller((prev) => ({
                                  ...prev,
                                  discount: { ...prev.discount, privateRateDiscount: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="reg-seller-discount-distributor"
                              className="text-xs font-normal cursor-pointer"
                            >
                              Distributor Discount
                            </Label>
                            <Switch
                              id="reg-seller-discount-distributor"
                              checked={rebateToSeller.discount.distributorDiscount}
                              onCheckedChange={(checked) =>
                                setRebateToSeller((prev) => ({
                                  ...prev,
                                  discount: { ...prev.discount, distributorDiscount: checked },
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Adjustment */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Adjustment</p>
                        <div className="space-y-2 ml-2">
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="reg-seller-adjustment-credit"
                              className="text-xs font-normal cursor-pointer"
                            >
                              Credit
                            </Label>
                            <Switch
                              id="reg-seller-adjustment-credit"
                              checked={rebateToSeller.adjustment.credit}
                              onCheckedChange={(checked) =>
                                setRebateToSeller((prev) => ({
                                  ...prev,
                                  adjustment: { ...prev.adjustment, credit: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="reg-seller-adjustment-refund"
                              className="text-xs font-normal cursor-pointer"
                            >
                              Refund
                            </Label>
                            <Switch
                              id="reg-seller-adjustment-refund"
                              checked={rebateToSeller.adjustment.refund}
                              onCheckedChange={(checked) =>
                                setRebateToSeller((prev) => ({
                                  ...prev,
                                  adjustment: { ...prev.adjustment, refund: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="reg-seller-adjustment-sp-negation"
                              className="text-xs font-normal cursor-pointer"
                            >
                              Savings Plan Negation
                            </Label>
                            <Switch
                              id="reg-seller-adjustment-sp-negation"
                              checked={rebateToSeller.adjustment.savingsPlanNegation}
                              onCheckedChange={(checked) =>
                                setRebateToSeller((prev) => ({
                                  ...prev,
                                  adjustment: { ...prev.adjustment, savingsPlanNegation: checked },
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="customer" className="mt-4">
                  <Card className="border-[#00243E] border-l-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-[#00243E]">Customer Rebate Components</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Discount */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Discount</p>
                        <div className="space-y-2 ml-2">
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="reg-customer-discount-bundled"
                              className="text-xs font-normal cursor-pointer"
                            >
                              Bundled Discount
                            </Label>
                            <Switch
                              id="reg-customer-discount-bundled"
                              checked={rebateToCustomer.discount.bundledDiscount}
                              onCheckedChange={(checked) =>
                                setRebateToCustomer((prev) => ({
                                  ...prev,
                                  discount: { ...prev.discount, bundledDiscount: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="reg-customer-discount-discount"
                              className="text-xs font-normal cursor-pointer"
                            >
                              Discount
                            </Label>
                            <Switch
                              id="reg-customer-discount-discount"
                              checked={rebateToCustomer.discount.discount}
                              onCheckedChange={(checked) =>
                                setRebateToCustomer((prev) => ({
                                  ...prev,
                                  discount: { ...prev.discount, discount: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="reg-customer-discount-credit"
                              className="text-xs font-normal cursor-pointer"
                            >
                              Credit
                            </Label>
                            <Switch
                              id="reg-customer-discount-credit"
                              checked={rebateToCustomer.discount.credit}
                              onCheckedChange={(checked) =>
                                setRebateToCustomer((prev) => ({
                                  ...prev,
                                  discount: { ...prev.discount, credit: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="reg-customer-discount-private-rate"
                              className="text-xs font-normal cursor-pointer"
                            >
                              Private Rate Discount
                            </Label>
                            <Switch
                              id="reg-customer-discount-private-rate"
                              checked={rebateToCustomer.discount.privateRateDiscount}
                              onCheckedChange={(checked) =>
                                setRebateToCustomer((prev) => ({
                                  ...prev,
                                  discount: { ...prev.discount, privateRateDiscount: checked },
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Adjustment */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Adjustment</p>
                        <div className="space-y-2 ml-2">
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="reg-customer-adjustment-credit"
                              className="text-xs font-normal cursor-pointer"
                            >
                              Credit
                            </Label>
                            <Switch
                              id="reg-customer-adjustment-credit"
                              checked={rebateToCustomer.adjustment.credit}
                              onCheckedChange={(checked) =>
                                setRebateToCustomer((prev) => ({
                                  ...prev,
                                  adjustment: { ...prev.adjustment, credit: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="reg-customer-adjustment-refund"
                              className="text-xs font-normal cursor-pointer"
                            >
                              Refund
                            </Label>
                            <Switch
                              id="reg-customer-adjustment-refund"
                              checked={rebateToCustomer.adjustment.refund}
                              onCheckedChange={(checked) =>
                                setRebateToCustomer((prev) => ({
                                  ...prev,
                                  adjustment: { ...prev.adjustment, refund: checked },
                                }))
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label
                              htmlFor="reg-customer-adjustment-sp-negation"
                              className="text-xs font-normal cursor-pointer"
                            >
                              Savings Plan Negation
                            </Label>
                            <Switch
                              id="reg-customer-adjustment-sp-negation"
                              checked={rebateToCustomer.adjustment.savingsPlanNegation}
                              onCheckedChange={(checked) =>
                                setRebateToCustomer((prev) => ({
                                  ...prev,
                                  adjustment: { ...prev.adjustment, savingsPlanNegation: checked },
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#00243E] hover:bg-[#00243E]/90" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
