"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAuth } from "@/lib/auth/auth-context"
import { config } from "@/lib/config"
import { dataService } from "@/lib/data/data-service"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  role: z.enum(["Admin", "Finance", "Customer"]),
  customerId: z.string().optional(),
})

const editUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  role: z.enum(["Admin", "Finance", "Customer"]),
  customerId: z.string().optional(),
})

type UserFormData = z.infer<typeof userSchema>

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: { username: string; email: string; name?: string; surname?: string; role: string; customerId?: string } | null
  onSuccess: () => void
}

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) {
  const { user: authUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Array<{ vatNumber: string; legalName: string }>>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(user ? editUserSchema : userSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      password: "",
      role: "Customer",
      customerId: "",
    },
  })

  const role = watch("role")

  useEffect(() => {
    if (open) {
      if (user) {
        setValue("name", user.name || "")
        setValue("surname", user.surname || "")
        setValue("email", user.email)
        setValue("role", user.role as "Admin" | "Finance" | "Customer")
        setValue("customerId", user.customerId || "")
      } else {
        reset()
      }
      loadCustomers()
    }
  }, [open, user])

  const loadCustomers = async () => {
    try {
      const data = await dataService.getCustomers()
      setCustomers(data)
    } catch (err) {
      console.error("Failed to load customers:", err)
    }
  }

  const onSubmit = async (data: UserFormData) => {
    setLoading(true)
    try {
      const url = user
        ? `${config.apiBaseUrl}/users/${user.username}`
        : `${config.apiBaseUrl}/users`

      const body: any = {
        name: data.name,
        surname: data.surname,
        role: data.role,
        customerId: data.customerId || undefined,
      }

      if (!user) {
        body.email = data.email
        body.password = data.password
      }

      const response = await fetch(url, {
        method: user ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authUser?.token}`,
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        onSuccess()
        onOpenChange(false)
        reset()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to save user")
      }
    } catch (err) {
      console.error("Failed to save user:", err)
      alert("Failed to save user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="John"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="surname">Surname</Label>
            <Input
              id="surname"
              {...register("surname")}
              placeholder="Doe"
            />
            {errors.surname && (
              <p className="mt-1 text-sm text-red-600">{errors.surname.message}</p>
            )}
          </div>

          {!user && (
            <>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </>
          )}

          {user && (
            <div>
              <Label htmlFor="email">Email (cannot be changed)</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-gray-100"
              />
            </div>
          )}

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setValue("role", value as "Admin" | "Finance" | "Customer")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === "Customer" && (
            <div>
              <Label htmlFor="customerId">Customer</Label>
              <Select
                value={watch("customerId")}
                onValueChange={(value) => setValue("customerId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.vatNumber} value={c.vatNumber}>
                      {c.legalName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : user ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
