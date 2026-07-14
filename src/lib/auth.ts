import { createClient, createAdminClient } from "@/lib/server";
import type { Session, User } from "@supabase/supabase-js";

export type { Session, User };

export async function getSession(): Promise<{ session: Session; user: User } | null> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return { session, user: session.user };
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("No user email found");
  
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (verifyError) throw new Error("Current password is incorrect");

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function updateDisplayName(name: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { display_name: name } });
  if (error) throw error;
}

export async function createUser(email: string, name: string, tempPassword: string) {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { display_name: name },
  });
  if (error) throw error;
  return data.user;
}

export async function resetUserPassword(userId: string, newPassword: string) {
  const supabase = await createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password: newPassword,
  });
  if (error) throw error;
}
