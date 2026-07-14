"use server";

import { createClient } from "@/lib/server";
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
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_accounts")
    .select("user_id")
    .eq("bot_username", username)
    .eq("user_id", userId)
    .single();
  if (!data) throw new Error("Forbidden");
}

export async function listBotAccounts() {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const supabase = await createClient();
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

  return (accounts ?? []) as { username: string; enabled: boolean; last_started_at: number | null }[];
}

export async function getBotAccount(username: string): Promise<{ config: AccountConfigForm; isAdmin: boolean }> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  await assertOwnership(username, session.user.id);

  const supabase = await createClient();
  const [{ data: account }, admin] = await Promise.all([
    supabase
      .from("accounts")
      .select("config_json")
      .eq("username", username)
      .single(),
    isAdmin(session.user.id),
  ]);

  if (!account) throw new Error("Account not found");

  let raw: Record<string, unknown> = {};
  try { raw = coerceNullToUndefined(JSON.parse(account.config_json)) as Record<string, unknown>; } catch { /* ignore */ }
  const config = deepMergeDefaults(DEFAULT_CONFIG, { ...raw, username });
  return { config, isAdmin: admin };
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
  await assertOwnership(username, session.user.id);

  const supabase = await createClient();
  await supabase
    .from("user_accounts")
    .delete()
    .eq("bot_username", username)
    .eq("user_id", session.user.id);
  await supabase
    .from("accounts")
    .delete()
    .eq("username", username);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
