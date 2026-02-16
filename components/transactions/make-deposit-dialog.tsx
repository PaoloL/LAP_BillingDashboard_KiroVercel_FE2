"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { dataService } from "@/lib/data/data-service"
import { useAuth } from "@/lib/auth/auth-context"

interface Customer {
  id: string
  legalName: string
  vatNumber: string
  costCenters?: CostCenter[]
}

interface CostCenter {
  id: string
  name: string
}

interface MakeDepositDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function MakeDepositDialog({ open, onOpenChange, onSuccess }: MakeDepositDialogProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedCostCenter, setSelectedCostCenter] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [poNumber, setPoNumber] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      loadCustomers()
    }
  }, [open])

  async function loadCustomers() {
    try {
      const data = await dataService.getCustomers()
      setCustomers(data)
    } catch (err) {
      console.error("Failed to load customers:", err)
      setError("Failed to load customers")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!selectedCustomer || !selectedCostCenter || !amount || !description) {
      setError("Please fill in all required fields")
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Amount must be a positive number")
      return
    }

    try {
      setLoading(true)
      
      await dataService.createDeposit(selectedCustomer.vatNumber, {
        costCenterId: selectedCostCenter,
        amountEur: amountNum,
        description: description.trim(),
        poNumber: poNumber.trim(),
        createdBy: user?.email || user?.sub || 'system'
      })

      onSuccess()
      onOpenChange(false)
      resetForm()
    } catch (err) {
      console.error("Failed to create deposit:", err)
      setError(err instanceof Error ? err.message : "Failed to create deposit")
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setSelectedCustomer(null)
    setSelectedCostCenter("")
    setAmount("")
    setDescription("")
    setPoNumber("")
    setError("")
  }

  function handleCustomerChange(customerId: string) {
    const customer = customers.find(c => c.id === customerId)
    setSelectedCustomer(customer || null)
    setSelectedCostCenter("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Make Deposit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="customer">Customer *</Label>
            <Select
              value={selectedCustomer?.id || ""}
              onValueChange={handleCustomerChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.legalName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="costCenter">Cost Center *</Label>
            <Select
              value={selectedCostCenter}
              onValueChange={setSelectedCostCenter}
              disabled={loading || !selectedCustomer}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cost center" />
              </SelectTrigger>
              <SelectContent>
                {selectedCustomer?.costCenters?.map((cc) => (
                  <SelectItem key={cc.id} value={cc.id}>
                    {cc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Deposit Amount (EUR) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter deposit description"
              disabled={loading}
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="poNumber">PO Number</Label>
            <Input
              id="poNumber"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="Optional"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Deposit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
