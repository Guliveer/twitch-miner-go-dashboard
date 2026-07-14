import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = await createClient();
  const { data: meta } = await supabase
    .from("user_meta")
    .select("role")
    .eq("user_id", session.user.id)
    .single();
  if (meta?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar isAdmin />
      <main className="flex-1 py-6">
        <div className="mx-auto max-w-5xl px-6">{children}</div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
