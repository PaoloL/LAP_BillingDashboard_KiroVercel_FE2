import { ExchangeRateSettings } from "@/components/exchange-rate-settings"

export function SettingsPageContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#00243E]">Settings</h1>
        <p className="mt-2 text-muted-foreground">Configure your application settings</p>
      </div>

      <ExchangeRateSettings />
    </div>
  )
}
