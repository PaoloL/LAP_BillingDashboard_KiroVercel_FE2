"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, RefreshCw, Trash2, Edit } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { dataService } from "@/lib/data/data-service"
import type { PayerAccount } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

interface ExchangeRateConfig {
  id: string
  payerAccountId: string
  payerAccountName: string
  billingPeriod: string
  exchangeRate: number
  createdAt: string
  updatedAt: string
}

export function ExchangeRateSettings() {
  const [payerAccounts, setPayerAccounts] = useState<PayerAccount[]>([])
  const [selectedPayerId, setSelectedPayerId] = useState("")
  const [billingPeriod, setBillingPeriod] = useState("")
  const [exchangeRate, setExchangeRate] = useState("")
  const [configurations, setConfigurations] = useState<ExchangeRateConfig[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isPayerOpen, setIsPayerOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadPayerAccounts()
    loadConfigurations()
  }, [])

  const loadPayerAccounts = async () => {
    try {
      const accounts = await dataService.getPayerAccounts()
      setPayerAccounts(accounts.filter((a) => a.status === "Registered"))
    } catch (error) {
      console.error("Failed to load payer accounts:", error)
    }
  }

  const loadConfigurations = async () => {
    // Mock configurations - replace with API call
    setConfigurations([
      {
        id: "1",
        payerAccountId: "123456789012",
        payerAccountName: "AWS Main Account",
        billingPeriod: "2025-01",
        exchangeRate: 1.093,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ])
  }

  const handleSave = async () => {
    if (!selectedPayerId || !billingPeriod || !exchangeRate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const rate = Number.parseFloat(exchangeRate)
    if (isNaN(rate) || rate <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid exchange rate",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      const selectedPayer = payerAccounts.find((p) => p.accountId === selectedPayerId)

      if (editingId) {
        // Update existing configuration
        const updated = configurations.map((c) =>
          c.id === editingId
            ? {
                ...c,
                payerAccountId: selectedPayerId,
                payerAccountName: selectedPayer?.accountName || "",
                billingPeriod,
                exchangeRate: rate,
                updatedAt: new Date().toISOString(),
              }
            : c,
        )
        setConfigurations(updated)
        setEditingId(null)
        toast({
          title: "Configuration Updated",
          description: "Exchange rate configuration has been updated successfully",
        })
      } else {
        // Create new configuration
        const newConfig: ExchangeRateConfig = {
          id: Math.random().toString(36).substr(2, 9),
          payerAccountId: selectedPayerId,
          payerAccountName: selectedPayer?.accountName || "",
          billingPeriod,
          exchangeRate: rate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setConfigurations([...configurations, newConfig])
        toast({
          title: "Configuration Saved",
          description: "Exchange rate configuration has been saved successfully",
        })
      }

      // Reset form
      setSelectedPayerId("")
      setBillingPeriod("")
      setExchangeRate("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save exchange rate configuration",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (configId: string) => {
    try {
      setLoading(true)
      // Call API to update exchange rates for this configuration
      toast({
        title: "Updating Exchange Rates",
        description: "Recalculating transactions with new exchange rate...",
      })

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Exchange Rates Updated",
        description: "All transactions have been recalculated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update exchange rates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (config: ExchangeRateConfig) => {
    setEditingId(config.id)
    setSelectedPayerId(config.payerAccountId)
    setBillingPeriod(config.billingPeriod)
    setExchangeRate(config.exchangeRate.toString())
  }

  const handleDelete = (configId: string) => {
    setConfigurations(configurations.filter((c) => c.id !== configId))
    toast({
      title: "Configuration Deleted",
      description: "Exchange rate configuration has been deleted",
    })
  }

  const selectedPayer = payerAccounts.find((p) => p.accountId === selectedPayerId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#00243E]">Exchange Rate Configuration</CardTitle>
        <CardDescription>Configure exchange rates for different payer accounts and billing periods</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Form */}
        <div className="space-y-4 rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-[#00243E]">
            {editingId ? "Edit Configuration" : "Add New Configuration"}
          </h3>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Payer Account Selector */}
            <div className="space-y-2">
              <Label htmlFor="payerAccount">Payer Account</Label>
              <Popover open={isPayerOpen} onOpenChange={setIsPayerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-transparent"
                    disabled={loading}
                  >
                    {selectedPayer ? (
                      <span className="truncate">
                        {selectedPayer.accountName} ({selectedPayer.accountId})
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Select payer account...</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <div className="max-h-[300px] overflow-auto p-2">
                    {payerAccounts.map((account) => (
                      <button
                        key={account.accountId}
                        className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                        onClick={() => {
                          setSelectedPayerId(account.accountId)
                          setIsPayerOpen(false)
                        }}
                      >
                        <div className="font-medium">{account.accountName}</div>
                        <div className="text-xs text-muted-foreground">{account.accountId}</div>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Billing Period */}
            <div className="space-y-2">
              <Label htmlFor="billingPeriod">Billing Period</Label>
              <Input
                id="billingPeriod"
                type="month"
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value)}
                disabled={loading}
                placeholder="YYYY-MM"
              />
            </div>

            {/* Exchange Rate */}
            <div className="space-y-2">
              <Label htmlFor="exchangeRate">Exchange Rate (USD to EUR)</Label>
              <Input
                id="exchangeRate"
                type="number"
                step="0.001"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                disabled={loading}
                placeholder="1.093"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading} className="bg-[#00243E] hover:bg-[#00243E]/90">
              <Save className="mr-2 h-4 w-4" />
              {editingId ? "Update" : "Save"} Configuration
            </Button>
            {editingId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null)
                  setSelectedPayerId("")
                  setBillingPeriod("")
                  setExchangeRate("")
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Saved Configurations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#00243E]">Saved Configurations</h3>

          {configurations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">No exchange rate configurations yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Add a configuration above to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {configurations.map((config) => (
                <div key={config.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#00243E]">{config.payerAccountName}</span>
                      <span className="text-sm text-muted-foreground">({config.payerAccountId})</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Period: {config.billingPeriod}</span>
                      <span>Rate: {config.exchangeRate.toFixed(3)}</span>
                      <span>Updated: {new Date(config.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(config.id)}
                      disabled={loading}
                      className="bg-[#026172] hover:bg-[#026172]/90"
                    >
                      <RefreshCw className={`mr-2 h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                      Update
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(config)} disabled={loading}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(config.id)}
                      disabled={loading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
