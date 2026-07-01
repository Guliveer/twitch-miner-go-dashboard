import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { userMeta } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Users, Bot, LayoutDashboard } from "lucide-react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const meta = await db.query.userMeta.findFirst({
    where: eq(userMeta.userId, session.user.id),
  });
  if (meta?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-5xl px-6 py-3 flex items-center gap-6">
          <span className="font-semibold">Admin</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/users" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <Users className="h-4 w-4" />
              Users
            </Link>
            <Link href="/admin/accounts" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <Bot className="h-4 w-4" />
              Bot accounts
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 py-6">
        <div className="mx-auto max-w-5xl px-6">{children}</div>
      </main>
    </div>
  );
}
