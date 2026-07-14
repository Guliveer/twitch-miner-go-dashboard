"use server";

import { createAdminClient } from "@/lib/server";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("user_meta")
    .select("role")
    .eq("user_id", session.user.id)
    .single();
  if (data?.role !== "admin") throw new Error("Forbidden");
}

export async function listUnclaimedAccounts(): Promise<string[]> {
  await assertAdmin();
  const supabase = await createAdminClient();

  const { data: claimed } = await supabase
    .from("user_accounts")
    .select("bot_username");

  const claimedNames = claimed?.map((r) => r.bot_username) ?? [];

  const { data: accounts } = await supabase
    .from("accounts")
    .select("username");

  if (!accounts) return [];

  const unclaimed = accounts
    .filter((a) => !claimedNames.includes(a.username))
    .map((a) => a.username);

  return unclaimed;
}

export async function claimAccountForUser(botUsername: string, targetUserId: string): Promise<void> {
  await assertAdmin();
  const supabase = await createAdminClient();
  await supabase
    .from("user_accounts")
    .upsert({ user_id: targetUserId, bot_username: botUsername }, { onConflict: "user_id,bot_username" });
  revalidatePath("/admin/accounts");
  revalidatePath("/dashboard");
}
