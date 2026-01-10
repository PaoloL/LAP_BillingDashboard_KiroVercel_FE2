"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, RefreshCw, Trash2, Plus, Building2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { dataService } from "@/lib/data/data-service"
import type { PayerAccount, ExchangeRateConfig } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"

export function ExchangeRateSettings() {
  const [payerAccounts, setPayerAccounts] = useState<PayerAccount[]>([])
  const [selectedPayerId, setSelectedPayerId] = useState("")
  const [configurations, setConfigurations] = useState<ExchangeRateConfig[]>([])
  const [filteredConfigurations, setFilteredConfigurations] = useState<ExchangeRateConfig[]>([])
  const [isPayerOpen, setIsPayerOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [editingConfig, setEditingConfig] = useState<ExchangeRateConfig | null>(null)
  const [billingPeriod, setBillingPeriod] = useState("")
  const [exchangeRate, setExchangeRate] = useState("")

  const { toast } = useToast()

  useEffect(() => {
    loadPayerAccounts()
    loadConfigurations()
  }, [])

  useEffect(() => {
    if (selectedPayerId) {
      const filtered = configurations.filter((c) => c.payerAccountId === selectedPayerId)
      setFilteredConfigurations(filtered)
    } else {
      setFilteredConfigurations([])
    }
  }, [selectedPayerId, configurations])

  const loadPayerAccounts = async () => {
    try {
      const accounts = await dataService.getPayerAccounts()
      setPayerAccounts(accounts.filter((a) => a.status === "Registered"))
    } catch (error) {
      console.error("Failed to load payer accounts:", error)
    }
  }

  const loadConfigurations = async () => {
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
      {
        id: "2",
        payerAccountId: "123456789012",
        payerAccountName: "AWS Main Account",
        billingPeriod: "2024-12",
        exchangeRate: 1.085,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "3",
        payerAccountId: "987654321098",
        payerAccountName: "AWS Development",
        billingPeriod: "2025-01",
        exchangeRate: 1.09,
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

      if (editingConfig) {
        const updated = configurations.map((c) =>
          c.id === editingConfig.id
            ? {
                ...c,
                billingPeriod,
                exchangeRate: rate,
                updatedAt: new Date().toISOString(),
              }
            : c,
        )
        setConfigurations(updated)
        toast({
          title: "Exchange Rate Updated",
          description: `Exchange rate for ${billingPeriod} has been updated to ${rate.toFixed(3)}`,
        })
      } else {
        const exists = configurations.some(
          (c) => c.payerAccountId === selectedPayerId && c.billingPeriod === billingPeriod,
        )

        if (exists) {
          toast({
            title: "Configuration Exists",
            description: "An exchange rate for this billing period already exists. Please edit it instead.",
            variant: "destructive",
          })
          return
        }

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
          title: "Exchange Rate Added",
          description: `Exchange rate for ${billingPeriod} has been set to ${rate.toFixed(3)}`,
        })
      }

      // Reset form
      setShowForm(false)
      setEditingConfig(null)
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
      const config = configurations.find((c) => c.id === configId)

      toast({
        title: "Updating Exchange Rates",
        description: `Recalculating transactions for ${config?.billingPeriod}...`,
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
    setEditingConfig(config)
    setBillingPeriod(config.billingPeriod)
    setExchangeRate(config.exchangeRate.toString())
    setShowForm(true)
  }

  const handleDelete = (configId: string) => {
    setConfigurations(configurations.filter((c) => c.id !== configId))
    toast({
      title: "Exchange Rate Deleted",
      description: "Exchange rate configuration has been deleted",
    })
  }

  const handleAddNew = () => {
    setEditingConfig(null)
    setBillingPeriod("")
    setExchangeRate("")
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingConfig(null)
    setBillingPeriod("")
    setExchangeRate("")
  }

  const selectedPayer = payerAccounts.find((p) => p.accountId === selectedPayerId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#00243E]">Exchange Rate Configuration</CardTitle>
        <CardDescription>
          Select a payer account to view and manage exchange rates for different billing periods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="payerAccount" className="text-base font-semibold text-[#00243E]">
            Select Payer Account
          </Label>
          <Popover open={isPayerOpen} onOpenChange={setIsPayerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent h-12">
                <Building2 className="mr-2 h-4 w-4 text-[#00243E]" />
                {selectedPayer ? (
                  <span className="truncate">
                    <span className="font-semibold">{selectedPayer.accountName}</span>
                    <span className="ml-2 text-sm text-muted-foreground">({selectedPayer.accountId})</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">Select payer account...</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <div className="max-h-[300px] overflow-auto p-2">
                {payerAccounts.map((account) => (
                  <button
                    key={account.accountId}
                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      setSelectedPayerId(account.accountId)
                      setIsPayerOpen(false)
                      setShowForm(false)
                      setEditingConfig(null)
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

        {selectedPayerId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#00243E]">Exchange Rates by Billing Period</h3>
              {!showForm && (
                <Button onClick={handleAddNew} className="bg-[#026172] hover:bg-[#026172]/90" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Period
                </Button>
              )}
            </div>

            {showForm && (
              <div className="rounded-lg border border-[#026172] bg-[#026172]/5 p-4 space-y-4">
                <h4 className="font-semibold text-[#00243E]">
                  {editingConfig ? "Edit Exchange Rate" : "Add New Exchange Rate"}
                </h4>

                <div className="grid gap-4 sm:grid-cols-2">
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
                    {editingConfig ? "Update" : "Save"}
                  </Button>
                  <Button variant="outline" onClick={handleCancelForm} disabled={loading}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {filteredConfigurations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center">
                <p className="text-muted-foreground">No exchange rates configured yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Click "Add New Period" to configure an exchange rate
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConfigurations
                  .sort((a, b) => b.billingPeriod.localeCompare(a.billingPeriod))
                  .map((config) => (
                    <div
                      key={config.id}
                      className="flex items-center justify-between rounded-lg border border-border p-4 hover:border-[#026172]/50 transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-semibold text-[#00243E]">{config.billingPeriod}</span>
                          <span className="text-lg font-mono text-[#026172]">{config.exchangeRate.toFixed(3)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Last updated: {new Date(config.updatedAt).toLocaleDateString()} at{" "}
                          {new Date(config.updatedAt).toLocaleTimeString()}
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(config)}
                          disabled={loading || showForm}
                          className="hover:bg-[#00243E]/10"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(config.id)}
                          disabled={loading}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {!selectedPayerId && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg text-muted-foreground">Select a payer account to get started</p>
            <p className="mt-2 text-sm text-muted-foreground">
              You'll be able to view and manage exchange rates for different billing periods
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
