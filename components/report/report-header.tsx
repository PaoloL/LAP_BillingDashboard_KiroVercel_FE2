"use client"

import { Badge } from "@/components/ui/badge"
import { Clock, Building2, Mail, User } from "lucide-react"

interface ReportHeaderProps {
  customerName: string
  customerVat: string
  contactName: string
  contactEmail: string
  generatedDate: string
  status: string
}

export function ReportHeader({
  customerName,
  customerVat,
  contactName,
  contactEmail,
  generatedDate,
  status,
}: ReportHeaderProps) {
  // Format date as dd/mm/yyyy - hh:mm:ss
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`
    } catch {
      return dateString
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-start justify-between">
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
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-semibold text-foreground">{customerName || 'N/A'}</span>
              {customerVat && (
                <span className="font-mono text-xs text-muted-foreground">
                  (VAT: {customerVat})
                </span>
              )}
            </div>
            {contactName && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Contact:</span>
                <span className="font-medium text-foreground">{contactName}</span>
              </div>
            )}
            {contactEmail && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium text-foreground">{contactEmail}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Updated:</span>
            <strong className="text-foreground">{formatDate(generatedDate)}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
