"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Customer, UsageAccount, CostCenter } from "@/lib/types"
import { Plus, Trash2, Link2, Layers } from "lucide-react"

interface CustomerEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  usageAccounts: UsageAccount[]
  onSave: (data: { legalName: string; contactName: string; contactEmail: string }) => void
  onAddCostCenter: (data: { name: string; description: string }) => void
  onRemoveCostCenter: (costCenterId: string) => void
  onManageAccounts: (costCenter: CostCenter) => void
}

export function CustomerEditDialog({
  open,
  onOpenChange,
  customer,
  usageAccounts,
  onSave,
  onAddCostCenter,
  onRemoveCostCenter,
  onManageAccounts,
}: CustomerEditDialogProps) {
  const [legalName, setLegalName] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [ccName, setCcName] = useState("")
  const [ccDesc, setCcDesc] = useState("")
  const [showCcForm, setShowCcForm] = useState(false)

  useEffect(() => {
    if (customer) {
      setLegalName(customer.legalName)
      setContactName(customer.contactName)
      setContactEmail(customer.contactEmail)
    }
    setCcName("")
    setCcDesc("")
    setShowCcForm(false)
  }, [customer, open])

  if (!customer) return null

  function handleSave() {
    onSave({
      legalName: legalName.trim(),
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
    })
    onOpenChange(false)
  }

  function handleAddCC() {
    if (!ccName.trim()) return
    onAddCostCenter({ name: ccName.trim(), description: ccDesc.trim() })
    setCcName("")
    setCcDesc("")
    setShowCcForm(false)
  }

  function getAccountName(accountId: string) {
    const acc = usageAccounts.find((a) => a.accountId === accountId)
    return acc?.accountName || accountId
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-2">
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Customer Information</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Legal Name</Label>
                  <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>VAT Number</Label>
                  <Input value={customer.vatNumber} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">VAT number cannot be changed</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Contact Name</Label>
                  <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Contact Email</Label>
                  <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Cost Centers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  Cost Centers ({customer.costCenters.length})
                </h3>
                <Button variant="outline" size="sm" onClick={() => setShowCcForm(!showCcForm)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Cost Center
                </Button>
              </div>

              {showCcForm && (
                <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Name</Label>
                    <Input value={ccName} onChange={(e) => setCcName(e.target.value)} placeholder="e.g. Engineering" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Description</Label>
                    <Input value={ccDesc} onChange={(e) => setCcDesc(e.target.value)} placeholder="Optional" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => { setShowCcForm(false); setCcName(""); setCcDesc("") }}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddCC} disabled={!ccName.trim()}>
                      Create
                    </Button>
                  </div>
                </div>
              )}

              {customer.costCenters.length === 0 && !showCcForm && (
                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                  No cost centers. Add one to associate usage accounts.
                </p>
              )}

              <div className="space-y-2">
                {customer.costCenters.map((cc) => (
                  <div key={cc.id} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{cc.name}</p>
                        {cc.description && <p className="text-xs text-muted-foreground">{cc.description}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-destructive hover:text-destructive"
                        onClick={() => onRemoveCostCenter(cc.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">Linked Accounts ({cc.usageAccountIds.length})</p>
                        <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => onManageAccounts(cc)}>
                          <Link2 className="h-3 w-3 mr-1" /> Manage
                        </Button>
                      </div>
                      {cc.usageAccountIds.length > 0 ? (
                        <div className="space-y-1">
                          {cc.usageAccountIds.map((accId) => (
                            <div key={accId} className="flex items-center gap-2 text-xs bg-muted/50 rounded px-2 py-1">
                              <Link2 className="h-3 w-3 text-muted-foreground" />
                              <span>{getAccountName(accId)} ({accId})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No accounts linked</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
