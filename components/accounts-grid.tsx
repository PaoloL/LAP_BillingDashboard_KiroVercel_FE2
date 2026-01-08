"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Edit, Plus, Check, X, Archive, ArchiveRestore, Trash2, Eye, RefreshCw } from "lucide-react"
import { RegisterPayerDialog } from "@/components/register-payer-dialog"
import { EditPayerDialog } from "@/components/edit-payer-dialog"
import { RegisterUsageDialog } from "@/components/register-usage-dialog"
import { EditUsageDialog } from "@/components/edit-usage-dialog"
import { UsageDetailsDialog } from "@/components/usage-details-dialog"
import type { PayerAccount, UsageAccount } from "@/lib/types"
import { dataService } from "@/lib/data/data-service"

export function AccountsGrid() {
  const [payerAccounts, setPayerAccounts] = useState<PayerAccount[]>([])
  const [usageAccounts, setUsageAccounts] = useState<UsageAccount[]>([])
  const [loading, setLoading] = useState(true)

  const [payerDialogOpen, setPayerDialogOpen] = useState(false)
  const [editPayerDialogOpen, setEditPayerDialogOpen] = useState(false)
  const [selectedPayerAccount, setSelectedPayerAccount] = useState<PayerAccount | null>(null)
  const [usageDialogOpen, setUsageDialogOpen] = useState(false)
  const [selectedPayerForUsage, setSelectedPayerForUsage] = useState<PayerAccount | null>(null)
  const [editUsageDialogOpen, setEditUsageDialogOpen] = useState(false)
  const [selectedUsageAccount, setSelectedUsageAccount] = useState<UsageAccount | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<UsageAccount | null>(null)
  const [refreshingUsage, setRefreshingUsage] = useState(false)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setLoading(true)

      const [payers, usage] = await Promise.all([dataService.getPayerAccounts(), dataService.getUsageAccounts()])

      setPayerAccounts(Array.isArray(payers) ? payers : [])
      setUsageAccounts(Array.isArray(usage) ? usage : [])
    } catch (error) {
      console.error("Failed to load accounts:", error)
      setPayerAccounts([])
      setUsageAccounts([])
    } finally {
      setLoading(false)
    }
  }

  const openEditPayerDialog = (account: PayerAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedPayerAccount(account)
    setEditPayerDialogOpen(true)
  }

  const handleArchivePayerAccount = async (account: PayerAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await dataService.archivePayerAccount(account.accountId)
      await loadAccounts() // Reload data
    } catch (error) {
      console.error("Failed to archive payer account:", error)
    }
  }

  const handleUnarchivePayerAccount = async (account: PayerAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await dataService.unarchivePayerAccount(account.accountId)
      await loadAccounts()
    } catch (error) {
      console.error("Failed to unarchive payer account:", error)
    }
  }

  const handleDeletePayerAccount = async (account: PayerAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await dataService.deletePayerAccount(account.accountId)
      await loadAccounts()
    } catch (error) {
      console.error("Failed to delete payer account:", error)
    }
  }

  const openDetailsDialog = (account: UsageAccount, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setSelectedAccount(account)
    setDetailsDialogOpen(true)
  }

  const openRegisterUsageDialog = (account: UsageAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    // Find the payer account for this usage account
    const payerAccount = payerAccounts.find((p) => p.id === account.id.split("-")[0])
    setSelectedPayerForUsage(payerAccount || null)
    setUsageDialogOpen(true)
  }

  const openEditUsageDialog = (account: UsageAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedUsageAccount(account)
    setEditUsageDialogOpen(true)
  }

  const handleArchiveUsageAccount = async (account: UsageAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await dataService.changeUsageAccountStatus(account.accountId, "Archived")
      await loadAccounts()
    } catch (error) {
      console.error("Failed to archive usage account:", error)
    }
  }

  const handleUnarchiveUsageAccount = async (account: UsageAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await dataService.changeUsageAccountStatus(account.accountId, "Registered")
      await loadAccounts()
    } catch (error) {
      console.error("Failed to unarchive usage account:", error)
    }
  }

  const handleDeleteUsageAccount = async (account: UsageAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await dataService.deleteUsageAccount(account.accountId)
      await loadAccounts()
    } catch (error) {
      console.error("Failed to delete usage account:", error)
    }
  }

  const handleRefreshUsageAccounts = async () => {
    try {
      setRefreshingUsage(true)
      const usage = await dataService.getUsageAccounts()
      setUsageAccounts(Array.isArray(usage) ? usage : [])
    } catch (error) {
      console.error("Failed to refresh usage accounts:", error)
    } finally {
      setRefreshingUsage(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading accounts...</p>
      </div>
    )
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
                    {account.status === "Registered" ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#00243E] hover:bg-[#00243E]/10 hover:text-[#00243E]"
                          onClick={(e) => openEditPayerDialog(account, e)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#EC9400] hover:bg-[#EC9400]/10 hover:text-[#EC9400]"
                          onClick={(e) => handleArchivePayerAccount(account, e)}
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#026172] hover:bg-[#026172]/10 hover:text-[#026172]"
                          onClick={(e) => handleUnarchivePayerAccount(account, e)}
                          title="Unarchive"
                        >
                          <ArchiveRestore className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={(e) => handleDeletePayerAccount(account, e)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#00243E]">Usage Accounts</h2>
            <Button
              onClick={handleRefreshUsageAccounts}
              disabled={refreshingUsage}
              size="sm"
              className="gap-2 bg-[#026172] hover:bg-[#026172]/90"
            >
              <RefreshCw className={`h-4 w-4 ${refreshingUsage ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {usageAccounts.map((account) => (
              <Card key={account.id} className="transition-all hover:shadow-md">
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
                  <div className="flex gap-1 border-t border-border pt-3">
                    {account.status === "Unregistered" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-[#026172] hover:bg-[#026172]/10 hover:text-[#026172]"
                        onClick={(e) => openRegisterUsageDialog(account, e)}
                        title="Register"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    ) : account.status === "Registered" ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-[#00243E] hover:bg-[#00243E]/10 hover:text-[#00243E]"
                          onClick={(e) => openEditUsageDialog(account, e)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-[#00243E] hover:bg-[#00243E]/10 hover:text-[#00243E]"
                          onClick={(e) => openDetailsDialog(account, e)}
                          title="Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-[#EC9400] hover:bg-[#EC9400]/10 hover:text-[#EC9400]"
                          onClick={(e) => handleArchiveUsageAccount(account, e)}
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-[#026172] hover:bg-[#026172]/10 hover:text-[#026172]"
                          onClick={(e) => handleUnarchiveUsageAccount(account, e)}
                          title="Unarchive"
                        >
                          <ArchiveRestore className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={(e) => handleDeleteUsageAccount(account, e)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <RegisterPayerDialog open={payerDialogOpen} onOpenChange={setPayerDialogOpen} onSuccess={loadAccounts} />
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
