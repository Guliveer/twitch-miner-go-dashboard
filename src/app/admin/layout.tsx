import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { userMeta } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const meta = await db.query.userMeta.findFirst({
    where: eq(userMeta.userId, session.user.id),
  });
  if (meta?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-3 flex items-center gap-6">
        <span className="font-semibold">Admin</span>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin/users" className="text-muted-foreground hover:text-foreground transition-colors">Users</Link>
          <Link href="/admin/accounts" className="text-muted-foreground hover:text-foreground transition-colors">Bot accounts</Link>
        </nav>
        <div className="ml-auto">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Dashboard</Link>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
