import { db } from "@/db";
import { userMeta } from "@/db/schema";
import { neon } from "@neondatabase/serverless";
import { UsersTable } from "@/components/admin/UsersTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default async function AdminUsersPage() {
  const metas = await db.select().from(userMeta);

  const sql = neon(process.env.DB_DSN!);
  const authUsers = await sql`SELECT id, email, name FROM neon_auth."user"` as {
    id: string;
    email: string;
    name: string | null;
  }[];

  const users = metas.map((m) => {
    const au = authUsers.find((u) => u.id === m.userId);
    return {
      id: m.userId,
      email: au?.email ?? "unknown",
      name: au?.name ?? null,
      mustChangePassword: m.mustChangePassword,
      role: m.role,
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage dashboard users</p>
        </div>
        <Link href="/admin/users/new">
          <Button>
            <UserPlus className="h-4 w-4" />
            New user
          </Button>
        </Link>
      </div>
      <UsersTable users={users} />
    </div>
  );
}
