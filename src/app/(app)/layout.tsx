import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/server";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  let isAdmin = false;
  if (session) {
    const supabase = await createClient();
    const { data: meta } = await supabase
      .from("user_meta")
      .select("role")
      .eq("user_id", session.user.id)
      .single();
    isAdmin = meta?.role === "admin";
  }

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
