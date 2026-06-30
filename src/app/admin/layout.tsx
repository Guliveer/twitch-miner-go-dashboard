import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { userMeta } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const meta = await db.query.userMeta.findFirst({
    where: eq(userMeta.userId, session.user.id),
  });
  if (meta?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <span className="font-semibold">Admin</span>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
