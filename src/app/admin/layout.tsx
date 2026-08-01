import { getUserRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const role = await getUserRole();
  if (!role) redirect("/login");
  if (role !== "admin") redirect("/dashboard");

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
