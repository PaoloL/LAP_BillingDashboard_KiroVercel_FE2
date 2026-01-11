"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Line,
} from "recharts"
import { formatCurrency } from "@/lib/format"
import type { TimeRange } from "@/lib/types"

interface CostChartsProps {
  timeRange: TimeRange
}

const costByPayerData = [
  { name: "Production Payer", value: 28500 },
  { name: "Development Payer", value: 17178.9 },
]

const costByUsageData = [
  { name: "Acme Corp", value: 15600 },
  { name: "TechStart", value: 12450 },
  { name: "Global Solutions", value: 9800 },
  { name: "Innovation Labs", value: 5328.9 },
  { name: "Digital Ventures", value: 2500 },
]

const trendData = [
  { date: "Week 1", usage: 8500, deposit: 10000 },
  { date: "Week 2", usage: 10200, deposit: 12000 },
  { date: "Week 3", usage: 12800, deposit: 13500 },
  { date: "Week 4", usage: 14178.9, deposit: 15000 },
]

export function CostCharts({ timeRange }: CostChartsProps) {
  return (
    <div className="space-y-6">
      {/* Row 2: Cost Breakdown Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#00243E]">Cost by Payer Account</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costByPayerData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis type="number" tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px" }}
                />
                <Bar dataKey="value" fill="#00243E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#00243E]">Cost by Usage Account (Top 5)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costByUsageData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px" }}
                />
                <Bar dataKey="value" fill="#EC9400" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Financial Health Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#00243E]">Usage vs Deposit Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px" }}
              />
              <Area
                type="monotone"
                dataKey="deposit"
                fill="#026172"
                fillOpacity={0.2}
                stroke="#026172"
                strokeWidth={2}
              />
              <Line type="monotone" dataKey="usage" stroke="#EC9400" strokeWidth={2} dot={{ fill: "#EC9400", r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
