import { createAdminClient } from "@/lib/server";
import { UsersTable } from "@/components/admin/UsersTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default async function AdminUsersPage() {
  const supabase = await createAdminClient();

  const [metasResult, authUsersResult] = await Promise.all([
    supabase.from("user_meta").select("*"),
    supabase.auth.admin.listUsers(),
  ]);

  const metas = metasResult.data ?? [];
  const authUsers = authUsersResult.data?.users ?? [];

  const users = metas.map((m) => {
    const au = authUsers.find((u) => u.id === m.user_id);
    return {
      id: m.user_id,
      email: au?.email ?? "unknown",
      name: au?.user_metadata?.display_name ?? null,
      mustChangePassword: m.must_change_password,
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
