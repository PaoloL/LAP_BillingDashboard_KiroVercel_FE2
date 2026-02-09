"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Customer } from "@/lib/types"

interface CustomerInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onSave: (data: { legalName: string; contactName: string; contactEmail: string }) => void
}

export function CustomerInfoDialog({ open, onOpenChange, customer, onSave }: CustomerInfoDialogProps) {
  const [legalName, setLegalName] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")

  useEffect(() => {
    if (customer) {
      setLegalName(customer.legalName)
      setContactName(customer.contactName)
      setContactEmail(customer.contactEmail)
    }
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Customer Information</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Legal Name</Label>
            <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>VAT Number</Label>
            <Input value={customer.vatNumber} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">VAT number cannot be changed</p>
          </div>
          <div className="space-y-2">
            <Label>Contact Name</Label>
            <Input value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
