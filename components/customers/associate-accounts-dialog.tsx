"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { UsageAccount, CostCenter } from "@/lib/types"

interface AssociateAccountsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  costCenter: CostCenter | null
  usageAccounts: UsageAccount[]
  allAssignedAccountIds: string[]
  onSave: (costCenterId: string, accountIds: string[]) => void
}

export function AssociateAccountsDialog({
  open,
  onOpenChange,
  costCenter,
  usageAccounts,
  allAssignedAccountIds,
  onSave,
}: AssociateAccountsDialogProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (costCenter) {
      setSelected([...costCenter.usageAccountIds])
    } else {
      setSelected([])
    }
    setSearch("")
  }, [costCenter, open])

  const filtered = usageAccounts.filter((a) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return a.name.toLowerCase().includes(q) || a.accountId.includes(q)
  })

  function toggle(accountId: string) {
    setSelected((prev) => (prev.includes(accountId) ? prev.filter((id) => id !== accountId) : [...prev, accountId]))
  }

  function isAssignedElsewhere(accountId: string) {
    return allAssignedAccountIds.includes(accountId) && !costCenter?.usageAccountIds.includes(accountId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Manage Accounts - {costCenter?.name}</DialogTitle>
          <DialogDescription>
            Select the usage accounts to associate with this cost center.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search accounts..."
            className="pl-9"
          />
        </div>

        <ScrollArea className="max-h-[320px] pr-2">
          <div className="space-y-1">
            {filtered.map((account) => {
              const assignedElsewhere = isAssignedElsewhere(account.accountId)
              const checked = selected.includes(account.accountId)
              return (
                <label
                  key={account.accountId}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors cursor-pointer ${
                    checked ? "border-primary/40 bg-primary/5" : "border-border hover:bg-muted/50"
                  } ${assignedElsewhere ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Checkbox
                    checked={checked}
                    disabled={assignedElsewhere}
                    onCheckedChange={() => toggle(account.accountId)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{account.name}</p>
                    <p className="text-xs font-mono text-muted-foreground">{account.accountId}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px]">{account.status}</Badge>
                    {assignedElsewhere && (
                      <Badge variant="secondary" className="text-[10px]">Other CC</Badge>
                    )}
                  </div>
                </label>
              )
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No accounts found</p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { if (costCenter) { onSave(costCenter.id, selected); onOpenChange(false) } }}>
            Save ({selected.length} selected)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
