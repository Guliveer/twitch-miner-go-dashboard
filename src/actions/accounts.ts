"use server";

import { db } from "@/db";
import { userMeta, userAccounts } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { accountConfigSchema, DEFAULT_CONFIG, type AccountConfigForm } from "@/lib/config-schema";
import {
  coerceNullToUndefined,
  enforceNonAdminConfig,
  prepareConfigJson,
} from "@/lib/config-transform";
import { and, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function isAdmin(userId: string): Promise<boolean> {
  const meta = await db.query.userMeta.findFirst({ where: eq(userMeta.userId, userId) });
  return meta?.role === "admin";
}

async function assertOwnership(username: string, userId: string) {
  const row = await db.query.userAccounts.findFirst({
    where: and(eq(userAccounts.botUsername, username), eq(userAccounts.userId, userId)),
  });
  if (!row) throw new Error("Forbidden");
}

export async function listBotAccounts() {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const rows = await db.query.userAccounts.findMany({
    where: eq(userAccounts.userId, session.user.id),
  });

  if (rows.length === 0) return [];

  const usernames = rows.map((r) => r.botUsername);
  const result = await db.execute(
    sql`SELECT username, enabled, last_started_at FROM accounts WHERE username = ANY(ARRAY[${sql.join(usernames.map((u) => sql`${u}`), sql`, `)}]::text[])`,
  );

  return result.rows as { username: string; enabled: boolean; last_started_at: number | null }[];
}

export async function getBotAccount(username: string): Promise<{ config: AccountConfigForm; isAdmin: boolean }> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  await assertOwnership(username, session.user.id);

  const [result, admin] = await Promise.all([
    db.execute(sql`SELECT config_json FROM accounts WHERE username = ${username}`),
    isAdmin(session.user.id),
  ]);
  const row = result.rows[0] as { config_json: string } | undefined;
  if (!row) throw new Error("Account not found");

  let raw: Record<string, unknown> = {};
  try { raw = coerceNullToUndefined(JSON.parse(row.config_json)) as Record<string, unknown>; } catch { /* ignore */ }
  // Merge with defaults so new/missing fields always have a value for the form
  const config = { ...DEFAULT_CONFIG, ...raw, username } as AccountConfigForm;
  return { config, isAdmin: admin };
}

export async function createBotAccount(username: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const existing = await db.execute(
    sql`SELECT username FROM accounts WHERE username = ${username}`,
  );
  if ((existing.rows as unknown[]).length > 0) throw new Error("Username already exists");

  const admin = await isAdmin(session.user.id);
  const base: AccountConfigForm = { ...DEFAULT_CONFIG, username };
  const config = admin ? base : enforceNonAdminConfig(base);
  const configJson = prepareConfigJson(config);
  const enabled = config.enabled ?? true;
  const now = Math.floor(Date.now() / 1000);

  await db.execute(
    sql`INSERT INTO accounts (username, config_json, enabled, updated_at) VALUES (${username}, ${configJson}, ${enabled}, ${now})`,
  );
  await db.insert(userAccounts).values({ userId: session.user.id, botUsername: username });

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
  // Prevent username field inside config_json from diverging from the URL parameter
  validated.username = username;
  const configJson = prepareConfigJson(validated);
  const enabled = validated.enabled ?? true;
  const now = Math.floor(Date.now() / 1000);

  await db.execute(
    sql`UPDATE accounts SET config_json = ${configJson}, enabled = ${enabled}, updated_at = ${now} WHERE username = ${username}`,
  );

  revalidatePath(`/dashboard/${username}`);
}

export async function toggleEnabled(username: string, enabled: boolean) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  await assertOwnership(username, session.user.id);

  const now = Math.floor(Date.now() / 1000);

  await db.execute(
    sql`UPDATE accounts SET enabled = ${enabled}, config_json = (config_json::jsonb || jsonb_build_object('enabled', ${enabled}))::text, updated_at = ${now} WHERE username = ${username}`,
  );

  revalidatePath("/dashboard");
}

export async function deleteBotAccount(username: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  await assertOwnership(username, session.user.id);

  await db.batch([
    db.delete(userAccounts).where(
      and(eq(userAccounts.botUsername, username), eq(userAccounts.userId, session.user.id)),
    ),
    db.execute(sql`DELETE FROM accounts WHERE username = ${username}`),
  ]);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
