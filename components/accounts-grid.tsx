"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Edit, Plus, Check, X, Archive, Info } from "lucide-react"
import { RegisterPayerDialog } from "@/components/register-payer-dialog"
import { EditPayerDialog } from "@/components/edit-payer-dialog"
import { RegisterUsageDialog } from "@/components/register-usage-dialog"
import { EditUsageDialog } from "@/components/edit-usage-dialog"
import { UsageDetailsDialog } from "@/components/usage-details-dialog"
import type { PayerAccount, UsageAccount } from "@/lib/types"

const payerAccounts: PayerAccount[] = [
  {
    id: "1",
    accountId: "123456789012",
    accountName: "Production Payer",
    name: "Production Payer",
    type: "PAYER",
    distributorName: "AWS Distributor Inc.",
    legalEntityName: "Tech Solutions GmbH",
    vatNumber: "DE123456789",
    crossAccountRoleArn: "arn:aws:iam::123456789012:role/BillingDataAccessRole",
    status: "Registered",
    lastTransactionDate: "2025-01-15",
  },
  {
    id: "2",
    accountId: "234567890123",
    accountName: "Development Payer",
    name: "Development Payer",
    type: "PAYER",
    distributorName: "AWS Distributor Inc.",
    legalEntityName: "Dev Partners Ltd.",
    vatNumber: "DE987654321",
    crossAccountRoleArn: "arn:aws:iam::234567890123:role/BillingDataAccessRole",
    status: "Registered",
    lastTransactionDate: "2025-01-10",
  },
]

const usageAccounts: UsageAccount[] = [
  {
    id: "345678901234",
    name: "Acme Corporation",
    type: "USAGE",
    customer: "Acme Corporation",
    status: "Registered",
    vatNumber: "DE123456789",
    resellerDiscount: 15,
    customerDiscount: 10,
    rebateCredits: true,
    fundsUtilization: 65,
    totalUsage: 32500.0,
    totalDeposit: 50000.0,
    distributorName: "AWS Distributor Inc.",
    lastTransactionDate: "2025-01-14",
  },
  {
    id: "456789012345",
    name: "TechStart GmbH",
    type: "USAGE",
    customer: "TechStart GmbH",
    status: "Registered",
    vatNumber: "DE987654321",
    resellerDiscount: 20,
    customerDiscount: 15,
    rebateCredits: true,
    fundsUtilization: 42,
    totalUsage: 21000.0,
    totalDeposit: 50000.0,
    distributorName: "AWS Distributor Inc.",
    lastTransactionDate: "2025-01-12",
  },
  {
    id: "567890123456",
    name: "Global Solutions Ltd",
    type: "USAGE",
    customer: "Global Solutions Ltd",
    status: "Unregistered",
    vatNumber: "GB123456789",
    resellerDiscount: 0,
    customerDiscount: 0,
    rebateCredits: false,
    fundsUtilization: 88,
    totalUsage: 44000.0,
    totalDeposit: 50000.0,
    distributorName: "AWS Distributor Inc.",
    lastTransactionDate: "2025-01-08",
  },
  {
    id: "678901234567",
    name: "Innovation Labs",
    type: "USAGE",
    customer: "Innovation Labs",
    status: "Archived",
    vatNumber: "FR123456789",
    resellerDiscount: 18,
    customerDiscount: 12,
    rebateCredits: true,
    fundsUtilization: 34,
    totalUsage: 17000.0,
    totalDeposit: 50000.0,
    distributorName: "Cloud Partners Ltd.",
    lastTransactionDate: "2024-12-20",
  },
]

