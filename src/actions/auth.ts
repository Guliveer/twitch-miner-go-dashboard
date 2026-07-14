"use server";

import { getSession, signIn as authSignIn, signOut as authSignOut, changePassword as authChangePassword, updateDisplayName as authUpdateDisplayName, createUser as authCreateUser, resetUserPassword as authResetUserPassword } from "@/lib/auth";
import { createClient } from "@/lib/server";
import { generatePassword } from "@/lib/utils";
import { redirect } from "next/navigation";

export async function signOut() {
  await authSignOut();
  redirect("/login");
}

export async function signIn(email: string, password: string) {
  await authSignIn(email, password);
  redirect("/dashboard");
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  await authChangePassword(currentPassword, newPassword);

  const supabase = await createClient();
  await supabase
    .from("user_meta")
    .update({ must_change_password: false })
    .eq("user_id", session.user.id);

  redirect("/dashboard");
}

export async function changePasswordWithVerification(currentPassword: string, newPassword: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  await authChangePassword(currentPassword, newPassword);
}

export async function updateDisplayName(name: string) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  await authUpdateDisplayName(name);
}

export async function createUser(email: string, name: string): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { data: meta } = await supabase
    .from("user_meta")
    .select("role")
    .eq("user_id", session.user.id)
    .single();
  if (meta?.role !== "admin") throw new Error("Forbidden");

  const tempPassword = generatePassword();
  const user = await authCreateUser(email, name, tempPassword);

  await supabase.from("user_meta").insert({
    user_id: user.id,
    must_change_password: true,
    role: "user",
  });

  return tempPassword;
}

export async function resetUserPassword(targetUserId: string): Promise<string> {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const supabase = await createClient();
  const { data: meta } = await supabase
    .from("user_meta")
    .select("role")
    .eq("user_id", session.user.id)
    .single();
  if (meta?.role !== "admin") throw new Error("Forbidden");

  const tempPassword = generatePassword();
  await authResetUserPassword(targetUserId, tempPassword);

  await supabase
    .from("user_meta")
    .update({ must_change_password: true })
    .eq("user_id", targetUserId);

  return tempPassword;
}
