"use server";

import { auth, getSession } from "@/lib/auth";
import { db } from "@/db";
import { userMeta } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generatePassword } from "@/lib/utils";
import { redirect } from "next/navigation";

export async function signOut() {
  await auth.signOut();
  redirect("/login");
}

export async function signIn(email: string, password: string) {
  const result = await auth.signIn.email({ email, password });
  if (result.error) throw new Error(result.error.message);
  redirect("/dashboard");
}

export async function changePassword(newPassword: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const result = await auth.admin.setUserPassword({
    userId: session.user.id,
    newPassword,
  });
  if (result.error) throw new Error(result.error.message);

  await db
    .update(userMeta)
    .set({ mustChangePassword: false })
    .where(eq(userMeta.userId, session.user.id));

  redirect("/dashboard");
}

export async function resetPassword(newPassword: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  
  // Reset password directly without sending email
  const result = await auth.admin.setUserPassword({
    userId: session.user.id,
    newPassword,
  });
  if (result.error) throw new Error(result.error.message);
}

export async function changePasswordWithVerification(currentPassword: string, newPassword: string) {
  const result = await auth.changePassword({
    currentPassword,
    newPassword,
  });
  if (result.error) throw new Error(result.error.message);
}

export async function updateDisplayName(name: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const result = await auth.updateUser({ name });
  if (result.error) throw new Error(result.error.message);
}

export async function createUser(email: string, name: string): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const meta = await db.query.userMeta.findFirst({
    where: eq(userMeta.userId, session.user.id),
  });
  if (meta?.role !== "admin") throw new Error("Forbidden");

  const tempPassword = generatePassword();

  const result = await auth.admin.createUser({
    email,
    name,
    password: tempPassword,
    role: "user",
  });
  if (result.error) throw new Error(result.error.message);

  await db.insert(userMeta).values({
    userId: result.data!.user.id,
    mustChangePassword: true,
    role: "user",
  });

  return tempPassword;
}

export async function resetUserPassword(targetUserId: string): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const meta = await db.query.userMeta.findFirst({
    where: eq(userMeta.userId, session.user.id),
  });
  if (meta?.role !== "admin") throw new Error("Forbidden");

  const tempPassword = generatePassword();

  const result = await auth.admin.setUserPassword({
    userId: targetUserId,
    newPassword: tempPassword,
  });
  if (result.error) throw new Error(result.error.message);

  await db
    .update(userMeta)
    .set({ mustChangePassword: true })
    .where(eq(userMeta.userId, targetUserId));

  return tempPassword;
}
