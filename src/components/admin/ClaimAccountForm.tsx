"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { claimAccountForUser } from "@/actions/admin";

type Props = {
  unclaimedAccounts: string[];
  users: { id: string; email: string }[];
};

export function ClaimAccountForm({ unclaimedAccounts, users }: Props) {
  const [botUsername, setBotUsername] = useState(unclaimedAccounts[0] ?? "");
  const [userId, setUserId] = useState(users[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  if (unclaimedAccounts.length === 0) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    startTransition(async () => {
      try {
        await claimAccountForUser(botUsername, userId);
        setMessage(`Assigned "${botUsername}" to ${users.find((u) => u.id === userId)?.email}.`);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Failed");
      }
    });
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Assign unclaimed bot accounts</h2>
      <p className="text-sm text-muted-foreground">
        {unclaimedAccounts.length} unclaimed account{unclaimedAccounts.length !== 1 ? "s" : ""} in the database.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
        <div className="space-y-1">
          <label className="text-sm font-medium">Bot account</label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-background"
            value={botUsername}
            onChange={(e) => setBotUsername(e.target.value)}
          >
            {unclaimedAccounts.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Assign to user</label>
          <select
            className="border rounded-md px-3 py-2 text-sm bg-background"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.email}</option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Assigning…" : "Assign"}
        </Button>
      </form>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
