"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface RegisterPayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RegisterPayerDialog({ open, onOpenChange }: RegisterPayerDialogProps) {
  const [accountId, setAccountId] = useState("")
  const [accountIdError, setAccountIdError] = useState("")

  const validateAccountId = (value: string) => {
    if (value.length !== 12 || !/^\d{12}$/.test(value)) {
      setAccountIdError("Account ID must be exactly 12 digits")
      return false
    }
    setAccountIdError("")
    return true
  }

  const handleAccountIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 12)
    setAccountId(value)
    if (value.length === 12) {
      validateAccountId(value)
    } else if (value.length > 0) {
      setAccountIdError("Account ID must be exactly 12 digits")
    } else {
      setAccountIdError("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAccountId(accountId)) {
      return
    }
    // Handle form submission
    onOpenChange(false)
    // Reset form
    setAccountId("")
    setAccountIdError("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-[#00243E]">Register Payer Account</DialogTitle>
          <DialogDescription>Add a new payer account to manage billing and costs</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="account-id">
                Account ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="account-id"
                placeholder="123456789012"
                value={accountId}
                onChange={handleAccountIdChange}
                maxLength={12}
                required
                className={accountIdError ? "border-red-500" : ""}
              />
              {accountIdError && <p className="text-xs text-red-500">{accountIdError}</p>}
              <p className="text-xs text-muted-foreground">Must be exactly 12 digits</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="account-name">
                Account Name <span className="text-red-500">*</span>
              </Label>
              <Input id="account-name" placeholder="Production Payer Account" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="distributor-name">
                Distributor Name <span className="text-red-500">*</span>
              </Label>
              <Input id="distributor-name" placeholder="AWS Distributor Inc." required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="legal-entity">
                Legal Entity Name <span className="text-red-500">*</span>
              </Label>
              <Input id="legal-entity" placeholder="MSP/Partner legal entity name" required />
              <p className="text-xs text-muted-foreground">
                Legal entity name of the MSP/Partner managing this payer account
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vat-number">
                VAT Number <span className="text-red-500">*</span>
              </Label>
              <Input id="vat-number" placeholder="DE123456789" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role-arn">
                Cross-Account Role ARN <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="role-arn"
                placeholder="arn:aws:iam::123456789012:role/BillingDataAccessRole"
                rows={3}
                required
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Required for parquet file processing from your AWS account
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#00243E] hover:bg-[#00243E]/90">
              Register Payer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
