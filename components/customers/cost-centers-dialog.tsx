"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { Customer } from "@/lib/types"
import { Plus, Trash2, Layers } from "lucide-react"

interface CostCentersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onAddCostCenter: (data: { name: string; description: string }) => void
  onRemoveCostCenter: (costCenterId: string) => void
}

export function CostCentersDialog({
  open,
  onOpenChange,
  customer,
  onAddCostCenter,
  onRemoveCostCenter,
}: CostCentersDialogProps) {
  const [ccName, setCcName] = useState("")
  const [ccDesc, setCcDesc] = useState("")
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setCcName("")
    setCcDesc("")
    setShowForm(false)
  }, [open])

  if (!customer) return null

  function handleAdd() {
    if (!ccName.trim()) return
    onAddCostCenter({ name: ccName.trim(), description: ccDesc.trim() })
    setCcName("")
    setCcDesc("")
    setShowForm(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-muted-foreground" />
              Manage Cost Centers
            </DialogTitle>
            <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {showForm && (
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
                <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setCcName(""); setCcDesc("") }}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAdd} disabled={!ccName.trim()}>
                  Create
                </Button>
              </div>
            </div>
          )}

          {customer.costCenters.length === 0 && !showForm && (
            <p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
              No cost centers yet. Click "Add" to create one.
            </p>
          )}

          <div className="space-y-2">
            {customer.costCenters.map((cc) => (
              <div key={cc.id} className="flex items-start justify-between rounded-lg border border-border p-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{cc.name}</p>
                  {cc.description && <p className="text-xs text-muted-foreground mt-0.5">{cc.description}</p>}
                  <Badge variant="outline" className="text-xs mt-2">
                    {cc.usageAccountIds.length} account{cc.usageAccountIds.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-destructive hover:text-destructive"
                  onClick={() => onRemoveCostCenter(cc.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
