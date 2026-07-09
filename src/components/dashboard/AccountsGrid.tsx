"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AccountCard } from "./AccountCard";
import { SearchX } from "lucide-react";

type Account = {
  username: string;
  enabled: boolean;
  last_started_at: number | null;
};

type Filter = "all" | "enabled" | "disabled";

export function AccountsGrid({ accounts, compact = false }: { accounts: Account[]; compact?: boolean }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const activeCount = accounts.filter((a) => a.enabled).length;

  const filtered = useMemo(() => {
    return accounts
      .filter((a) => a.username.toLowerCase().includes(search.toLowerCase()))
      .filter((a) => {
        if (filter === "enabled") return a.enabled;
        if (filter === "disabled") return !a.enabled;
        return true;
      })
      .sort((a, b) => a.username.localeCompare(b.username));
  }, [accounts, search, filter]);

  return (
    <div className="space-y-6">
      {!compact && <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Search accounts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-64"
        />
        <div className="flex items-center gap-1">
          {(["all", "enabled", "disabled"] as const).map((f) => (
            <Button
              key={f}
              type="button"
              variant={filter === f ? "secondary" : "ghost"}
              size="sm"
              className="min-w-[72px]"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : f === "enabled" ? "Enabled" : "Disabled"}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={activeCount > 0 ? "default" : "secondary"}>
            {activeCount} active
          </Badge>
          <span className="text-muted-foreground/60">/ {accounts.length} total</span>
        </div>
      </div>}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <SearchX className="h-8 w-8 opacity-50" />
          <p className="text-sm">No accounts match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <div key={a.username} className="bg-background">
              <AccountCard
                username={a.username}
                enabled={a.enabled}
                lastStartedAt={a.last_started_at}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
