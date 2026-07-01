import { listUnclaimedAccounts } from "@/actions/admin";
import { db } from "@/db";
import { userMeta } from "@/db/schema";
import { neon } from "@neondatabase/serverless";
import { ClaimAccountForm } from "@/components/admin/ClaimAccountForm";

export default async function AdminAccountsPage() {
  const sql = neon(process.env.DB_DSN!);

  const [unclaimed, metas, authUsers] = await Promise.all([
    listUnclaimedAccounts(),
    db.select().from(userMeta),
    sql`SELECT id, email, name FROM neon_auth."user"` as unknown as Promise<{ id: string; email: string; name: string }[]>,
  ]);

  const users = metas.map((m) => {
    const au = (authUsers as { id: string; email: string; name: string }[]).find((u) => u.id === m.userId);
    return { id: m.userId, label: au?.name || au?.email || "unknown" };
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
