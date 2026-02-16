"use client"

import { useEffect, useState, useCallback } from "react"
import { dataService } from "@/lib/data/data-service"
import { useAuth } from "@/lib/auth/auth-context"
import type { Customer, UsageAccount, CostCenter } from "@/lib/types"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  Banknote,
  Users,
  Link2,
} from "lucide-react"

import { CustomerFormDialog } from "@/components/customers/customer-form-dialog"
import { CustomerDetailsDialog } from "@/components/customers/customer-details-dialog"
import { CustomerInfoDialog } from "@/components/customers/customer-info-dialog"
import { CostCentersDialog } from "@/components/customers/cost-centers-dialog"
import { ManageAccountsDialog } from "@/components/customers/manage-accounts-dialog"
import { CustomerDepositDialog } from "@/components/customers/customer-deposit-dialog"
import { AssociateAccountsDialog } from "@/components/customers/associate-accounts-dialog"

export function CustomersPageContent() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [usageAccounts, setUsageAccounts] = useState<UsageAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "Active" | "Archived">("all")

  // Dialog states
  const [formOpen, setFormOpen] = useState(false)
  const [infoCustomer, setInfoCustomer] = useState<Customer | null>(null)
  const [infoOpen, setInfoOpen] = useState(false)
  const [ccCustomer, setCcCustomer] = useState<Customer | null>(null)
  const [ccOpen, setCcOpen] = useState(false)
  const [manageCustomer, setManageCustomer] = useState<Customer | null>(null)
  const [manageOpen, setManageOpen] = useState(false)
  const [detailsCustomer, setDetailsCustomer] = useState<Customer | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [depositCustomer, setDepositCustomer] = useState<Customer | null>(null)
  const [depositOpen, setDepositOpen] = useState(false)
  const [associateOpen, setAssociateOpen] = useState(false)
  const [associateCostCenter, setAssociateCostCenter] = useState<CostCenter | null>(null)
  const [associateCustomerId, setAssociateCustomerId] = useState<string>("")

  // Confirm dialogs
  const [archiveTarget, setArchiveTarget] = useState<Customer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [custData, accData] = await Promise.all([
        dataService.getCustomers(),
        dataService.getUsageAccounts(),
      ])
      setCustomers(custData)
      setUsageAccounts(accData)
    } catch (err) {
      console.error("Failed to load customer data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filtered customers
  const filtered = customers.filter((c) => {
    const matchesSearch = !search.trim() ||
      c.legalName.toLowerCase().includes(search.toLowerCase()) ||
      c.vatNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.contactName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactEmail.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Handlers
  async function handleSaveCustomer(data: { legalName: string; vatNumber: string; contactName: string; contactEmail: string }) {
    try {
      await dataService.createCustomer(data)
      await loadData()
    } catch (err) {
      console.error("Failed to save customer:", err)
    }
  }

  async function handleUpdateCustomer(data: { legalName: string; contactName: string; contactEmail: string }) {
    if (!infoCustomer) return
    try {
      await dataService.updateCustomer(infoCustomer.id, data)
      await loadData()
    } catch (err) {
      console.error("Failed to update customer:", err)
    }
  }

  async function handleAddCostCenter(data: { name: string; description: string }) {
    if (!ccCustomer) return
    try {
      const updated = await dataService.addCostCenter(ccCustomer.id, data)
      setCcCustomer(updated)
      await loadData()
    } catch (err) {
      console.error("Failed to add cost center:", err)
    }
  }

  async function handleRemoveCostCenter(costCenterId: string) {
    if (!ccCustomer) return
    try {
      const updated = await dataService.removeCostCenter(ccCustomer.id, costCenterId)
      setCcCustomer(updated)
      await loadData()
    } catch (err) {
      console.error("Failed to remove cost center:", err)
    }
  }

  function handleManageAccounts(cc: CostCenter) {
    if (!manageCustomer) return
    setAssociateCustomerId(manageCustomer.id)
    setAssociateCostCenter(cc)
    setAssociateOpen(true)
  }

  async function handleArchive() {
    if (!archiveTarget) return
    try {
      await dataService.archiveCustomer(archiveTarget.id)
      await loadData()
      // Update details dialog if open
      if (detailsCustomer?.id === archiveTarget.id) {
        const updated = await dataService.getCustomers()
        setDetailsCustomer(updated.find((c) => c.id === archiveTarget.id) || null)
      }
    } catch (err) {
      console.error("Failed to archive:", err)
    }
    setArchiveTarget(null)
  }

  async function handleRestore(customer: Customer) {
    try {
      await dataService.restoreCustomer(customer.id)
      await loadData()
    } catch (err) {
      console.error("Failed to restore:", err)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await dataService.deleteCustomer(deleteTarget.id)
      await loadData()
    } catch (err) {
      console.error("Failed to delete:", err)
    }
    setDeleteTarget(null)
  }

  async function handleDeposit(deposit: { costCenterId: string; amountEur: number; description: string; poNumber: string }) {
    if (!depositCustomer) return
    try {
      console.log('Creating deposit with user:', user)
      const depositWithUser = {
        ...deposit,
        createdBy: user?.email || user?.sub || 'system'
      }
      await dataService.createDeposit(depositCustomer.id, depositWithUser)
      await loadData()
    } catch (err) {
      console.error("Failed to create deposit:", err)
    }
    setDepositCustomer(null)
  }


  async function handleSaveAccounts(costCenterId: string, accountIds: string[]) {
    if (!associateCustomerId) return
    try {
      const updated = await dataService.updateCostCenterAccounts(associateCustomerId, costCenterId, accountIds)
      // Update the relevant customer state
      if (manageCustomer?.id === associateCustomerId) {
        setManageCustomer(updated)
      }
      await loadData()
    } catch (err: any) {
      console.error("Failed to update accounts:", err)
      // Show user-friendly error for conflicts
      if (err.message && err.message.includes('already assigned')) {
        alert('Cannot assign account: One or more accounts are already assigned to another cost center.')
      } else {
        alert('Failed to update accounts. Please try again.')
      }
      throw err // Re-throw to prevent dialog from closing
    }
  }

  // Get all assigned account IDs across ALL customers (global uniqueness)
  const allAssignedAccountIds = customers.flatMap((customer) =>
    customer.costCenters.flatMap((cc) => cc.usageAccountIds)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-muted-foreground" />
            Customers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage customer registrations, cost centers, and deposits.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> Register Customer
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "Active" | "Archived")}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold">Legal Name</TableHead>
              <TableHead className="font-semibold">VAT Number</TableHead>
              <TableHead className="font-semibold">Contact</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-center">CC / Accounts</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  {search || statusFilter !== "all" ? "No customers match your filters." : "No customers registered yet."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((customer) => {
                const totalAccounts = customer.costCenters.reduce((sum, cc) => sum + cc.usageAccountIds.length, 0)
                return (
                  <TableRow key={customer.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">{customer.legalName}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{customer.vatNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-foreground">{customer.contactName}</p>
                        <p className="text-xs text-muted-foreground">{customer.contactEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={customer.status === "Active" ? "default" : "secondary"}
                        className={customer.status === "Active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : ""}
                      >
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm text-muted-foreground">
                        {customer.costCenters.length} / {totalAccounts}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem onClick={() => { setDetailsCustomer(customer); setDetailsOpen(true) }}>
                            <Eye className="h-4 w-4 mr-2" /> Details
                          </DropdownMenuItem>
                          {customer.status === "Active" && (
                            <>
                              <DropdownMenuItem onClick={() => { setInfoCustomer(customer); setInfoOpen(true) }}>
                                <Pencil className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => { setCcCustomer(customer); setCcOpen(true) }}>
                                <Plus className="h-4 w-4 mr-2" /> Add Cost Center
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setManageCustomer(customer); setManageOpen(true) }}>
                                <Link2 className="h-4 w-4 mr-2" /> Manage Accounts
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => { setDepositCustomer(customer); setDepositOpen(true) }}>
                                <Banknote className="h-4 w-4 mr-2" /> Make Deposit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setArchiveTarget(customer)} className="text-amber-600 focus:text-amber-600">
                                <Archive className="h-4 w-4 mr-2" /> Archive
                              </DropdownMenuItem>
                            </>
                          )}
                          {customer.status === "Archived" && (
                            <>
                              <DropdownMenuItem onClick={() => handleRestore(customer)}>
                                <RotateCcw className="h-4 w-4 mr-2" /> Restore
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setDeleteTarget(customer)} className="text-destructive focus:text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={null}
        onSave={handleSaveCustomer}
      />

      <CustomerInfoDialog
        open={infoOpen}
        onOpenChange={setInfoOpen}
        customer={infoCustomer}
        onSave={handleUpdateCustomer}
      />

      <CostCentersDialog
        open={ccOpen}
        onOpenChange={setCcOpen}
        customer={ccCustomer}
        onAddCostCenter={handleAddCostCenter}
        onRemoveCostCenter={handleRemoveCostCenter}
      />

      <ManageAccountsDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        customer={manageCustomer}
        usageAccounts={usageAccounts}
        onManageAccounts={handleManageAccounts}
      />

      <CustomerDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        customer={detailsCustomer}
        usageAccounts={usageAccounts}
      />

      <CustomerDepositDialog
        open={depositOpen}
        onOpenChange={setDepositOpen}
        customer={depositCustomer}
        onDeposit={handleDeposit}
      />

      <AssociateAccountsDialog
        open={associateOpen}
        onOpenChange={setAssociateOpen}
        costCenter={associateCostCenter}
        usageAccounts={usageAccounts}
        allAssignedAccountIds={allAssignedAccountIds}
        onSave={handleSaveAccounts}
      />

      {/* Archive Confirmation */}
      <AlertDialog open={!!archiveTarget} onOpenChange={() => setArchiveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive <strong>{archiveTarget?.legalName}</strong>? Archived customers cannot make deposits or be edited.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} className="bg-amber-600 hover:bg-amber-700">Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.legalName}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
