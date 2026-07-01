"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AccountCard } from "./AccountCard";
import { SearchX } from "lucide-react";

type Account = {
  username: string;
  enabled: boolean;
  last_started_at: number | null;
};

type SortKey = "name-asc" | "name-desc" | "enabled" | "disabled";

export function AccountsGrid({ accounts }: { accounts: Account[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("name-asc");

  const activeCount = accounts.filter((a) => a.enabled).length;

  const filtered = useMemo(() => {
    let result = accounts.filter((a) =>
      a.username.toLowerCase().includes(search.toLowerCase())
    );
    switch (sort) {
      case "name-asc":  result = [...result].sort((a, b) => a.username.localeCompare(b.username)); break;
      case "name-desc": result = [...result].sort((a, b) => b.username.localeCompare(a.username)); break;
      case "enabled":   result = [...result].sort((a, b) => Number(b.enabled) - Number(a.enabled)); break;
      case "disabled":  result = [...result].sort((a, b) => Number(a.enabled) - Number(b.enabled)); break;
    }
    return result;
  }, [accounts, search, sort]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Input
          placeholder="Search accounts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name A → Z</SelectItem>
            <SelectItem value="name-desc">Name Z → A</SelectItem>
            <SelectItem value="enabled">Enabled first</SelectItem>
            <SelectItem value="disabled">Disabled first</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant={activeCount > 0 ? "default" : "secondary"}>
            {activeCount} active
          </Badge>
          <span>/ {accounts.length} total</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <SearchX className="h-8 w-8 opacity-50" />
          <p className="text-sm">No accounts match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <AccountCard
              key={a.username}
              username={a.username}
              enabled={a.enabled}
              lastStartedAt={a.last_started_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}
