import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { db } from "@/db";
import { userAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SettingsForm } from "@/components/settings/SettingsForm";

type BotAccountRow = {
  username: string;
  enabled: boolean;
  updated_at: number;
  last_started_at: number | null;
};

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const sql = neon(process.env.DB_DSN!);

  const [userRows, owned] = await Promise.all([
    sql`SELECT name, email FROM neon_auth."user" WHERE id = ${session.user.id}`,
    db.select({ botUsername: userAccounts.botUsername }).from(userAccounts).where(eq(userAccounts.userId, session.user.id)),
  ]);

  const user = userRows[0] as { name: string; email: string } | undefined;

  let botAccounts: BotAccountRow[] = [];
  if (owned.length > 0) {
    const usernames = owned.map((r) => r.botUsername);
    const rows = await sql`
      SELECT username, enabled, updated_at, last_started_at
      FROM accounts
      WHERE username = ANY(${usernames}::text[])
      ORDER BY username
    `;
    botAccounts = rows as BotAccountRow[];
  }

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <SettingsForm
        name={user?.name ?? ""}
        email={user?.email ?? ""}
        botAccounts={botAccounts}
      />
    </div>
  );
}
