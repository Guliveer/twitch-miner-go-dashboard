import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import { SettingsForm } from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const sql = neon(process.env.DB_DSN!);
  const rows = await sql`SELECT name, email FROM neon_auth."user" WHERE id = ${session.user.id}`;
  const user = rows[0] as { name: string; email: string } | undefined;

  return (
    <div className="max-w-lg space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <SettingsForm name={user?.name ?? ""} email={user?.email ?? ""} />
    </div>
  );
}
