import { DashboardNav } from "@/components/dashboard-nav"
import { AccountsGrid } from "@/components/accounts-grid"
import { UnregisteredAlert } from "@/components/unregistered-alert"

export default function AccountsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[#00243E]">Accounts</h1>
          <p className="mt-2 text-muted-foreground">Manage your payer and usage accounts</p>
        </div>

        <UnregisteredAlert />
        <AccountsGrid />
      </main>
    </div>
  )
}
