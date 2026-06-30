import { db } from "@/db";
import { userMeta } from "@/db/schema";
import { auth } from "@/lib/auth";
import { UsersTable } from "@/components/admin/UsersTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminUsersPage() {
  const metas = await db.select().from(userMeta);

  const { data: authData } = await auth.admin.listUsers({ query: {} });
  const authUsers = (authData?.users ?? []) as { id: string; email: string }[];

  const users = metas.map((m) => {
    const au = authUsers.find((u) => u.id === m.userId);
    return {
      id: m.userId,
      email: au?.email ?? "unknown",
      mustChangePassword: m.mustChangePassword,
      role: m.role,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button render={<Link href="/admin/users/new" />}>New user</Button>
      </div>
      <UsersTable users={users} />
    </div>
  );
}
