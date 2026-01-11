"use client"

import type React from "react"
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
import type { PayerAccount } from "@/lib/types"

interface EditPayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: PayerAccount | null
}

export function EditPayerDialog({ open, onOpenChange, account }: EditPayerDialogProps) {
  if (!account) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-[#00243E]">Edit Payer Account</DialogTitle>
          <DialogDescription>Update payer account information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-account-id">Account ID</Label>
              <Input id="edit-account-id" value={account.accountId} disabled className="bg-muted" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-account-name">Account Name</Label>
              <Input id="edit-account-name" value={account.accountName} disabled className="bg-muted" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-distributor-name">
                Distributor Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-distributor-name"
                defaultValue={account.distributorName}
                placeholder="AWS Distributor Inc."
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-legal-entity">
                Legal Entity Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-legal-entity"
                defaultValue={account.legalEntityName}
                placeholder="MSP/Partner legal entity name"
                required
              />
              <p className="text-xs text-muted-foreground">
                Legal entity name of the MSP/Partner managing this payer account
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-vat-number">
                VAT Number <span className="text-red-500">*</span>
              </Label>
              <Input id="edit-vat-number" defaultValue={account.vatNumber} placeholder="DE123456789" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-role-arn">
                Cross-Account Role ARN <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="edit-role-arn"
                defaultValue={account.crossAccountRoleArn}
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
