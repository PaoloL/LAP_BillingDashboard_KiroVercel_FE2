"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export function UnregisteredAlert() {
  // This would normally check for actual unregistered accounts
  const hasUnregistered = false

  if (!hasUnregistered) return null

  return (
    <Alert className="mb-6 border-[#EBB700] bg-[#EBB700]">
      <AlertTriangle className="h-4 w-4 text-white" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-white font-medium">You have unregistered accounts that need attention</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
            Register
          </Button>
          <Button size="sm" variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
            Archive
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
