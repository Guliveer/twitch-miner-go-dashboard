import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { userMeta } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  const meta = session
    ? await db.query.userMeta.findFirst({ where: eq(userMeta.userId, session.user.id) })
    : null;
  const isAdmin = meta?.role === "admin";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b px-6 py-3 flex items-center gap-6">
        <Link href="/dashboard" className="font-semibold hover:opacity-80 transition-opacity">
          Twitch Miner
        </Link>
        {isAdmin && (
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Admin
          </Link>
        )}
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}
