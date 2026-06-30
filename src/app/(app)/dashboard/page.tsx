import { listBotAccounts } from "@/actions/accounts";
import { AccountCard } from "@/components/dashboard/AccountCard";
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((a) => (
            <AccountCard
              key={a.username}
              username={a.username}
              enabled={a.enabled}
              lastStartedAt={a.last_started_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}