export function AccountsGrid() {
  const [payerDialogOpen, setPayerDialogOpen] = useState(false)
  const [editPayerDialogOpen, setEditPayerDialogOpen] = useState(false)
  const [selectedPayerAccount, setSelectedPayerAccount] = useState<PayerAccount | null>(null)
  const [usageDialogOpen, setUsageDialogOpen] = useState(false)
  const [selectedPayerForUsage, setSelectedPayerForUsage] = useState<PayerAccount | null>(null)
  const [editUsageDialogOpen, setEditUsageDialogOpen] = useState(false)
  const [selectedUsageAccount, setSelectedUsageAccount] = useState<UsageAccount | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<UsageAccount | null>(null)

  const openDetailsDialog = (account: UsageAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedAccount(account)
    setDetailsDialogOpen(true)
  }

  const openEditPayerDialog = (account: PayerAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedPayerAccount(account)
    setEditPayerDialogOpen(true)
  }

  const handleArchiveAccount = (account: PayerAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    console.log("Archiving account:", account.id)
  }

  const openRegisterUsageDialog = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedPayerForUsage(payerAccounts[0])
    setUsageDialogOpen(true)
  }

  const openEditUsageDialog = (account: UsageAccount, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedUsageAccount(account)
    setEditUsageDialogOpen(true)
  }

  return (
    <>
      <div className="space-y-8">
        {/* Payer Accounts Section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#00243E]">Payer Accounts</h2>
            <Button
              onClick={() => setPayerDialogOpen(true)}
              size="sm"
              className="gap-2 bg-[#00243E] hover:bg-[#00243E]/90"
            >
              <Plus className="h-4 w-4" />
              Register Payer
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {payerAccounts.map((account) => (
              <Card key={account.id} className="border-[#00243E] transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00243E]/10">
                      <Building2 className="h-4 w-4 text-[#00243E]" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-semibold text-[#00243E]">
                          {account.accountName} ({account.accountId})
                        </CardTitle>
                        {account.status === "Archived" && (
                          <Badge className="bg-gray-500 text-white hover:bg-gray-500/90">Archived</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => openEditPayerDialog(account, e)}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleArchiveAccount(account, e)}
                      title="Archive"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Distributor</p>
                      <p className="text-sm font-medium text-foreground">{account.distributorName}</p>
                    </div>
                    {account.lastTransactionDate && (
                      <div>
                        <p className="text-xs text-muted-foreground">Last Transaction</p>
                        <p className="text-sm font-medium text-foreground">{account.lastTransactionDate}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Usage Accounts Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-[#00243E]">Usage Accounts</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {usageAccounts.map((account) => (
              <Card
                key={account.id}
                className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md"
                onClick={() => openDetailsDialog(account)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-semibold leading-tight text-[#00243E]">
                          {account.customer} ({account.id})
                        </CardTitle>
                        {account.status === "Registered" && (
                          <Badge className="bg-[#026172] text-white hover:bg-[#026172]/90">Registered</Badge>
                        )}
                        {account.status === "Unregistered" && (
                          <Badge className="bg-[#EC9400] text-white hover:bg-[#EC9400]/90">Unregistered</Badge>
                        )}
                        {account.status === "Archived" && (
                          <Badge className="bg-gray-500 text-white hover:bg-gray-500/90">Archived</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 border-b border-border pb-3">
                    {account.distributorName && (
                      <div>
                        <p className="text-xs text-muted-foreground">Distributor</p>
                        <p className="text-sm font-medium text-foreground">{account.distributorName}</p>
                      </div>
                    )}
                    {account.lastTransactionDate && (
                      <div>
                        <p className="text-xs text-muted-foreground">Last Transaction</p>
                        <p className="text-sm font-medium text-foreground">{account.lastTransactionDate}</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Funds Utilization</span>
                      <span className="font-semibold text-foreground">{account.fundsUtilization}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[#026172]"
                        style={{ width: `${account.fundsUtilization}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      €{(account.totalUsage / 1000).toFixed(1)}k of €{(account.totalDeposit / 1000).toFixed(1)}k used
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">Customer Discount</p>
                      <p className="text-xs font-medium text-[#026172]">{account.customerDiscount}%</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {account.rebateCredits ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#026172]/10">
                          <Check className="h-4 w-4 text-[#026172]" />
                        </div>
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-500/10">
                          <X className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">Rebate</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {account.status === "Unregistered" ? (
                      <Button
                        onClick={(e) => openRegisterUsageDialog(e)}
                        size="sm"
                        className="flex-1 gap-2 bg-[#00243E] hover:bg-[#00243E]/90"
                      >
                        <Plus className="h-4 w-4" />
                        Register
                      </Button>
                    ) : account.status === "Registered" ? (
                      <>
                        <Button
                          onClick={(e) => openEditUsageDialog(account, e)}
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-2 border-[#00243E] text-[#00243E] hover:bg-[#00243E]/10"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          onClick={(e) => openDetailsDialog(account, e)}
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-2 border-[#00243E] text-[#00243E] hover:bg-[#00243E]/10"
                        >
                          <Info className="h-4 w-4" />
                          Details
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={(e) => openDetailsDialog(account, e)}
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2 border-gray-500 text-gray-600 hover:bg-gray-500/10"
                      >
                        <Info className="h-4 w-4" />
                        Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <RegisterPayerDialog open={payerDialogOpen} onOpenChange={setPayerDialogOpen} />
      <EditPayerDialog
        open={editPayerDialogOpen}
        onOpenChange={setEditPayerDialogOpen}
        account={selectedPayerAccount}
      />
      <RegisterUsageDialog
        open={usageDialogOpen}
        onOpenChange={setUsageDialogOpen}
        payerAccount={selectedPayerForUsage}
      />
      <EditUsageDialog
        open={editUsageDialogOpen}
        onOpenChange={setEditUsageDialogOpen}
        account={selectedUsageAccount}
      />
      {selectedAccount && (
        <UsageDetailsDialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} account={selectedAccount} />
      )}
    </>
  )
}
