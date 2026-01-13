"use client"

import type React from "react"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { verifyEmail, resendVerificationCode } from "@/lib/auth/cognito"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart3, AlertCircle, CheckCircle2 } from "lucide-react"

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email") || ""

  const [email, setEmail] = useState(emailParam)
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await verifyEmail(email, code)
      setSuccess(true)
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (err: any) {
      console.error("[v0] Verification error:", err)
      setError(err.message || "Verification failed. Please check your code.")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError("")
    setResending(true)

    try {
      await resendVerificationCode(email)
      setError("")
      alert("Verification code resent to your email")
    } catch (err: any) {
      console.error("[v0] Resend error:", err)
      setError(err.message || "Failed to resend code")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#00243E] to-[#026172] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#00243E]">
            <BarChart3 className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-2xl">Verify Email</CardTitle>
          <CardDescription>Enter the verification code sent to your email address</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Email verified successfully! Redirecting to login...
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || success}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={loading || success}
                maxLength={6}
              />
            </div>

            <Button type="submit" className="w-full bg-[#026172] hover:bg-[#026172]/90" disabled={loading || success}>
              {loading ? "Verifying..." : "Verify Email"}
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Didn't receive the code?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || success}
                className="text-[#026172] hover:underline disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend"}
              </button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              <Link href="/auth/login" className="text-[#026172] hover:underline">
                Back to login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
