import { listUnclaimedAccounts } from "@/actions/admin";
import { db } from "@/db";
import { userMeta } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ClaimAccountForm } from "@/components/admin/ClaimAccountForm";

export default async function AdminAccountsPage() {
  const [unclaimed, metas, authResult] = await Promise.all([
    listUnclaimedAccounts(),
    db.select().from(userMeta),
    auth.admin.listUsers({ query: {} }),
  ]);

  if (!authResult.data) throw new Error("Failed to load users");
  const authUsers = authResult.data.users as { id: string; email: string }[];

  const users = metas.map((m) => {
    const au = authUsers.find((u) => u.id === m.userId);
    return { id: m.userId, email: au?.email ?? "unknown" };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bot accounts</h1>
      <ClaimAccountForm unclaimedAccounts={unclaimed} users={users} />
      {unclaimed.length === 0 && (
        <p className="text-sm text-muted-foreground">All bot accounts are assigned to users.</p>
      )}
    </div>
  );
}
