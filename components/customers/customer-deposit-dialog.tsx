"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Customer } from "@/lib/types"
import { formatCurrency } from "@/lib/format"
import { Layers, Banknote } from "lucide-react"

interface CustomerDepositDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onDeposit: (deposit: { costCenterId: string; amountEur: number; description: string; poNumber: string }) => void
}

export function CustomerDepositDialog({ open, onOpenChange, customer, onDeposit }: CustomerDepositDialogProps) {
  const [costCenterId, setCostCenterId] = useState("")
  const [amountEur, setAmountEur] = useState("")
  const [description, setDescription] = useState("")
  const [poNumber, setPoNumber] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setCostCenterId("")
    setAmountEur("")
    setDescription("")
    setPoNumber("")
    setErrors({})
  }, [customer, open])

  if (!customer) return null

  const costCenters = customer.costCenters
  const selectedCC = costCenters.find((cc) => cc.id === costCenterId)

  function validate() {
    const newErrors: Record<string, string> = {}
    if (!costCenterId) newErrors.costCenterId = "Select a cost center"
    const amount = parseFloat(amountEur)
    if (!amountEur || isNaN(amount) || amount <= 0) newErrors.amountEur = "Enter a valid positive amount"
    if (!description.trim()) newErrors.description = "Description is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onDeposit({
      costCenterId,
      amountEur: parseFloat(amountEur),
      description: description.trim(),
      poNumber: poNumber.trim(),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-secondary" />
            Make Deposit
          </DialogTitle>
          <DialogDescription>
            Deposit funds for <strong>{customer.legalName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Cost Center selection */}
          <div className="space-y-2">
            <Label>Cost Center</Label>
            {costCenters.length === 0 ? (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                No cost centers available. Create a cost center first from the customer details.
              </p>
            ) : (
              <Select value={costCenterId} onValueChange={setCostCenterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a cost center..." />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.map((cc) => (
                    <SelectItem key={cc.id} value={cc.id}>
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{cc.name}</span>
                        <Badge variant="outline" className="text-[10px] ml-1">
                          {cc.usageAccountIds.length} acct{cc.usageAccountIds.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.costCenterId && <p className="text-xs text-destructive">{errors.costCenterId}</p>}
          </div>

          {selectedCC && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground text-sm">{selectedCC.name}</p>
              {selectedCC.description && <p className="mt-0.5">{selectedCC.description}</p>}
              <p className="mt-1">{selectedCC.usageAccountIds.length} linked account{selectedCC.usageAccountIds.length !== 1 ? "s" : ""}</p>
            </div>
          )}

          <Separator />

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amountEur">Amount (EUR)</Label>
            <Input
              id="amountEur"
              type="number"
              step="0.01"
              min="0.01"
              value={amountEur}
              onChange={(e) => setAmountEur(e.target.value)}
              placeholder="e.g. 10000.00"
            />
            {amountEur && !isNaN(parseFloat(amountEur)) && parseFloat(amountEur) > 0 && (
              <p className="text-xs text-muted-foreground">
                Deposit: {formatCurrency(parseFloat(amountEur))}
              </p>
            )}
            {errors.amountEur && <p className="text-xs text-destructive">{errors.amountEur}</p>}
          </div>

          {/* PO Number (optional, per-deposit) */}
          <div className="space-y-2">
            <Label htmlFor="poNumber">PO Number <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              id="poNumber"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="e.g. PO-2025-001"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Q1 2025 Prepayment"
              rows={2}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={costCenters.length === 0}>Confirm Deposit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
