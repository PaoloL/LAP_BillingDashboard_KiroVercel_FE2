"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Eye,
  Archive,
  RotateCcw,
  Trash2,
  Building2,
  Users,
  DollarSign,
} from "lucide-react"
import type { PayerAccount, UsageAccount } from "@/lib/types"
import { dataService } from "@/lib/data/data-service"
import { RegisterPayerDialog } from "@/components/accounts/register-payer-dialog"
import { EditPayerDialog } from "@/components/accounts/edit-payer-dialog"
import { RegisterUsageDialog } from "@/components/accounts/register-usage-dialog"
import { EditUsageDialog } from "@/components/accounts/edit-usage-dialog"
import { UsageDetailsDialog } from "@/components/accounts/usage-details-dialog"
import { ExchangeRateDialog } from "@/components/accounts/exchange-rate-dialog"
import { PayerDetailsDialog } from "@/components/accounts/payer-details-dialog"

export function AccountsPageContent() {
  const [payerAccounts, setPayerAccounts] = useState<PayerAccount[]>([])
  const [usageAccounts, setUsageAccounts] = useState<UsageAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [payerSearch, setPayerSearch] = useState("")
  const [usageSearch, setUsageSearch] = useState("")
  const [payerStatusFilter, setPayerStatusFilter] = useState<"all" | "Registered" | "Archived">("all")
  const [usageStatusFilter, setUsageStatusFilter] = useState<"all" | "Registered" | "Unregistered" | "Archived">("all")
  
  // Pagination states
  const [payerPage, setPayerPage] = useState(1)
  const [usagePage, setUsagePage] = useState(1)
  const itemsPerPage = 10

  // Dialog states
  const [payerDialogOpen, setPayerDialogOpen] = useState(false)
  const [editPayerDialogOpen, setEditPayerDialogOpen] = useState(false)
  const [selectedPayerAccount, setSelectedPayerAccount] = useState<PayerAccount | null>(null)
  const [payerDetailsDialogOpen, setPayerDetailsDialogOpen] = useState(false)
  const [selectedPayerForDetails, setSelectedPayerForDetails] = useState<PayerAccount | null>(null)
  const [usageDialogOpen, setUsageDialogOpen] = useState(false)
  const [selectedPayerForUsage, setSelectedPayerForUsage] = useState<PayerAccount | null>(null)
  const [editUsageDialogOpen, setEditUsageDialogOpen] = useState(false)
  const [selectedUsageAccount, setSelectedUsageAccount] = useState<UsageAccount | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<UsageAccount | null>(null)
  const [refreshingUsage, setRefreshingUsage] = useState(false)
  const [exchangeRateDialogOpen, setExchangeRateDialogOpen] = useState(false)
  const [selectedPayerForExchangeRate, setSelectedPayerForExchangeRate] = useState<PayerAccount | null>(null)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const [payers, usage] = await Promise.all([
        dataService.getPayerAccounts(),
        dataService.getUsageAccounts()
      ])
      setPayerAccounts(Array.isArray(payers) ? payers : [])
      setUsageAccounts(Array.isArray(usage) ? usage : [])
    } catch (error) {
      console.error("Failed to load accounts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDiscoverUsageAccounts = async () => {
    try {
      setRefreshingUsage(true)
      await dataService.discoverUsageAccounts()
      await loadAccounts()
    } catch (error) {
      console.error("Failed to discover usage accounts:", error)
    } finally {
      setRefreshingUsage(false)
    }
  }

  const filteredPayers = payerAccounts.filter(acc => {
    const matchesSearch = acc.accountName.toLowerCase().includes(payerSearch.toLowerCase()) ||
                         acc.accountId.toLowerCase().includes(payerSearch.toLowerCase())
    const matchesStatus = payerStatusFilter === "all" || acc.status === payerStatusFilter
    return matchesSearch && matchesStatus
  })

  const filteredUsage = usageAccounts.filter(acc => {
    const matchesSearch = acc.customer.toLowerCase().includes(usageSearch.toLowerCase()) ||
                         acc.id.toLowerCase().includes(usageSearch.toLowerCase())
    const matchesStatus = usageStatusFilter === "all" || acc.status === usageStatusFilter
    return matchesSearch && matchesStatus
  })

  // Pagination calculations
  const payerTotalPages = Math.ceil(filteredPayers.length / itemsPerPage)
  const payerStartIndex = (payerPage - 1) * itemsPerPage
  const payerEndIndex = payerStartIndex + itemsPerPage
  const paginatedPayers = filteredPayers.slice(payerStartIndex, payerEndIndex)

  const usageTotalPages = Math.ceil(filteredUsage.length / itemsPerPage)
  const usageStartIndex = (usagePage - 1) * itemsPerPage
  const usageEndIndex = usageStartIndex + itemsPerPage
  const paginatedUsage = filteredUsage.slice(usageStartIndex, usageEndIndex)

  if (loading) {
    return <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">Loading accounts...</p>
    </div>
  }

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#00243E]">Accounts</h1>
          <p className="mt-2 text-muted-foreground">Manage your payer and usage accounts</p>
        </div>

        {/* Payer Accounts Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#00243E] flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Payer Accounts
            </h2>
            <Button onClick={() => setPayerDialogOpen(true)} className="gap-2 bg-[#00243E] hover:bg-[#00243E]/90">
              <Plus className="h-4 w-4" />
              Register Payer
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search payer accounts..."
                value={payerSearch}
                onChange={(e) => setPayerSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={payerStatusFilter} onValueChange={(v: any) => setPayerStatusFilter(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Registered">Registered</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Account ID</TableHead>
                  <TableHead>Distributor</TableHead>
                  <TableHead>Last Update</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No payer accounts found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPayers.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.accountName}</TableCell>
                      <TableCell className="font-mono text-sm">{account.accountId}</TableCell>
                      <TableCell>{account.distributorName}</TableCell>
                      <TableCell>{account.updatedAt ? new Date(account.updatedAt).toLocaleString('en-GB', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      }).replace(',', ' -') : "-"}</TableCell>
                      <TableCell>
                        <Badge variant={account.status === "Registered" ? "default" : "secondary"}>
                          {account.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {account.status === "Registered" ? (
                              <>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedPayerForDetails(account)
                                  setPayerDetailsDialogOpen(true)
                                }}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedPayerAccount(account)
                                  setEditPayerDialogOpen(true)
                                }}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedPayerForExchangeRate(account)
                                  setExchangeRateDialogOpen(true)
                                }}>
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Exchange Rate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => dataService.archivePayerAccount(account.accountId).then(loadAccounts)}>
                                  <Archive className="mr-2 h-4 w-4" />
                                  Archive
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem onClick={() => dataService.unarchivePayerAccount(account.accountId).then(loadAccounts)}>
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Unarchive
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => dataService.deletePayerAccount(account.accountId).then(loadAccounts)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Payer Pagination */}
          {payerTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {payerStartIndex + 1} to {Math.min(payerEndIndex, filteredPayers.length)} of {filteredPayers.length} accounts
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPayerPage(p => Math.max(1, p - 1))}
                  disabled={payerPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {payerPage} of {payerTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPayerPage(p => Math.min(payerTotalPages, p + 1))}
                  disabled={payerPage === payerTotalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Usage Accounts Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#00243E] flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usage Accounts
            </h2>
            <Button onClick={handleDiscoverUsageAccounts} disabled={refreshingUsage} className="gap-2 bg-[#026172] hover:bg-[#026172]/90">
              <Search className={`h-4 w-4 ${refreshingUsage ? "animate-spin" : ""}`} />
              Discover
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search usage accounts..."
                value={usageSearch}
                onChange={(e) => setUsageSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={usageStatusFilter} onValueChange={(v: any) => setUsageStatusFilter(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Registered">Registered</SelectItem>
                <SelectItem value="Unregistered">Unregistered</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Account ID</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Rebate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsage.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No usage accounts found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsage.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.customer}</TableCell>
                      <TableCell className="font-mono text-sm">{account.id}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Customer: {account.customerDiscount}%</div>
                          <div>Reseller: {account.resellerDiscount}%</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 text-xs">
                          {account.rebateConfig?.savingsPlansRI?.discountedUsage && (
                            <Badge variant="outline" className="text-xs border-[#026172] text-[#026172]">Discounted Usage</Badge>
                          )}
                          {account.rebateConfig?.savingsPlansRI?.spNegation && (
                            <Badge variant="outline" className="text-xs border-[#026172] text-[#026172]">SP Negation</Badge>
                          )}
                          {account.rebateConfig?.discount?.bundledDiscount && (
                            <Badge variant="outline" className="text-xs border-[#00243E] text-[#00243E]">Bundled Discount</Badge>
                          )}
                          {account.rebateConfig?.discount?.credit && (
                            <Badge variant="outline" className="text-xs border-[#00243E] text-[#00243E]">Credit</Badge>
                          )}
                          {account.rebateConfig?.discount?.privateRateDiscount && (
                            <Badge variant="outline" className="text-xs border-[#00243E] text-[#00243E]">Private Rate</Badge>
                          )}
                          {account.rebateConfig?.adjustment?.credit && (
                            <Badge variant="outline" className="text-xs border-[#F26522] text-[#F26522]">Adj Credit</Badge>
                          )}
                          {account.rebateConfig?.adjustment?.refund && (
                            <Badge variant="outline" className="text-xs border-[#F26522] text-[#F26522]">Refund</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          account.status === "Registered" ? "default" :
                          account.status === "Unregistered" ? "secondary" :
                          "outline"
                        }>
                          {account.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {account.status === "Unregistered" ? (
                              <DropdownMenuItem onClick={() => {
                                const payerAccount = account.payerAccountId ? {
                                  id: account.payerAccountId,
                                  accountId: account.payerAccountId,
                                  accountName: account.payerAccountName || `Payer ${account.payerAccountId}`,
                                } : null
                                setSelectedPayerForUsage(payerAccount as any)
                                setSelectedUsageAccount(account)
                                setUsageDialogOpen(true)
                              }}>
                                <Plus className="mr-2 h-4 w-4" />
                                Register
                              </DropdownMenuItem>
                            ) : account.status === "Registered" ? (
                              <>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedUsageAccount(account)
                                  setEditUsageDialogOpen(true)
                                }}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedAccount(account)
                                  setDetailsDialogOpen(true)
                                }}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => dataService.changeUsageAccountStatus(account.accountId, "Archived").then(loadAccounts)}>
                                  <Archive className="mr-2 h-4 w-4" />
                                  Archive
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem onClick={() => dataService.changeUsageAccountStatus(account.accountId, "Registered").then(loadAccounts)}>
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Unarchive
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => dataService.deleteUsageAccount(account.accountId).then(loadAccounts)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Usage Pagination */}
          {usageTotalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {usageStartIndex + 1} to {Math.min(usageEndIndex, filteredUsage.length)} of {filteredUsage.length} accounts
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUsagePage(p => Math.max(1, p - 1))}
                  disabled={usagePage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {usagePage} of {usageTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUsagePage(p => Math.min(usageTotalPages, p + 1))}
                  disabled={usagePage === usageTotalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      <RegisterPayerDialog open={payerDialogOpen} onOpenChange={setPayerDialogOpen} onSuccess={loadAccounts} />
      <EditPayerDialog
        open={editPayerDialogOpen}
        onOpenChange={setEditPayerDialogOpen}
        account={selectedPayerAccount}
        onSuccess={loadAccounts}
      />
      {selectedPayerForDetails && (
        <PayerDetailsDialog
          open={payerDetailsDialogOpen}
          onOpenChange={setPayerDetailsDialogOpen}
          account={selectedPayerForDetails}
        />
      )}
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
      {selectedPayerForExchangeRate && (
        <ExchangeRateDialog
          open={exchangeRateDialogOpen}
          onOpenChange={setExchangeRateDialogOpen}
          payerAccountId={selectedPayerForExchangeRate.accountId}
          payerAccountName={selectedPayerForExchangeRate.accountName}
        />
      )}
    </>
  )
}
