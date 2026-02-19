"use client"

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/format"
import { Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { dataService } from "@/lib/data/data-service"
import { format, subMonths } from "date-fns"

interface UsageDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: {
    id: string
    customer: string
    status: "Active" | "Inactive"
    vatNumber: string
    discountValue: number
    rebateCredits: boolean
    fundsUtilization: number
    totalUsage: number
    totalDeposit: number
  }
}

interface TransactionData {
  period: string
  distributorCost: number
  sellerCost: number
  customerCost: number
  margin: number
}

export function UsageDetailsDialog({ open, onOpenChange, account }: UsageDetailsDialogProps) {
  const [accountDetails, setAccountDetails] = useState<any>(null)
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [customerInfo, setCustomerInfo] = useState<{ customerName: string; costCenterName: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && account.id) {
      loadData()
    }
  }, [open, account.id])

  const loadData = async () => {
    setLoading(true)
    try {
      // Fetch account details
      const accounts = await dataService.getUsageAccounts()
      const accountData = accounts.find((a: any) => a.id === account.id)
      setAccountDetails(accountData)

      // Fetch customer and cost center information
      try {
        const customers = await dataService.getCustomers()
        let found = false
        for (const customer of customers) {
          // Check if this customer has cost centers with this usage account
          if (customer.costCenters) {
            for (const cc of customer.costCenters) {
              if (cc.usageAccountIds?.includes(accountData?.accountId)) {
                setCustomerInfo({
                  customerName: customer.legalName || customer.name,
                  costCenterName: cc.name
                })
                found = true
                break
              }
            }
          }
          if (found) break
        }
      } catch (error) {
        console.error('Failed to load customer info:', error)
      }

      // Fetch last 3 months transactions
      const endDate = new Date()
      const startDate = subMonths(endDate, 3)
      const endPeriod = format(endDate, 'yyyy-MM')
      const startPeriod = format(startDate, 'yyyy-MM')

      const transactionsData = await dataService.getTransactions({
        usageAccountId: accountData?.accountId,
        startPeriod,
        endPeriod
      })

      // Group by period and calculate costs
      const periodMap = new Map<string, TransactionData>()
      
      transactionsData.data?.forEach((tx: any) => {
        const period = tx.billingPeriod
        if (!periodMap.has(period)) {
          periodMap.set(period, {
            period,
            distributorCost: 0,
            sellerCost: 0,
            customerCost: 0,
            margin: 0
          })
        }
        
        const data = periodMap.get(period)!
        data.distributorCost += tx.totals?.distributor?.eur || 0
        data.sellerCost += tx.totals?.seller?.net?.eur || tx.totals?.seller?.eur || 0
        data.customerCost += tx.totals?.customer?.net?.eur || tx.totals?.customer?.eur || 0
        data.margin = data.customerCost - data.sellerCost
      })

      setTransactions(Array.from(periodMap.values()).sort((a, b) => b.period.localeCompare(a.period)))
    } catch (error) {
      console.error('Failed to load account data:', error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-[#00243E]">{accountDetails?.accountName || account.customer}</DialogTitle>
          <DialogDescription>Account ID: {accountDetails?.accountId || account.id}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="space-y-4 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Account Status</span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      accountDetails?.status === "Active" ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600",
                    )}
                  >
                    {accountDetails?.status || account.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Seller Discount</span>
                  <span className="text-sm font-semibold text-foreground">{accountDetails?.sellerDiscount || account.sellerDiscount || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Customer Discount</span>
                  <span className="text-sm font-semibold text-foreground">{accountDetails?.customerDiscount || account.discountValue}%</span>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-border p-4">
                <h4 className="font-semibold text-[#00243E]">Customer & Cost Center</h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Customer</span>
                  <span className="text-sm font-semibold text-foreground">{customerInfo?.customerName || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Cost Center</span>
                  <span className="text-sm font-semibold text-foreground">{customerInfo?.costCenterName || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border border-border p-4">
                <h4 className="font-semibold text-[#00243E]">Rebate Configuration</h4>
                
                <div className="flex flex-wrap gap-2">
                  {accountDetails?.rebateConfig?.savingsPlansRI?.spNegation && (
                    <Badge variant="secondary" className="bg-[#026172]/10 text-[#026172] hover:bg-[#026172]/20">
                      SP Negation
                    </Badge>
                  )}
                  {accountDetails?.rebateConfig?.savingsPlansRI?.discountedUsage && (
                    <Badge variant="secondary" className="bg-[#026172]/10 text-[#026172] hover:bg-[#026172]/20">
                      Discounted Usage
                    </Badge>
                  )}
                  {accountDetails?.rebateConfig?.discount?.credit && (
                    <Badge variant="secondary" className="bg-[#026172]/10 text-[#026172] hover:bg-[#026172]/20">
                      Discount Credit
                    </Badge>
                  )}
                  {accountDetails?.rebateConfig?.discount?.privateRateDiscount && (
                    <Badge variant="secondary" className="bg-[#026172]/10 text-[#026172] hover:bg-[#026172]/20">
                      Private Rate Discount
                    </Badge>
                  )}
                  {accountDetails?.rebateConfig?.discount?.bundledDiscount && (
                    <Badge variant="secondary" className="bg-[#026172]/10 text-[#026172] hover:bg-[#026172]/20">
                      Bundled Discount
                    </Badge>
                  )}
                  {accountDetails?.rebateConfig?.adjustment?.credit && (
                    <Badge variant="secondary" className="bg-[#026172]/10 text-[#026172] hover:bg-[#026172]/20">
                      Adjustment Credit
                    </Badge>
                  )}
                  {accountDetails?.rebateConfig?.adjustment?.refund && (
                    <Badge variant="secondary" className="bg-[#026172]/10 text-[#026172] hover:bg-[#026172]/20">
                      Adjustment Refund
                    </Badge>
                  )}
                  {!accountDetails?.rebateConfig && (
                    <span className="text-sm text-muted-foreground">No rebate configuration</span>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
