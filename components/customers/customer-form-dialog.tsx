"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Customer } from "@/lib/types"

interface CustomerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer?: Customer | null
  onSave: (data: { legalName: string; vatNumber: string; contactName: string; contactEmail: string }) => void
}

export function CustomerFormDialog({ open, onOpenChange, customer, onSave }: CustomerFormDialogProps) {
  const [legalName, setLegalName] = useState("")
  const [vatNumber, setVatNumber] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = !!customer

  useEffect(() => {
    if (customer) {
      setLegalName(customer.legalName)
      setVatNumber(customer.vatNumber)
      setContactName(customer.contactName)
      setContactEmail(customer.contactEmail || "")
    } else {
      setLegalName("")
      setVatNumber("")
      setContactName("")
      setContactEmail("")
    }
    setErrors({})
  }, [customer, open])

  function validate() {
    const newErrors: Record<string, string> = {}
    if (!legalName.trim()) newErrors.legalName = "Legal name is required"
    if (!vatNumber.trim()) newErrors.vatNumber = "VAT number is required"
    if (!contactName.trim()) newErrors.contactName = "Contact name is required"
    if (!contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      newErrors.contactEmail = "Enter a valid email address"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSave({
      legalName: legalName.trim(),
      vatNumber: vatNumber.trim(),
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Customer" : "Register Customer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="legalName">Legal Name</Label>
            <Input
              id="legalName"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="e.g. Acme Corporation GmbH"
            />
            {errors.legalName && <p className="text-xs text-destructive">{errors.legalName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="vatNumber">VAT Number</Label>
            <Input
              id="vatNumber"
              value={vatNumber}
              onChange={(e) => setVatNumber(e.target.value)}
              placeholder="e.g. DE123456789"
            />
            {errors.vatNumber && <p className="text-xs text-destructive">{errors.vatNumber}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Hans Mueller"
            />
            {errors.contactName && <p className="text-xs text-destructive">{errors.contactName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="e.g. hans.mueller@acme-corp.de"
            />
            {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail}</p>}
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save Changes" : "Register"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
