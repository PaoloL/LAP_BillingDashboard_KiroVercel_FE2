"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/format"
import type { TimeRange } from "@/lib/types"

interface DiscountMetricsProps {
  timeRange: TimeRange
}

// Mock data - would come from API based on timeRange
const discountByPayerData = [
  { name: "Production Payer", value: 4200 },
  { name: "Development Payer", value: 2800 },
]

const discountByAccountData = [
  { name: "Acme Corp", value: 2340 },
  { name: "TechStart", value: 1870 },
  { name: "Global Solutions", value: 1470 },
  { name: "Innovation Labs", value: 799 },
  { name: "Digital Ventures", value: 521 },
]

export function DiscountMetrics({ timeRange }: DiscountMetricsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Metric C: Total Discount by Payer Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#00243E]">Total Discount by Payer Account</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={discountByPayerData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis type="number" tickFormatter={(value) => `€${(value / 1000).toFixed(1)}k`} />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px" }}
              />
              <Bar dataKey="value" fill="#026172" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Metric D: Total Discount by Usage Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#00243E]">Total Discount by Usage Account (Top 5)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={discountByAccountData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(1)}k`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e5e5", borderRadius: "8px" }}
              />
              <Bar dataKey="value" fill="#026172" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
