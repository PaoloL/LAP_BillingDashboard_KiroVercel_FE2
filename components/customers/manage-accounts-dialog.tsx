"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Customer, UsageAccount, CostCenter } from "@/lib/types"
import { Link2, Layers } from "lucide-react"

interface ManageAccountsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  usageAccounts: UsageAccount[]
  onManageAccounts: (costCenter: CostCenter) => void
}

export function ManageAccountsDialog({
  open,
  onOpenChange,
  customer,
  usageAccounts,
  onManageAccounts,
}: ManageAccountsDialogProps) {
  if (!customer) return null

  function getAccountName(accountId: string) {
    const acc = usageAccounts.find((a) => a.accountId === accountId)
    return acc?.accountName || accountId
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-muted-foreground" />
            Manage Account Associations
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {customer.costCenters.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
              No cost centers available. Create a cost center first.
            </p>
          )}

          <div className="space-y-3">
            {customer.costCenters.map((cc) => (
              <div key={cc.id} className="rounded-lg border border-border p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{cc.name}</p>
                    </div>
                    {cc.description && <p className="text-xs text-muted-foreground mt-1 ml-6">{cc.description}</p>}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onManageAccounts(cc)}>
                    <Link2 className="h-3.5 w-3.5 mr-1" /> Manage
                  </Button>
                </div>

                <div className="ml-6 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    Linked Accounts ({cc.usageAccountIds.length})
                  </p>
                  {cc.usageAccountIds.length > 0 ? (
                    <div className="space-y-1">
                      {cc.usageAccountIds.map((accId) => (
                        <div key={accId} className="flex items-center gap-2 text-xs bg-muted/50 rounded px-2 py-1.5">
                          <Link2 className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{getAccountName(accId)}</span>
                          <span className="text-muted-foreground">({accId})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No accounts linked yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
