"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { claimAccountForUser } from "@/actions/admin";

type Props = {
  unclaimedAccounts: string[];
  users: { id: string; label: string }[];
};

export function ClaimAccountForm({ unclaimedAccounts, users }: Props) {
  const [botUsername, setBotUsername] = useState(unclaimedAccounts[0] ?? "");
  const [userId, setUserId] = useState(users[0]?.id ?? "");
  const selectedUserLabel = users.find((u) => u.id === userId)?.label ?? userId;
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  if (unclaimedAccounts.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    startTransition(async () => {
      try {
        await claimAccountForUser(botUsername, userId);
        setMessage(`Assigned "${botUsername}" to ${users.find((u) => u.id === userId)?.label}.`);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Failed");
      }
    });
  };

  return (
    <div className="border border-border p-5 space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider">Assign unclaimed bot accounts</p>
        <p className="text-sm text-muted-foreground mt-1">
          {unclaimedAccounts.length} unclaimed account{unclaimedAccounts.length !== 1 ? "s" : ""} in the database.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-center">
        <Select value={botUsername} onValueChange={(v) => v && setBotUsername(v)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {unclaimedAccounts.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">→</span>
        <Select value={userId} onValueChange={(v) => v && setUserId(v)}>
          <SelectTrigger className="w-52">
            <SelectValue>{selectedUserLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" disabled={isPending}>
          <Link2 className="h-4 w-4" />
          {isPending ? "Assigning…" : "Assign"}
        </Button>
      </form>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
