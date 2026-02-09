"use client"

import { cn } from "@/lib/utils"
import type { TimeRange } from "@/lib/types"

interface TimeFilterProps {
  value: TimeRange
  onChange: (value: TimeRange) => void
}

const options: { label: string; value: TimeRange }[] = [
  { label: "MTD", value: "MTD" },
  { label: "3M", value: "3M" },
  { label: "6M", value: "6M" },
  { label: "YTD", value: "YTD" },
]

export function TimeFilter({ value, onChange }: TimeFilterProps) {
  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-card p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-all rounded-md",
            value === option.value
              ? "bg-secondary text-secondary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
