import { listBotAccounts } from "@/actions/accounts";
import { AccountsGrid } from "@/components/dashboard/AccountsGrid";
import { NewAccountModal } from "@/components/dashboard/NewAccountModal";
import { Bot } from "lucide-react";

export default async function DashboardPage() {
  const accounts = await listBotAccounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Bot className="h-6 w-6" />
          Bot accounts
        </h1>
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
