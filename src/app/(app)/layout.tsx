import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <span className="font-semibold">Twitch Miner</span>
        <ThemeToggle />
      </header>
      <main className="flex-1 p-6">{children}</main>
      <Footer />
      <Toaster />
    </div>
  );
}
