"use client"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { dataService } from "@/lib/data/data-service"
import type { PayerAccount } from "@/lib/types"

interface PayerDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: PayerAccount
}

export function PayerDetailsDialog({ open, onOpenChange, account }: PayerDetailsDialogProps) {
  const [accountDetails, setAccountDetails] = useState<PayerAccount | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && account.accountId) {
      loadData()
    }
  }, [open, account.accountId])

  const loadData = async () => {
    setLoading(true)
    try {
      const accounts = await dataService.getPayerAccounts()
      const accountData = accounts.find((a: any) => a.accountId === account.accountId)
      setAccountDetails(accountData || account)
    } catch (error) {
      console.error('Failed to load account data:', error)
      setAccountDetails(account)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-[#00243E]">{accountDetails?.accountName || account.accountName}</DialogTitle>
          <DialogDescription>Account ID: {accountDetails?.accountId || account.accountId}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Account Status</span>
                <Badge
                  variant="secondary"
                  className={
                    accountDetails?.status === "Registered" 
                      ? "bg-green-500/10 text-green-600" 
                      : "bg-gray-500/10 text-gray-600"
                  }
                >
                  {accountDetails?.status || account.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Distributor Name</span>
                <span className="text-sm font-semibold text-foreground">{accountDetails?.distributorName || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Legal Entity Name</span>
                <span className="text-sm font-semibold text-foreground">{accountDetails?.legalEntityName || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">VAT Number</span>
                <span className="text-sm font-semibold text-foreground">{accountDetails?.vatNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Currency</span>
                <span className="text-sm font-semibold text-foreground">{accountDetails?.currency || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-4 rounded-lg border border-border p-4">
              <h4 className="font-semibold text-[#00243E]">Cross-Account Access</h4>
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm font-medium text-muted-foreground">Role ARN</span>
                <span className="text-sm font-mono text-foreground break-all text-right">
                  {accountDetails?.crossAccountRoleArn || 'N/A'}
                </span>
              </div>
            </div>

            {(accountDetails?.resellerDiscount || accountDetails?.customerDiscount) && (
              <div className="space-y-4 rounded-lg border border-border p-4">
                <h4 className="font-semibold text-[#00243E]">Discount Configuration</h4>
                {accountDetails?.resellerDiscount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Reseller Discount</span>
                    <span className="text-sm font-semibold text-foreground">{accountDetails.resellerDiscount}%</span>
                  </div>
                )}
                {accountDetails?.customerDiscount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Customer Discount</span>
                    <span className="text-sm font-semibold text-foreground">{accountDetails.customerDiscount}%</span>
                  </div>
                )}
              </div>
            )}

            {accountDetails?.rebateConfig && (
              <div className="space-y-4 rounded-lg border border-border p-4">
                <h4 className="font-semibold text-[#00243E]">Rebate Configuration</h4>
                <div className="flex flex-wrap gap-2">
                  {accountDetails.rebateConfig.savingsPlansRI?.spNegation && (
                    <Badge variant="secondary" className="bg-[#EC9400]/10 text-[#EC9400] hover:bg-[#EC9400]/20">
                      SP Negation
                    </Badge>
                  )}
                  {accountDetails.rebateConfig.savingsPlansRI?.discountedUsage && (
                    <Badge variant="secondary" className="bg-[#EC9400]/10 text-[#EC9400] hover:bg-[#EC9400]/20">
                      Discounted Usage
                    </Badge>
                  )}
                  {accountDetails.rebateConfig.discount?.credit && (
                    <Badge variant="secondary" className="bg-[#EC9400]/10 text-[#EC9400] hover:bg-[#EC9400]/20">
                      Discount Credit
                    </Badge>
                  )}
                  {accountDetails.rebateConfig.discount?.privateRateDiscount && (
                    <Badge variant="secondary" className="bg-[#EC9400]/10 text-[#EC9400] hover:bg-[#EC9400]/20">
                      Private Rate Discount
                    </Badge>
                  )}
                  {accountDetails.rebateConfig.discount?.bundledDiscount && (
                    <Badge variant="secondary" className="bg-[#EC9400]/10 text-[#EC9400] hover:bg-[#EC9400]/20">
                      Bundled Discount
                    </Badge>
                  )}
                  {accountDetails.rebateConfig.adjustment?.credit && (
                    <Badge variant="secondary" className="bg-[#EC9400]/10 text-[#EC9400] hover:bg-[#EC9400]/20">
                      Adjustment Credit
                    </Badge>
                  )}
                  {accountDetails.rebateConfig.adjustment?.refund && (
                    <Badge variant="secondary" className="bg-[#EC9400]/10 text-[#EC9400] hover:bg-[#EC9400]/20">
                      Adjustment Refund
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
