import { formatCurrency } from "@/lib/format"
import type { RecentTransaction } from "@/lib/types"

// Mock data - would come from API
const recentTransactions: RecentTransaction[] = [
  { id: "1", date: "15/01/2025", accountName: "Acme Corp", type: "Usage", amount: 12345.67 },
  { id: "2", date: "14/01/2025", accountName: "TechStart", type: "Credit", amount: 1234.56 },
  { id: "3", date: "13/01/2025", accountName: "Global Solutions", type: "Usage", amount: 15678.9 },
  { id: "4", date: "12/01/2025", accountName: "Innovation Labs", type: "Deposit", amount: 3000.0 },
  { id: "5", date: "11/01/2025", accountName: "Digital Ventures", type: "Usage", amount: 9876.54 },
  { id: "6", date: "10/01/2025", accountName: "Acme Corp", type: "Fee", amount: 100.0 },
  { id: "7", date: "09/01/2025", accountName: "TechStart", type: "Usage", amount: 8765.43 },
  { id: "8", date: "08/01/2025", accountName: "Global Solutions", type: "Credit", amount: 876.54 },
  { id: "9", date: "07/01/2025", accountName: "Innovation Labs", type: "Usage", amount: 6543.21 },
  { id: "10", date: "06/01/2025", accountName: "Digital Ventures", type: "Deposit", amount: 5000.0 },
]

const getTypeBadge = (type: RecentTransaction["type"]) => {
  const styles = {
    Usage: "bg-[#EC9400]",
    Credit: "bg-[#026172]",
    Deposit: "bg-[#026172]",
    Fee: "bg-[#00243E]",
  }
  return <span className={`inline-block h-2 w-2 rounded-full ${styles[type]}`} />
}

export function LatestTransactionsTable() {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Account</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-background">
          {recentTransactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-muted/50">
              <td className="px-4 py-3 text-sm text-muted-foreground">{transaction.date}</td>
              <td className="px-4 py-3 text-sm font-semibold text-foreground">{transaction.accountName}</td>
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  {getTypeBadge(transaction.type)}
                  <span className="text-muted-foreground">{transaction.type}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                {formatCurrency(transaction.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
