"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/format"
import { PieChart as PieChartIcon } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface CostCenterBalance {
  costCenterId: string
  costCenterName: string
  totalCost: number
}

interface CostByCenterWidgetProps {
  costCenterBalances: CostCenterBalance[]
}

const COLORS = ['#026172', '#EC9400', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899']

export function CostByCenterWidget({ costCenterBalances }: CostByCenterWidgetProps) {
  const pieData = costCenterBalances.map((cc) => ({
    name: cc.costCenterName,
    value: cc.totalCost,
  }))

  const totalCost = costCenterBalances.reduce((sum, cc) => sum + cc.totalCost, 0)

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <PieChartIcon className="h-4 w-4 text-secondary" />
          Cost by Center
        </CardTitle>
      </CardHeader>
      <CardContent>
        {costCenterBalances.length > 0 && totalCost > 0 ? (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            No cost center data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
