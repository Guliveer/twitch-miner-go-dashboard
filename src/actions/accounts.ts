"use server";

import { createClient, createAdminClient } from "@/lib/server";
import { getSession } from "@/lib/auth";
import { accountConfigSchema, DEFAULT_CONFIG, type AccountConfigForm } from "@/lib/config-schema";
import {
  coerceNullToUndefined,
  deepMergeDefaults,
  enforceNonAdminConfig,
  prepareConfigJson,
} from "@/lib/config-transform";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_meta")
    .select("role")
    .eq("user_id", userId)
    .single();
  return data?.role === "admin";
}

async function assertOwnership(username: string, userId: string) {
  const admin = await isAdmin(userId);
  if (admin) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("user_accounts")
    .select("user_id")
    .eq("bot_username", username)
    .eq("user_id", userId)
    .single();
  if (!data) throw new Error("Forbidden");
}

export type BotAccountListItem = {
  username: string;
  enabled: boolean;
  last_started_at: number | null;
  ownerDisplayName?: string;
  isOwnAccount: boolean;
  isUnclaimed: boolean;
};

export async function listBotAccounts(): Promise<BotAccountListItem[]> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const admin = await isAdmin(session.user.id);
  const supabase = admin ? await createAdminClient() : await createClient();

  if (admin) {
    const [accountsResult, linksResult, metasResult, authUsersResult] = await Promise.all([
      supabase.from("accounts").select("username, enabled, last_started_at"),
      supabase.from("user_accounts").select("user_id, bot_username"),
      supabase.from("user_meta").select("user_id, role"),
      supabase.auth.admin.listUsers(),
    ]);

    const accounts = accountsResult.data ?? [];
    const links = linksResult.data ?? [];
    const metas = metasResult.data ?? [];
    const authUsers = authUsersResult.data?.users ?? [];

    const usernameToOwner = new Map<string, string>();
    for (const link of links) {
      const meta = metas.find((m) => m.user_id === link.user_id);
      if (meta?.role === "admin") continue;
      const au = authUsers.find((u) => u.id === link.user_id);
      const displayName = au?.user_metadata?.display_name || au?.email || null;
      if (displayName) usernameToOwner.set(link.bot_username, displayName);
    }

    return accounts.map((a) => {
      const owner = usernameToOwner.get(a.username);
      return {
        username: a.username,
        enabled: a.enabled,
        last_started_at: a.last_started_at,
        ownerDisplayName: owner ?? undefined,
        isOwnAccount: !owner && links.some((l) => l.bot_username === a.username && metas.some((m) => m.user_id === l.user_id && m.role === "admin")),
        isUnclaimed: !links.some((l) => l.bot_username === a.username),
      };
    });
  }

  const { data: owned } = await supabase
    .from("user_accounts")
    .select("bot_username")
    .eq("user_id", session.user.id);

  if (!owned || owned.length === 0) return [];

  const usernames = owned.map((r) => r.bot_username);
  const { data: accounts } = await supabase
    .from("accounts")
    .select("username, enabled, last_started_at")
    .in("username", usernames);

  return (accounts ?? []).map((a) => ({
    ...a,
    isOwnAccount: true,
    isUnclaimed: false,
  }));
}

export async function getBotAccount(username: string): Promise<{ config: AccountConfigForm; isAdmin: boolean; ownerDisplayName?: string }> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const admin = await isAdmin(session.user.id);
  if (!admin) await assertOwnership(username, session.user.id);

  const supabase = admin ? await createAdminClient() : await createClient();

  let ownerDisplayName: string | undefined;
  if (admin) {
    const { data: link } = await supabase
      .from("user_accounts")
      .select("user_id")
      .eq("bot_username", username)
      .single();
    if (link) {
      const { data: meta } = await supabase
        .from("user_meta")
        .select("role")
        .eq("user_id", link.user_id)
        .single();
      if (meta?.role !== "admin") {
        const { data: authUser } = await supabase.auth.admin.getUserById(link.user_id);
        ownerDisplayName = authUser?.user?.user_metadata?.display_name || authUser?.user?.email || undefined;
      }
    }
  }

  const { data: account } = await supabase
    .from("accounts")
    .select("config_json")
    .eq("username", username)
    .single();

  if (!account) throw new Error("Account not found");

  let raw: Record<string, unknown> = {};
  try { raw = coerceNullToUndefined(JSON.parse(account.config_json)) as Record<string, unknown>; } catch { /* ignore */ }
  const config = deepMergeDefaults(DEFAULT_CONFIG, { ...raw, username });
  return { config, isAdmin: admin, ownerDisplayName };
}

export async function createBotAccount(username: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("accounts")
    .select("username")
    .eq("username", username)
    .single();
  if (existing) throw new Error("Username already exists");

  const admin = await isAdmin(session.user.id);

  if (!admin) {
    const { data: owned } = await supabase
      .from("user_accounts")
      .select("bot_username")
      .eq("user_id", session.user.id);
    if (owned && owned.length >= 1) throw new Error("Non-admin accounts are limited to 1 bot account. Set up twitch-miner-go yourself to remove this limit.");
  }

  const base: AccountConfigForm = { ...DEFAULT_CONFIG, username };
  const config = admin ? base : enforceNonAdminConfig(base);
  const configJson = prepareConfigJson(config);
  const enabled = config.enabled ?? true;
  const now = Math.floor(Date.now() / 1000);

  await supabase.from("accounts").insert({
    username,
    config_json: configJson,
    enabled,
    updated_at: now,
  });
  await supabase.from("user_accounts").insert({
    user_id: session.user.id,
    bot_username: username,
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/${username}`);
}

export async function updateBotAccount(username: string, config: AccountConfigForm) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  await assertOwnership(username, session.user.id);

  const admin = await isAdmin(session.user.id);
  const sanitised = admin ? config : enforceNonAdminConfig(config);
  const validated = accountConfigSchema.parse(sanitised);
  validated.username = username;
  const configJson = prepareConfigJson(validated);
  const enabled = validated.enabled ?? true;
  const now = Math.floor(Date.now() / 1000);

  const supabase = await createClient();
  await supabase
    .from("accounts")
    .update({ config_json: configJson, enabled, updated_at: now })
    .eq("username", username);

  revalidatePath(`/dashboard/${username}`);
}

export async function toggleEnabled(username: string, enabled: boolean) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  await assertOwnership(username, session.user.id);

  const now = Math.floor(Date.now() / 1000);
  const supabase = await createClient();

  await supabase
    .from("accounts")
    .update({ enabled, updated_at: now })
    .eq("username", username);

  revalidatePath("/dashboard");
}

export async function deleteBotAccount(username: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { data: meta } = await supabase
    .from("user_meta")
    .select("role")
    .eq("user_id", session.user.id)
    .single();
  if (meta?.role === "admin") throw new Error("Admins cannot delete accounts");

  const { data } = await supabase
    .from("user_accounts")
    .select("user_id")
    .eq("bot_username", username)
    .eq("user_id", session.user.id)
    .single();
  if (!data) throw new Error("Forbidden");

  await supabase
    .from("user_accounts")
    .delete()
    .eq("bot_username", username);
  await supabase
    .from("accounts")
    .delete()
    .eq("username", username);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
