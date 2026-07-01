"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tv2, ShieldCheck, Settings, User, LogOut } from "lucide-react";
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
          "flex items-center gap-1.5 text-sm transition-colors",
          active
            ? "text-foreground font-medium"
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
    <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-5xl px-6 py-3 flex items-center gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 font-semibold hover:opacity-80 transition-opacity"
        >
          <Tv2 className="h-4 w-4" />
          Twitch Miner
        </Link>

        <nav className="flex items-center gap-4">
          {navLink("/dashboard", "Dashboard", null)}
          {isAdmin && navLink("/admin", "Admin", <ShieldCheck className="h-4 w-4" />)}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" aria-label="User menu" />}
            >
              <User className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
