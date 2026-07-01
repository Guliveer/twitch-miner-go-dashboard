"use server";

import { db } from "@/db";
import { userMeta, userAccounts } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, sql, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  const meta = await db.query.userMeta.findFirst({ where: eq(userMeta.userId, session.user.id) });
  if (meta?.role !== "admin") throw new Error("Forbidden");
}

export async function listUnclaimedAccounts(): Promise<string[]> {
  await assertAdmin();
  const claimed = await db.select({ botUsername: userAccounts.botUsername }).from(userAccounts);
  const claimedNames = claimed.map((r) => r.botUsername);

  const result = claimedNames.length > 0
    ? await db.execute(sql`SELECT username FROM accounts WHERE username != ALL(${claimedNames}::text[])`)
    : await db.execute(sql`SELECT username FROM accounts`);

  return (result.rows as { username: string }[]).map((r) => r.username);
}

export async function claimAccountForUser(botUsername: string, targetUserId: string): Promise<void> {
  await assertAdmin();
  await db.insert(userAccounts).values({ userId: targetUserId, botUsername }).onConflictDoNothing();
  revalidatePath("/admin/accounts");
  revalidatePath("/dashboard");
}
