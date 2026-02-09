"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Customer, UsageAccount, CostCenter } from "@/lib/types"
import {
  Building2,
  User,
  Mail,
  Receipt,
  Link2,
  Plus,
  Trash2,
  Layers,
  Calendar,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

interface CustomerDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  usageAccounts: UsageAccount[]
  onManageAccounts: (costCenter: CostCenter) => void
  onAddCostCenter: (data: { name: string; description: string }) => void
  onRemoveCostCenter: (costCenterId: string) => void
}

export function CustomerDetailsDialog({
  open,
  onOpenChange,
  customer,
  usageAccounts,
  onManageAccounts,
  onAddCostCenter,
  onRemoveCostCenter,
}: CustomerDetailsDialogProps) {
  const [ccName, setCcName] = useState("")
  const [ccDesc, setCcDesc] = useState("")
  const [showCcForm, setShowCcForm] = useState(false)
  const [expandedCCs, setExpandedCCs] = useState<Set<string>>(new Set())

  if (!customer) return null

  function toggleCC(ccId: string) {
    setExpandedCCs((prev) => {
      const next = new Set(prev)
      if (next.has(ccId)) next.delete(ccId)
      else next.add(ccId)
      return next
    })
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
    return acc?.name || acc?.accountName || accountId
  }

  const totalAccounts = customer.costCenters.reduce((sum, cc) => sum + cc.usageAccountIds.length, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">Customer Details</DialogTitle>
            <Badge
              variant={customer.status === "Active" ? "default" : "secondary"}
              className={customer.status === "Active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : ""}
            >
              {customer.status}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-2">
          <div className="space-y-6">
            {/* General Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                General Information
              </h3>
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Legal Name
                  </p>
                  <p className="text-sm font-semibold text-foreground">{customer.legalName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Receipt className="h-3 w-3" /> VAT Number
                  </p>
                  <p className="text-sm font-mono text-foreground">{customer.vatNumber}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" /> Contact Name
                  </p>
                  <p className="text-sm text-foreground">{customer.contactName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Contact Email
                  </p>
                  <p className="text-sm text-foreground">{customer.contactEmail || "---"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Created
                  </p>
                  <p className="text-sm text-foreground">
                    {new Date(customer.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Layers className="h-3 w-3" /> Summary
                  </p>
                  <p className="text-sm text-foreground">
                    {customer.costCenters.length} Cost Center{customer.costCenters.length !== 1 ? "s" : ""} / {totalAccounts} Account{totalAccounts !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Cost Centers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  Cost Centers ({customer.costCenters.length})
                </h3>
                {customer.status === "Active" && (
                  <Button variant="outline" size="sm" onClick={() => setShowCcForm(!showCcForm)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                )}
              </div>

              {showCcForm && (
                <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Name</Label>
                    <Input value={ccName} onChange={(e) => setCcName(e.target.value)} placeholder="e.g. Engineering" className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Description</Label>
                    <Input value={ccDesc} onChange={(e) => setCcDesc(e.target.value)} placeholder="Optional description" className="h-8 text-sm" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => { setShowCcForm(false); setCcName(""); setCcDesc("") }}>Cancel</Button>
                    <Button size="sm" onClick={handleAddCC} disabled={!ccName.trim()}>Create</Button>
                  </div>
                </div>
              )}

              {customer.costCenters.length === 0 && !showCcForm && (
                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                  No cost centers yet. Add one to start associating usage accounts.
                </p>
              )}

              <div className="space-y-2">
                {customer.costCenters.map((cc) => {
                  const isExpanded = expandedCCs.has(cc.id)
                  return (
                    <div key={cc.id} className="rounded-lg border border-border overflow-hidden">
                      <button
                        className="flex items-center justify-between w-full px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                        onClick={() => toggleCC(cc.id)}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          <div>
                            <p className="text-sm font-medium text-foreground">{cc.name}</p>
                            {cc.description && <p className="text-xs text-muted-foreground">{cc.description}</p>}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {cc.usageAccountIds.length} account{cc.usageAccountIds.length !== 1 ? "s" : ""}
                        </Badge>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-border bg-muted/20 px-4 py-3 space-y-3">
                          {cc.usageAccountIds.length > 0 ? (
                            <div className="space-y-1.5">
                              {cc.usageAccountIds.map((accId) => (
                                <div key={accId} className="flex items-center gap-2 text-sm">
                                  <Link2 className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-medium">{getAccountName(accId)}</span>
                                  <span className="text-xs font-mono text-muted-foreground">({accId})</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No accounts linked yet.</p>
                          )}
                          <div className="flex gap-2 justify-end">
                            {customer.status === "Active" && (
                              <>
                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onManageAccounts(cc)}>
                                  <Link2 className="h-3 w-3 mr-1" /> Manage Accounts
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => onRemoveCostCenter(cc.id)}>
                                  <Trash2 className="h-3 w-3 mr-1" /> Remove
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
