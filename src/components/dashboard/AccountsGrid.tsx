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
  ownerDisplayName?: string;
  isOwnAccount: boolean;
  isUnclaimed: boolean;
};

type Filter = "all" | "enabled" | "disabled";

export function AccountsGrid({ accounts, compact = false, showOwnerSections = false, isAdmin = false }: { accounts: Account[]; compact?: boolean; showOwnerSections?: boolean; isAdmin?: boolean }) {
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

  const myAccounts = showOwnerSections ? filtered.filter((a) => a.isOwnAccount) : [];
  const otherAccounts = showOwnerSections ? filtered.filter((a) => !a.isOwnAccount && !a.isUnclaimed) : [];
  const unclaimedAccounts = showOwnerSections ? filtered.filter((a) => a.isUnclaimed) : [];

  const renderSection = (title: string, items: Account[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <div key={a.username} className="bg-background">
              <AccountCard
                username={a.username}
                enabled={a.enabled}
                lastStartedAt={a.last_started_at}
                ownerDisplayName={a.ownerDisplayName}
                isAdmin={isAdmin}
                isOwnAccount={a.isOwnAccount}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

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
      ) : showOwnerSections ? (
        <div className="space-y-8">
          {renderSection("My accounts", myAccounts)}
          {renderSection("Other users' accounts", otherAccounts)}
          {renderSection("Unclaimed", unclaimedAccounts)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <div key={a.username} className="bg-background">
              <AccountCard
                username={a.username}
                enabled={a.enabled}
                lastStartedAt={a.last_started_at}
                ownerDisplayName={a.ownerDisplayName}
                isAdmin={isAdmin}
                isOwnAccount={a.isOwnAccount}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
