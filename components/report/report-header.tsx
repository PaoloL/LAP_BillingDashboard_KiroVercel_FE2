"use client"

import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Building2, User } from "lucide-react"

interface ReportHeaderProps {
  payerName: string
  payerAccountId: string
  usageAccountName: string
  usageAccountId: string
  billingPeriod: string
  generatedDate: string
  status: string
}

export function ReportHeader({
  payerName,
  payerAccountId,
  usageAccountName,
  usageAccountId,
  billingPeriod,
  generatedDate,
  status,
}: ReportHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Billing Report
          </h1>
          <Badge
            variant="secondary"
            className="bg-secondary/10 text-secondary font-semibold"
          >
            {status}
          </Badge>
        </div>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Payer:</span>
            <span className="font-semibold text-foreground">{payerName}</span>
            <span className="font-mono text-xs text-muted-foreground">
              ({payerAccountId})
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Usage:</span>
            <span className="font-semibold text-foreground">{usageAccountName}</span>
            <span className="font-mono text-xs text-muted-foreground">
              ({usageAccountId})
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>Period:</span>
          <strong className="text-foreground">{billingPeriod}</strong>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Updated:</span>
          <strong className="text-foreground">{generatedDate}</strong>
        </div>
      </div>
    </div>
  )
}
