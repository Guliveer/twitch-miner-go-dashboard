"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

type Props = {
  isAdmin?: boolean;
};

export function Navbar({ isAdmin }: Props) {
  return (
    <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-5xl px-6 py-3 flex items-center gap-6">
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
      </div>
    </header>
  );
}
