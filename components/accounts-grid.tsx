"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Edit, Plus, Check, X, Archive, Info, Loader2 } from "lucide-react"
import { RegisterPayerDialog } from "@/components/register-payer-dialog"
import { EditPayerDialog } from "@/components/edit-payer-dialog"
import { RegisterUsageDialog } from "@/components/register-usage-dialog"
import { EditUsageDialog } from "@/components/edit-usage-dialog"
import { UsageDetailsDialog } from "@/components/usage-details-dialog"
import type { PayerAccount, UsageAccount } from "@/lib/types"
import { accountsApi } from "@/lib/api"

export function AccountsGrid() {
  const [payerAccounts, setPayerAccounts] = useState<PayerAccount[]>([])
  const [usageAccounts, setUsageAccounts] = useState<UsageAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [payerDialogOpen, setPayerDialogOpen] = useState(false)
  const [editPayerDialogOpen, setEditPayerDialogOpen] = useState(false)
  const [selectedPayerAccount, setSelectedPayerAccount] = useState<PayerAccount | null>(null)
  const [usageDialogOpen, setUsageDialogOpen] = useState(false)
  const [selectedPayerForUsage, setSelectedPayerForUsage] = useState<PayerAccount | null>(null)
  const [editUsageDialogOpen, setEditUsageDialogOpen] = useState(false)
  const [selectedUsageAccount, setSelectedUsageAccount] = useState<UsageAccount | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<UsageAccount | null>(null)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [payerResponse, usageResponse] = await Promise.all([
        accountsApi.getPayerAccounts(),
        accountsApi.getUsageAccounts()
      ])
      
      setPayerAccounts(payerResponse.data)
      setUsageAccounts(usageResponse.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  const openDetailsDialog = (account: UsageAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedAccount(account)
    setDetailsDialogOpen(true)
  }

  const openEditPayerDialog = (account: PayerAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedPayerAccount(account)
    setEditPayerDialogOpen(true)
  }

  const handleArchiveAccount = async (account: PayerAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await accountsApi.archivePayerAccount(account.id)
      await loadAccounts() // Reload data
    } catch (err) {
      console.error('Failed to archive account:', err)
    }
  }

  const openRegisterUsageDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedPayerForUsage(payerAccounts[0])
    setUsageDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error loading accounts: {error}</p>
        <Button onClick={loadAccounts}>Retry</Button>
      </div>
    )
  }

  const openEditUsageDialog = (account: UsageAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedUsageAccount(account)
    setEditUsageDialogOpen(true)
  }

  return (
    <>
      <div className="space-y-8">
        {/* Payer Accounts Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#00243E]">Payer Accounts</h2>
            <Button
              onClick={() => setPayerDialogOpen(true)}
              size="sm"
              className="gap-2 bg-[#00243E] hover:bg-[#00243E]/90"
            >
              <Plus className="h-4 w-4" />
              Register Payer
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {payerAccounts.map((account) => (
              <Card key={account.id} className="border-[#00243E] transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00243E]/10">
                      <Building2 className="h-4 w-4 text-[#00243E]" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-semibold text-[#00243E]">
                          {account.accountName} ({account.accountId})
                        </CardTitle>
                        {account.status === "Archived" && (
                          <Badge className="bg-gray-500 text-white hover:bg-gray-500/90">Archived</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => openEditPayerDialog(account, e)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleArchiveAccount(account, e)}
                      title="Archive"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Distributor</p>
                      <p className="text-sm font-medium text-foreground">{account.distributorName}</p>
                    </div>
                    {account.lastTransactionDate && (
                      <div>
                        <p className="text-xs text-muted-foreground">Last Transaction</p>
                        <p className="text-sm font-medium text-foreground">{account.lastTransactionDate}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Usage Accounts Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#00243E]">Usage Accounts</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {usageAccounts.map((account) => (
              <Card
                key={account.id}
                className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md"
                onClick={() => openDetailsDialog(account)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-semibold leading-tight text-[#00243E]">
                          {account.customer} ({account.id})
                        </CardTitle>
                        {account.status === "Registered" && (
                          <Badge className="bg-[#026172] text-white hover:bg-[#026172]/90">Registered</Badge>
                        )}
                        {account.status === "Unregistered" && (
                          <Badge className="bg-[#EC9400] text-white hover:bg-[#EC9400]/90">Unregistered</Badge>
                        )}
                        {account.status === "Archived" && (
                          <Badge className="bg-gray-500 text-white hover:bg-gray-500/90">Archived</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 border-b border-border pb-3">
                    {account.distributorName && (
                      <div>
                        <p className="text-xs text-muted-foreground">Distributor</p>
                        <p className="text-sm font-medium text-foreground">{account.distributorName}</p>
                      </div>
                    )}
                    {account.lastTransactionDate && (
                      <div>
                        <p className="text-xs text-muted-foreground">Last Transaction</p>
                        <p className="text-sm font-medium text-foreground">{account.lastTransactionDate}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Funds Utilization</span>
                      <span className="font-semibold text-foreground">{account.fundsUtilization}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[#026172]"
                        style={{ width: `${account.fundsUtilization}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      €{(account.totalUsage / 1000).toFixed(1)}k of €{(account.totalDeposit / 1000).toFixed(1)}k used
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Customer Discount</p>
                      <p className="text-xs font-medium text-[#026172]">{account.customerDiscount}%</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {account.rebateCredits ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#026172]/10">
                          <Check className="h-4 w-4 text-[#026172]" />
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-500/10">
                          <X className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">Rebate</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {account.status === "Unregistered" ? (
                      <Button
                        onClick={(e) => openRegisterUsageDialog(e)}
                        size="sm"
                        className="flex-1 gap-2 bg-[#00243E] hover:bg-[#00243E]/90"
                      >
                        <Plus className="h-4 w-4" />
                        Register
                      </Button>
                    ) : account.status === "Registered" ? (
                      <>
                        <Button
                          onClick={(e) => openEditUsageDialog(account, e)}
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-2 border-[#00243E] text-[#00243E] hover:bg-[#00243E]/10"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          onClick={(e) => openDetailsDialog(account, e)}
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-2 border-[#00243E] text-[#00243E] hover:bg-[#00243E]/10"
                        >
                          <Info className="h-4 w-4" />
                          Details
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={(e) => openDetailsDialog(account, e)}
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2 border-gray-500 text-gray-600 hover:bg-gray-500/10"
                      >
                        <Info className="h-4 w-4" />
                        Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <RegisterPayerDialog 
        open={payerDialogOpen} 
        onOpenChange={setPayerDialogOpen}
        onSuccess={loadAccounts}
      />
      <EditPayerDialog
        open={editPayerDialogOpen}
        onOpenChange={setEditPayerDialogOpen}
        account={selectedPayerAccount}
        onSuccess={loadAccounts}
      />
      <RegisterUsageDialog
        open={usageDialogOpen}
        onOpenChange={setUsageDialogOpen}
        payerAccount={selectedPayerForUsage}
        onSuccess={loadAccounts}
      />
      <EditUsageDialog
        open={editUsageDialogOpen}
        onOpenChange={setEditUsageDialogOpen}
        account={selectedUsageAccount}
        onSuccess={loadAccounts}
      />
      {selectedAccount && (
        <UsageDetailsDialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} account={selectedAccount} />
      )}
    </>
  )
}
