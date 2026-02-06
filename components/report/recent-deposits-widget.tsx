"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/format"
import { PiggyBank } from "lucide-react"

export interface DepositRow {
  id: string
  period: string
  payerAccount: string
  usageAccountName: string
  usageAccountId: string
  amountEur: number
}

interface RecentDepositsWidgetProps {
  deposits: DepositRow[]
}

export function RecentDepositsWidget({ deposits }: RecentDepositsWidgetProps) {
  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <PiggyBank className="h-4 w-4 text-secondary" />
          Last 10 Deposits
        </CardTitle>
      </CardHeader>
      <CardContent>
        {deposits.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No deposits found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Period</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Payer Account</TableHead>
                  <TableHead className="text-xs font-semibold uppercase text-muted-foreground">Usage Account</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase text-muted-foreground">Value (EUR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.map((dep) => (
                  <TableRow key={dep.id} className="border-border">
                    <TableCell className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">
                      {dep.period}
                    </TableCell>
                    <TableCell className="py-2.5 text-sm text-foreground whitespace-nowrap">
                      {dep.payerAccount}
                    </TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground">{dep.usageAccountName}</span>
                        <span className="text-xs font-mono text-muted-foreground">{dep.usageAccountId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-right text-sm font-semibold text-secondary whitespace-nowrap">
                      {formatCurrency(dep.amountEur)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
