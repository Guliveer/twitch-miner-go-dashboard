import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getUserRole } from "@/lib/auth";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const role = await getUserRole();
  const isAdmin = role === "admin";

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
