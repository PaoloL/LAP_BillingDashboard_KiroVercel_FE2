"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { ExchangeRateSettings } from "@/components/exchange-rate-settings"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"exchange-rate" | "users">("exchange-rate")

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#00243E]">Settings</h1>
          <p className="mt-2 text-muted-foreground">Configure application settings and preferences</p>
        </div>

        <div className="mb-6 border-b border-border">
          <nav className="-mb-px flex gap-6">
            <button
              onClick={() => setActiveTab("exchange-rate")}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                activeTab === "exchange-rate"
                  ? "border-[#026172] text-[#026172]"
                  : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
              }`}
            >
              Exchange Rate
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "border-[#026172] text-[#026172]"
                  : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
              }`}
            >
              Users
            </button>
          </nav>
        </div>

        {activeTab === "exchange-rate" && <ExchangeRateSettings />}

        {activeTab === "users" && (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <h3 className="text-lg font-semibold text-[#00243E]">User Management</h3>
            <p className="mt-2 text-muted-foreground">To be implemented</p>
          </div>
        )}
      </main>
    </div>
  )
}
