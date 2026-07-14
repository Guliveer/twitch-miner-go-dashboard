import { listUnclaimedAccounts } from "@/actions/admin";
import { createAdminClient } from "@/lib/server";
import { ClaimAccountForm } from "@/components/admin/ClaimAccountForm";

export default async function AdminAccountsPage() {
  const supabase = await createAdminClient();

  const [unclaimed, metasResult, authUsersResult] = await Promise.all([
    listUnclaimedAccounts(),
    supabase.from("user_meta").select("*"),
    supabase.auth.admin.listUsers(),
  ]);

  const metas = metasResult.data ?? [];
  const authUsers = authUsersResult.data?.users ?? [];

  const users = metas.map((m) => {
    const au = authUsers.find((u) => u.id === m.user_id);
    return { id: m.user_id, label: au?.user_metadata?.display_name || au?.email || "unknown" };
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Bot accounts</h1>
        <p className="text-sm text-muted-foreground mt-1">Assign bot accounts to users</p>
      </div>
      <ClaimAccountForm unclaimedAccounts={unclaimed} users={users} />
      {unclaimed.length === 0 && (
        <p className="text-sm text-muted-foreground">All bot accounts are assigned to users.</p>
      )}
    </div>
  );
}
