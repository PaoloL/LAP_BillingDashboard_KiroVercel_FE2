import { ExchangeRateSettings } from "@/components/exchange-rate-settings"

export default function Settings() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#00243E]">Settings</h1>
        <p className="mt-2 text-muted-foreground">Configure your application settings</p>
      </div>

      <ExchangeRateSettings />
    </main>
  )
}
