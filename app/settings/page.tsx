"use client"

import { DashboardNav } from "@/components/dashboard-nav"
import { ExchangeRateSettings } from "@/components/exchange-rate-settings"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#00243E]">Settings</h1>
          <p className="mt-2 text-muted-foreground">Configure application settings and preferences</p>
        </div>

        <ExchangeRateSettings />
      </main>
    </div>
  )
}
