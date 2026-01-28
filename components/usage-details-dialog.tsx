"use client"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/format"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface UsageDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: {
    id: string
    customer: string
    status: "Active" | "Inactive"
    vatNumber: string
    discountValue: number
    rebateCredits: boolean
    fundsUtilization: number
    totalUsage: number
    totalDeposit: number
  }
}

export function UsageDetailsDialog({ open, onOpenChange, account }: UsageDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="text-[#00243E]">{account.customer}</DialogTitle>
        <DialogDescription>Account ID: {account.id}</DialogDescription>
      </DialogHeader>

      <DialogContent className="sm:max-w-[600px]">
        <div className="space-y-6">
          <div className="space-y-4 rounded-lg border border-border p-4">
            <h4 className="font-semibold text-[#00243E]">Account Info</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Account Status</span>
              <Badge
                variant="secondary"
                className={cn(
                  account.status === "Active" ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600",
                )}
              >
                {account.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">VAT Number</span>
              <span className="text-sm font-semibold text-foreground">{account.vatNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Customer Discount</span>
              <span className="text-sm font-semibold text-foreground">{account.discountValue}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Rebate Credits</span>
              <div className="flex items-center gap-2">
                {account.rebateCredits ? (
                  <>
                    <Check className="h-4 w-4 text-[#026172]" />
                    <span className="text-sm font-semibold text-foreground">Enabled</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-semibold text-foreground">Disabled</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border p-4">
            <h4 className="font-semibold text-[#00243E]">Funds Utilization</h4>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-[#026172]" style={{ width: `${account.fundsUtilization}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{formatCurrency(account.totalUsage)} used</span>
              <span className="font-semibold text-foreground">{account.fundsUtilization}%</span>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3 text-sm">
              <span className="text-muted-foreground">Total Deposit</span>
              <span className="font-semibold text-foreground">{formatCurrency(account.totalDeposit)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Remaining</span>
              <span className="font-semibold text-[#026172]">
                {formatCurrency(account.totalDeposit - account.totalUsage)}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
