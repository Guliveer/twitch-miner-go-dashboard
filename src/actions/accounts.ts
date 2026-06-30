"use server";

import { db } from "@/db";
import { userAccounts } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { accountConfigSchema, DEFAULT_CONFIG, type AccountConfigForm } from "@/lib/config-schema";
import { and, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function assertOwnership(username: string, userId: string) {
  const row = await db.query.userAccounts.findFirst({
    where: and(eq(userAccounts.botUsername, username), eq(userAccounts.userId, userId)),
  });
  if (!row) throw new Error("Forbidden");
}

function stripEmptyStrings<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== ""),
  ) as T;
}

function prepareConfigJson(config: AccountConfigForm): string {
  const stripped = stripEmptyStrings(config);
  return JSON.stringify(stripped);
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
    sql`SELECT username, enabled, last_started_at FROM accounts WHERE username = ANY(${usernames}::text[])`,
  );

  return result.rows as { username: string; enabled: boolean; last_started_at: number | null }[];
}

export async function getBotAccount(username: string): Promise<AccountConfigForm> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  await assertOwnership(username, session.user.id);

  const result = await db.execute(
    sql`SELECT config_json FROM accounts WHERE username = ${username}`,
  );
  const row = result.rows[0] as { config_json: string } | undefined;
  if (!row) throw new Error("Account not found");

  let raw: unknown;
  try { raw = JSON.parse(row.config_json); } catch { raw = {}; }
  const parsed = accountConfigSchema.safeParse(raw);
  if (!parsed.success) {
    return { ...DEFAULT_CONFIG, username };
  }
  return parsed.data;
}

export async function createBotAccount(username: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const existing = await db.execute(
    sql`SELECT username FROM accounts WHERE username = ${username}`,
  );
  if ((existing.rows as unknown[]).length > 0) throw new Error("Username already exists");

  const config: AccountConfigForm = { ...DEFAULT_CONFIG, username };
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

  const validated = accountConfigSchema.parse(config);
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

  await db.delete(userAccounts).where(
    and(eq(userAccounts.botUsername, username), eq(userAccounts.userId, session.user.id)),
  );
  await db.execute(sql`DELETE FROM accounts WHERE username = ${username}`);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
