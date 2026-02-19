"use client"

import { useEffect, useState, useCallback } from "react"
import { dataService } from "@/lib/data/data-service"
import type { PlatformUser, Customer, UserRole, UserStatus } from "@/lib/types"
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
  Trash2,
  UserCog,
} from "lucide-react"

import { UserFormDialog } from "@/components/users/user-form-dialog"

function formatLastLogin(dateStr?: string): string {
  if (!dateStr) return "Never"
  const date = new Date(dateStr)
  return (
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }) +
    " - " +
    date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  )
}

function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    Admin: "bg-blue-100 text-blue-700 border-blue-200",
    Finance: "bg-amber-100 text-amber-700 border-amber-200",
    Customer: "bg-violet-100 text-violet-700 border-violet-200",
  }
  return (
    <Badge variant="outline" className={styles[role]}>
      {role}
    </Badge>
  )
}

function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <Badge
      variant={status === "Active" ? "default" : "secondary"}
      className={
        status === "Active"
          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
          : ""
      }
    >
      {status}
    </Badge>
  )
}

export function UsersPageContent() {
  const [users, setUsers] = useState<PlatformUser[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>("all")

  // Dialog states
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PlatformUser | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [usersData, customersData] = await Promise.all([
        dataService.getUsers(),
        dataService.getCustomers(),
      ])
      setUsers(usersData)
      setCustomers(customersData)
    } catch (err) {
      console.error("Failed to load user data:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filtered users
  const filtered = users.filter((u) => {
    const term = search.toLowerCase()
    const matchesSearch =
      !term ||
      u.firstName.toLowerCase().includes(term) ||
      u.lastName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.customerName && u.customerName.toLowerCase().includes(term))
    const matchesRole = roleFilter === "all" || u.role === roleFilter
    const matchesStatus = statusFilter === "all" || u.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  // Handlers
  function handleOpenCreate() {
    setEditingUser(null)
    setFormOpen(true)
  }

  function handleOpenEdit(user: PlatformUser) {
    setEditingUser(user)
    setFormOpen(true)
  }

  async function handleSaveUser(data: {
    email: string
    firstName: string
    lastName: string
    role: UserRole
    password?: string
    customerId?: string
  }) {
    try {
      if (editingUser) {
        await dataService.updateUser(editingUser.id, {
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          customerId: data.role === "Customer" ? data.customerId : null,
          password: data.password,
        })
      } else {
        await dataService.createUser({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          password: data.password!,
          customerId: data.customerId,
        })
      }
      await loadData()
    } catch (err) {
      console.error("Failed to save user:", err)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await dataService.deleteUser(deleteTarget.id)
      await loadData()
    } catch (err) {
      console.error("Failed to delete user:", err)
    }
    setDeleteTarget(null)
  }

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
            <UserCog className="h-6 w-6 text-muted-foreground" />
            Users
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage platform users, roles, and customer assignments.
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-1.5" /> Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as "all" | UserRole)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Admin">Admin</SelectItem>
            <SelectItem value="Finance">Finance</SelectItem>
            <SelectItem value="Customer">Customer</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as "all" | UserStatus)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Customer</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Last Login</TableHead>
              <TableHead className="font-semibold text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-muted-foreground"
                >
                  {search || roleFilter !== "all" || statusFilter !== "all"
                    ? "No users match your filters."
                    : "No users registered yet."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-foreground">
                    {u.firstName} {u.lastName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={u.role} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.customerName || "-"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={u.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatLastLogin(u.lastLoginAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleOpenEdit(u)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(u)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* User Form Dialog */}
      <UserFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        user={editingUser}
        customers={customers}
        onSave={handleSaveUser}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>
                {deleteTarget?.firstName} {deleteTarget?.lastName}
              </strong>{" "}
              ({deleteTarget?.email}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
