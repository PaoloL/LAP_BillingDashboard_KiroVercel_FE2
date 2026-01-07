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
import { accountsApi } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface RegisterPayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RegisterPayerDialog({ open, onOpenChange, onSuccess }: RegisterPayerDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    accountId: "",
    accountName: "",
    distributorName: "",
    legalEntityName: "",
    vatNumber: "",
    crossAccountRoleArn: "",
  })
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
    setFormData(prev => ({ ...prev, accountId: value }))
    if (value.length === 12) {
      validateAccountId(value)
    } else if (value.length > 0) {
      setAccountIdError("Account ID must be exactly 12 digits")
    } else {
      setAccountIdError("")
    }
  }

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAccountId(formData.accountId)) {
      return
    }

    try {
      setLoading(true)
      setError("")
      
      await accountsApi.createPayerAccount(formData)
      
      onSuccess?.()
      onOpenChange(false)
      
      // Reset form
      setFormData({
        accountId: "",
        accountName: "",
        distributorName: "",
        legalEntityName: "",
        vatNumber: "",
        crossAccountRoleArn: "",
      })
      setAccountIdError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payer account')
    } finally {
      setLoading(false)
    }
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
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="account-id">
                Account ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="account-id"
                placeholder="123456789012"
                value={formData.accountId}
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
              <Input 
                id="account-name" 
                placeholder="Production Payer Account" 
                value={formData.accountName}
                onChange={handleInputChange('accountName')}
                required 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="distributor-name">
                Distributor Name <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="distributor-name" 
                placeholder="AWS Distributor Inc." 
                value={formData.distributorName}
                onChange={handleInputChange('distributorName')}
                required 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="legal-entity">
                Legal Entity Name <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="legal-entity" 
                placeholder="MSP/Partner legal entity name" 
                value={formData.legalEntityName}
                onChange={handleInputChange('legalEntityName')}
                required 
              />
              <p className="text-xs text-muted-foreground">
                Legal entity name of the MSP/Partner managing this payer account
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vat-number">
                VAT Number <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="vat-number" 
                placeholder="DE123456789" 
                value={formData.vatNumber}
                onChange={handleInputChange('vatNumber')}
                required 
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role-arn">
                Cross-Account Role ARN <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="role-arn"
                placeholder="arn:aws:iam::123456789012:role/BillingDataAccessRole"
                rows={3}
                value={formData.crossAccountRoleArn}
                onChange={handleInputChange('crossAccountRoleArn')}
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
            <Button type="submit" className="bg-[#00243E] hover:bg-[#00243E]/90" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register Payer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
