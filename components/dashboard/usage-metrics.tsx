"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { formatCurrency } from "@/lib/format"
import type { TimeRange } from "@/lib/types"

interface UsageMetricsProps {
  timeRange: TimeRange
}

// Mock data - would come from API based on timeRange
const usageByPayerData = [
  { name: "Production Payer", value: 28500 },
  { name: "Development Payer", value: 17178.9 },
]

const usageByAccountData = [
  { name: "Acme Corp", value: 15600 },
  { name: "TechStart", value: 12450 },
  { name: "Global Solutions", value: 9800 },
  { name: "Innovation Labs", value: 5328.9 },
  { name: "Digital Ventures", value: 2500 },
]

const COLORS = ["#EC9400", "#EC9400"]

export function UsageMetrics({ timeRange }: UsageMetricsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Metric A: Total Usage by Payer Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#00243E]">Total Usage by Payer Account</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={usageByPayerData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#EC9400"
                dataKey="value"
              >
                {usageByPayerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#EC9400" opacity={1 - index * 0.3} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Metric B: Total Usage by Usage Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#00243E]">Total Usage by Usage Account (Top 5)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageByAccountData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
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
  )
}
