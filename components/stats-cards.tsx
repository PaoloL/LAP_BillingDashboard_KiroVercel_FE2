import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, PiggyBank, Activity } from "lucide-react"
import { formatCurrency } from "@/lib/format"
import type { TimeRange } from "@/lib/types"

interface StatsCardsProps {
  timeRange: TimeRange
}

export function StatsCards({ timeRange }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Spend",
      value: 45678.9,
      icon: TrendingUp,
      color: "text-[#EC9400]",
      bgColor: "bg-[#EC9400]/10",
    },
    {
      title: "Total Savings/Discounts",
      value: 8234.5,
      icon: PiggyBank,
      color: "text-[#026172]",
      bgColor: "bg-[#026172]/10",
    },
    {
      title: "Forecast",
      value: 52000.0,
      icon: Activity,
      color: "text-[#00243E]",
      bgColor: "bg-[#00243E]/10",
    },
  ]

  return (
    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", stat.bgColor)}>
                <Icon className={cn("h-5 w-5", stat.color)} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn("text-3xl font-bold", stat.color)}>{formatCurrency(stat.value)}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
