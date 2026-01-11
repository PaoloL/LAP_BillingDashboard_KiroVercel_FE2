import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/format"

const transactions = [
  {
    period: "2025-01",
    customer: "Acme Corp",
    lineItems: { usage: 12345.67, credit: 1234.56, tax: 2345.67, fee: 100.0, deposit: 0 },
    totals: { originCost: 13580.23, discountedCost: 12222.21 },
  },
  {
    period: "2025-01",
    customer: "TechStart GmbH",
    lineItems: { usage: 8765.43, credit: 876.54, tax: 1576.23, fee: 50.0, deposit: 5000.0 },
    totals: { originCost: 9641.97, discountedCost: 8677.77 },
  },
  {
    period: "2024-12",
    customer: "Global Solutions",
    lineItems: { usage: 15678.9, credit: 0, tax: 2981.09, fee: 150.0, deposit: 0 },
    totals: { originCost: 15678.9, discountedCost: 14111.01 },
  },
  {
    period: "2024-12",
    customer: "Innovation Labs",
    lineItems: { usage: 6543.21, credit: 654.32, tax: 1176.58, fee: 75.0, deposit: 3000.0 },
    totals: { originCost: 7197.53, discountedCost: 6477.78 },
  },
  {
    period: "2024-11",
    customer: "Digital Ventures",
    lineItems: { usage: 9876.54, credit: 987.65, tax: 1776.78, fee: 100.0, deposit: 0 },
    totals: { originCost: 10864.19, discountedCost: 9777.77 },
  },
]

export function RecentTransactions() {
  return (
    <div className="space-y-4">
      {transactions.map((transaction, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{transaction.customer}</span>
              <span className="text-xs text-muted-foreground">{transaction.period}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {transaction.lineItems.usage > 0 && (
                <Badge variant="secondary" className="bg-[#EC9400]/10 text-[#EC9400] hover:bg-[#EC9400]/20">
                  Usage: {formatCurrency(transaction.lineItems.usage)}
                </Badge>
              )}
              {transaction.lineItems.credit > 0 && (
                <Badge variant="secondary" className="bg-[#026172]/10 text-[#026172] hover:bg-[#026172]/20">
                  Credit: {formatCurrency(transaction.lineItems.credit)}
                </Badge>
              )}
              {transaction.lineItems.tax > 0 && (
                <Badge variant="secondary" className="bg-[#909090]/10 text-[#909090] hover:bg-[#909090]/20">
                  Tax: {formatCurrency(transaction.lineItems.tax)}
                </Badge>
              )}
              {transaction.lineItems.fee > 0 && (
                <Badge variant="secondary" className="bg-[#00243E]/10 text-[#00243E] hover:bg-[#00243E]/20">
                  Fee: {formatCurrency(transaction.lineItems.fee)}
                </Badge>
              )}
              {transaction.lineItems.deposit > 0 && (
                <Badge variant="secondary" className="bg-[#026172]/10 text-[#026172] hover:bg-[#026172]/20">
                  Deposit: {formatCurrency(transaction.lineItems.deposit)}
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-foreground">
              {formatCurrency(transaction.totals.discountedCost)}
            </div>
            <div className="text-xs text-muted-foreground line-through">
              {formatCurrency(transaction.totals.originCost)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
