"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react"
import { dataService } from "@/lib/data/data-service"
import type { ExchangeRateConfig } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface ExchangeRateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payerAccountId: string
  payerAccountName: string
}

export function ExchangeRateDialog({ open, onOpenChange, payerAccountId, payerAccountName }: ExchangeRateDialogProps) {
  const [billingPeriod, setBillingPeriod] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })
  const [exchangeRate, setExchangeRate] = useState("")
  const [existingConfig, setExistingConfig] = useState<ExchangeRateConfig | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && payerAccountId) {
      loadExchangeRate()
    }
  }, [open, payerAccountId, billingPeriod])

  const loadExchangeRate = async () => {
    try {
      const configs = await dataService.getExchangeRates({ payerAccountId, billingPeriod })
      if (configs.length > 0) {
        setExistingConfig(configs[0])
        setExchangeRate(configs[0].exchangeRate.toString())
      } else {
        setExistingConfig(null)
        setExchangeRate("")
      }
    } catch (error) {
      console.error("Failed to load exchange rate:", error)
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const [year, month] = billingPeriod.split("-").map(Number)
    const date = new Date(year, month - 1)
    date.setMonth(date.getMonth() + (direction === "prev" ? -1 : 1))
    setBillingPeriod(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`)
  }

  const handleSave = async () => {
    if (!exchangeRate || isNaN(Number(exchangeRate))) {
      toast({ title: "Error", description: "Please enter a valid exchange rate", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      if (existingConfig) {
        await dataService.updateExchangeRate(existingConfig.id, { exchangeRate: Number(exchangeRate) })
        toast({ title: "Success", description: "Exchange rate updated" })
      } else {
        await dataService.createExchangeRate({ payerAccountId, billingPeriod, exchangeRate: Number(exchangeRate) })
        toast({ title: "Success", description: "Exchange rate created" })
      }
      await loadExchangeRate()
    } catch (error) {
      toast({ title: "Error", description: "Failed to save exchange rate", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!existingConfig) return
    setLoading(true)
    try {
      await dataService.deleteExchangeRate(existingConfig.id)
      toast({ title: "Success", description: "Exchange rate deleted" })
      setExistingConfig(null)
      setExchangeRate("")
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete exchange rate", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exchange Rate - {payerAccountName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Billing Period</Label>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input value={billingPeriod} readOnly className="text-center" />
              <Button variant="outline" size="icon" onClick={() => navigateMonth("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="exchangeRate">Exchange Rate (USD to EUR)</Label>
            <Input
              id="exchangeRate"
              type="number"
              step="0.0001"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              placeholder="e.g., 0.92"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading} className="flex-1">
              {existingConfig ? <Pencil className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              {existingConfig ? "Update" : "Create"}
            </Button>
            {existingConfig && (
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
