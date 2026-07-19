import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";
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

  const supabase = await createClient();

  const [userResult, ownedResult, metaResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("user_accounts")
      .select("bot_username")
      .eq("user_id", session.user.id),
    supabase
      .from("user_meta")
      .select("role")
      .eq("user_id", session.user.id)
      .single(),
  ]);

  const user = userResult.data.user;
  const owned = ownedResult.data ?? [];
  const isAdmin = metaResult.data?.role === "admin";

  let botAccounts: BotAccountRow[] = [];
  if (owned && owned.length > 0) {
    const usernames = owned.map((r: { bot_username: string }) => r.bot_username);
    const { data: accounts } = await supabase
      .from("accounts")
      .select("username, enabled, updated_at, last_started_at")
      .in("username", usernames)
      .order("username");
    botAccounts = (accounts as BotAccountRow[]) ?? [];
  }

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <SettingsForm
        name={user?.user_metadata?.display_name ?? ""}
        email={user?.email ?? ""}
        botAccounts={botAccounts}
        isAdmin={isAdmin}
      />
    </div>
  );
}
