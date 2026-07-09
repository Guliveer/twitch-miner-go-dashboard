"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tv2, LayoutDashboard, Users, Bot, Settings, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth";

type Props = {
  isAdmin?: boolean;
};

export function Navbar({ isAdmin }: Props) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const navLink = (href: string, label: string, icon: React.ReactNode) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={cn(
          "relative text-xs font-semibold uppercase tracking-wider transition-colors pb-1 inline-flex items-center gap-1.5",
          active
            ? "text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {icon}
        {label}
        {active && <span className="sr-only">(current)</span>}
      </Link>
    );
  };

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center gap-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          <Tv2 className="h-4 w-4" />
          <span className="text-sm">Twitch Miner</span>
        </Link>

        <nav className="flex items-center gap-6">
          {navLink("/dashboard", "Dashboard", <LayoutDashboard className="h-3.5 w-3.5" />)}
          {isAdmin && (
            <>
              <span className="h-4 w-px bg-border" />
              {navLink("/admin/users", "Users", <Users className="h-3.5 w-3.5" />)}
              {navLink("/admin/accounts", "Bot accounts", <Bot className="h-3.5 w-3.5" />)}
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" aria-label="User menu" />}
            >
              <User className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuItem>
                <Link href="/settings" className="flex items-center gap-2 w-full">
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => startTransition(() => signOut())}
                disabled={isPending}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                {isPending ? "Signing out…" : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
