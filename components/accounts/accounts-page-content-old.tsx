import { AccountsGrid } from "@/components/accounts/accounts-grid"
import { UnregisteredAlert } from "@/components/accounts/unregistered-alert"

export function AccountsPageContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#00243E]">Accounts</h1>
        <p className="mt-2 text-muted-foreground">Manage your payer and usage accounts</p>
      </div>

      <UnregisteredAlert />
      <AccountsGrid />
    </div>
  )
}
