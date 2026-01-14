"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, signOut as cognitoSignOut, type User } from "./cognito"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("[v0] Error fetching user:", error)
      setUser(null)
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [])

  const signOut = async () => {
    try {
      await cognitoSignOut()
      setUser(null)
      router.push("/auth/login")
    } catch (error) {
      console.error("[v0] Error signing out:", error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
