import { listBotAccounts } from "@/actions/accounts";
import { AccountsGrid } from "@/components/dashboard/AccountsGrid";
import { NewAccountModal } from "@/components/dashboard/NewAccountModal";

export default async function DashboardPage() {
  const accounts = await listBotAccounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bot accounts</h1>
        <NewAccountModal />
      </div>
      {accounts.length === 0 ? (
        <p className="text-muted-foreground">No accounts yet. Add one to get started.</p>
      ) : (
        <AccountsGrid accounts={accounts} />
      )}
    </div>
  );
}
