"use client"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/format"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { calculateCosts } from "@/lib/types"

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

const recentTransactions = [
  { period: "2025-01", usage: 5000.0, fee: 100.0, credit: 234.56, customerDiscount: 10, rebateCredits: true },
  { period: "2024-12", usage: 6300.0, fee: 100.0, credit: 243.21, customerDiscount: 10, rebateCredits: true },
  { period: "2024-11", usage: 4700.0, fee: 100.0, credit: 176.23, customerDiscount: 10, rebateCredits: true },
]

export function UsageDetailsDialog({ open, onOpenChange, account }: UsageDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle className="text-[#00243E]">{account.customer}</DialogTitle>
        <DialogDescription>Account ID: {account.id}</DialogDescription>
      </DialogHeader>

      <DialogContent className="sm:max-w-[600px]">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="space-y-4 rounded-lg border border-border p-4">
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
          </TabsContent>

          <TabsContent value="transactions" className="space-y-3">
            <div className="divide-y divide-border rounded-lg border border-border">
              {recentTransactions.map((transaction, index) => {
                const { totalCost, discountedCost } = calculateCosts(
                  transaction.usage,
                  transaction.fee,
                  transaction.credit,
                  transaction.customerDiscount,
                  transaction.rebateCredits,
                )

                return (
                  <div key={index} className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{transaction.period}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#EC9400]">Usage: {formatCurrency(transaction.usage)}</span>
                        <span className="text-[#00243E]">Fee: {formatCurrency(transaction.fee)}</span>
                        {transaction.rebateCredits && transaction.credit > 0 && (
                          <span className="text-[#026172]">Credit: {formatCurrency(transaction.credit)}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Net Cost: {formatCurrency(totalCost)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[#00243E]">{formatCurrency(discountedCost)}</p>
                      <p className="text-xs text-[#026172]">Saved {formatCurrency(totalCost - discountedCost)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
