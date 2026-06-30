import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <span className="font-semibold">Twitch Miner</span>
      </header>
      <main className="p-6">{children}</main>
      <Toaster />
    </div>
  );
}
