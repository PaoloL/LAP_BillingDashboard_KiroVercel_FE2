"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Edit,
  Plus,
  Archive,
  ArchiveRestore,
  Trash2,
  Eye,
  Search,
  PiggyBank,
  Tag,
  FileEdit,
} from "lucide-react"
import { RegisterPayerDialog } from "@/components/accounts/register-payer-dialog"
import { EditPayerDialog } from "@/components/accounts/edit-payer-dialog"
import { RegisterUsageDialog } from "@/components/accounts/register-usage-dialog"
import { EditUsageDialog } from "@/components/accounts/edit-usage-dialog"
import { UsageDetailsDialog } from "@/components/accounts/usage-details-dialog"
import type { PayerAccount, UsageAccount } from "@/lib/types"
import { dataService } from "@/lib/data/data-service"
import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

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

      console.log("Usage accounts loaded:", usage)
      console.log("Sample account:", usage[0])

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
    // Create payer account object from usage account's payer info
    const payerAccount = account.payerAccountId ? {
      id: account.payerAccountId,
      accountId: account.payerAccountId,
      accountName: account.payerAccountName || `Payer ${account.payerAccountId}`,
    } : null
    setSelectedPayerForUsage(payerAccount as any)
    setSelectedUsageAccount(account)
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

  const handleDiscoverUsageAccounts = async () => {
    try {
      setRefreshingUsage(true)

      // Call discovery API
      const result = await dataService.discoverUsageAccounts()

      console.log("Discovery completed:", result)

      // Refresh the accounts list to show newly discovered accounts
      await loadAccounts()

      // Show success message
      if (result.summary.accountsCreated > 0) {
        console.log(`Discovered ${result.summary.accountsCreated} new accounts`)
      } else {
        console.log("No new accounts discovered")
      }
    } catch (error) {
      console.error("Failed to discover usage accounts:", error)
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
              <Card
                key={account.id}
                className="relative overflow-hidden border-[#00243E] transition-all hover:shadow-md"
              >
                {account.status === "Archived" && (
                  <div className="absolute right-0 top-0 z-10">
                    <div className="relative h-16 w-16 overflow-hidden">
                      <div className="absolute -right-8 top-4 w-32 rotate-45 bg-gray-500 py-1 text-center text-xs font-semibold text-white shadow-md">
                        Archived
                      </div>
                    </div>
                  </div>
                )}
                {/* </CHANGE> */}
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-start gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00243E]/10 mt-0.5">
                      <Building2 className="h-4 w-4 text-[#00243E]" />
                    </div>
                    <div className="flex flex-col min-h-[3rem]">
                      <CardTitle className="text-base font-semibold text-[#00243E] line-clamp-2 leading-tight">{account.accountName}</CardTitle>
                      <span className="text-xs text-muted-foreground">({account.accountId})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
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
                  <div className="flex gap-1 border-t border-border pt-3">
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
                  {/* </CHANGE> */}
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
              onClick={handleDiscoverUsageAccounts}
              disabled={refreshingUsage}
              size="sm"
              className="gap-2 bg-[#026172] hover:bg-[#026172]/90"
            >
              <Search className={`h-4 w-4 ${refreshingUsage ? "animate-spin" : ""}`} />
              Discover
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {usageAccounts.map((account) => (
              <Card key={account.id} className="relative overflow-hidden transition-all hover:shadow-md">
                {account.status === "Registered" && (
                  <div className="absolute right-0 top-0 z-10">
                    <div className="relative h-16 w-16 overflow-hidden">
                      <div className="absolute -right-8 top-4 w-32 rotate-45 bg-[#026172] py-1 text-center text-xs font-semibold text-white shadow-md">
                        Registered
                      </div>
                    </div>
                  </div>
                )}
                {account.status === "Unregistered" && (
                  <div className="absolute right-0 top-0 z-10">
                    <div className="relative h-16 w-16 overflow-hidden">
                      <div className="absolute -right-8 top-4 w-32 rotate-45 bg-[#EC9400] py-1 text-center text-xs font-semibold text-white shadow-md">
                        Unregistered
                      </div>
                    </div>
                  </div>
                )}
                {account.status === "Archived" && (
                  <div className="absolute right-0 top-0 z-10">
                    <div className="relative h-16 w-16 overflow-hidden">
                      <div className="absolute -right-8 top-4 w-32 rotate-45 bg-gray-500 py-1 text-center text-xs font-semibold text-white shadow-md">
                        Archived
                      </div>
                    </div>
                  </div>
                )}
                {/* </CHANGE> */}
                <CardHeader className="pb-3">
                  <div className="min-h-[3.5rem]">
                    <div className="text-lg font-semibold leading-tight text-[#00243E] line-clamp-2">{account.customer}</div>
                    <div className="text-sm text-muted-foreground">({account.id})</div>
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

                  <div className="space-y-2 border-b border-border pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Customer Discount</p>
                        <p className="text-sm font-semibold text-[#026172]">{account.customerDiscount}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Reseller Discount</p>
                        <p className="text-sm font-semibold text-[#026172]">{account.resellerDiscount}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3">
                    {account.status === "Registered" && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-[#00243E]">Rebate Configuration</p>

                        <div className="space-y-1.5">
                          {/* Savings Plans / RI */}
                          <div className="flex flex-wrap items-center gap-1">
                            <PiggyBank className="h-3 w-3 text-[#026172]" />
                            <span className="text-[10px] font-medium text-muted-foreground">SP/RI:</span>
                            {account.rebateConfig?.savingsPlansRI?.discountedUsage && (
                              <Badge
                                variant="outline"
                                className="h-4 border-[#026172] bg-[#026172]/10 text-[9px] text-[#026172] px-1.5 py-0"
                              >
                                Discounted Usage
                              </Badge>
                            )}
                            {account.rebateConfig?.savingsPlansRI?.savingsPlanNegation && (
                              <Badge
                                variant="outline"
                                className="h-4 border-[#026172] bg-[#026172]/10 text-[9px] text-[#026172] px-1.5 py-0"
                              >
                                SP Negation
                              </Badge>
                            )}
                            {!account.rebateConfig?.savingsPlansRI?.discountedUsage &&
                              !account.rebateConfig?.savingsPlansRI?.savingsPlanNegation && (
                                <span className="text-[10px] text-gray-400">None</span>
                              )}
                          </div>

                          {/* Discount */}
                          <div className="flex flex-wrap items-center gap-1">
                            <Tag className="h-3 w-3 text-[#00243E]" />
                            <span className="text-[10px] font-medium text-muted-foreground">Discount:</span>
                            {account.rebateConfig?.discount?.discount && (
                              <Badge
                                variant="outline"
                                className="h-4 border-[#00243E] bg-[#00243E]/10 text-[9px] text-[#00243E] px-1.5 py-0"
                              >
                                Discount
                              </Badge>
                            )}
                            {account.rebateConfig?.discount?.bundledDiscount && (
                              <Badge
                                variant="outline"
                                className="h-4 border-[#00243E] bg-[#00243E]/10 text-[9px] text-[#00243E] px-1.5 py-0"
                              >
                                Bundled
                              </Badge>
                            )}
                            {account.rebateConfig?.discount?.credit && (
                              <Badge
                                variant="outline"
                                className="h-4 border-[#00243E] bg-[#00243E]/10 text-[9px] text-[#00243E] px-1.5 py-0"
                              >
                                Credit
                              </Badge>
                            )}
                            {account.rebateConfig?.discount?.privateRateDiscount && (
                              <Badge
                                variant="outline"
                                className="h-4 border-[#00243E] bg-[#00243E]/10 text-[9px] text-[#00243E] px-1.5 py-0"
                              >
                                Private Rate
                              </Badge>
                            )}
                            {!account.rebateConfig?.discount?.discount &&
                              !account.rebateConfig?.discount?.bundledDiscount &&
                              !account.rebateConfig?.discount?.credit &&
                              !account.rebateConfig?.discount?.privateRateDiscount && (
                                <span className="text-[10px] text-gray-400">None</span>
                              )}
                          </div>

                          {/* Adjustment */}
                          <div className="flex flex-wrap items-center gap-1">
                            <FileEdit className="h-3 w-3 text-[#F26522]" />
                            <span className="text-[10px] font-medium text-muted-foreground">Adjustment:</span>
                            {account.rebateConfig?.adjustment?.credit && (
                              <Badge
                                variant="outline"
                                className="h-4 border-[#F26522] bg-[#F26522]/10 text-[9px] text-[#F26522] px-1.5 py-0"
                              >
                                Credit
                              </Badge>
                            )}
                            {account.rebateConfig?.adjustment?.refund && (
                              <Badge
                                variant="outline"
                                className="h-4 border-[#F26522] bg-[#F26522]/10 text-[9px] text-[#F26522] px-1.5 py-0"
                              >
                                Refund
                              </Badge>
                            )}
                            {!account.rebateConfig?.adjustment?.credit && !account.rebateConfig?.adjustment?.refund && (
                              <span className="text-[10px] text-gray-400">None</span>
                            )}
                          </div>
                        </div>
                        {/* </CHANGE> */}
                      </div>
                    )}
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
        accountId={selectedUsageAccount?.accountId}
        accountName={selectedUsageAccount?.customer}
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
