import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { userMeta } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  const meta = session
    ? await db.query.userMeta.findFirst({ where: eq(userMeta.userId, session.user.id) })
    : null;
  const isAdmin = meta?.role === "admin";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar isAdmin={isAdmin} />
      <main className="flex-1 py-6">
        <div className="mx-auto max-w-5xl px-6">{children}</div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
