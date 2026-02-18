"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart3, CreditCard, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Company Logo" width={96} height={96} />
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button className="bg-[#026172] hover:bg-[#026172]/90">Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-balance text-5xl font-bold tracking-tight text-[#00243E] sm:text-6xl lg:text-7xl">
              AWS Billing Management
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Comprehensive cost tracking and financial insights for your AWS infrastructure. Monitor usage, manage
              accounts, and optimize spending with precision.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/auth/login">
                <Button size="lg" className="gap-2 bg-[#026172] hover:bg-[#026172]/90">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#EC9400]/10">
                <BarChart3 className="h-6 w-6 text-[#EC9400]" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-card-foreground">Real-Time Cost Tracking</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Monitor your AWS spending in real-time with detailed breakdowns by service, account, and billing period.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#026172]/10">
                <CreditCard className="h-6 w-6 text-[#026172]" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-card-foreground">Multi-Account Management</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Manage multiple payer and usage accounts with customizable discounts, rebates, and financial controls.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#00243E]/10">
                <Shield className="h-6 w-6 text-[#00243E]" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-card-foreground">Secure & Compliant</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Enterprise-grade security with VAT tracking, audit trails, and comprehensive financial reporting.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
