"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { buttonVariants } from "@/components/ui/button";
import { toggleEnabled } from "@/actions/accounts";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Settings2 } from "lucide-react";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

type Props = {
  username: string;
  enabled: boolean;
  lastStartedAt: number | null;
};

function relativeTime(epochSec: number): string {
  const diffSec = Math.floor(Date.now() / 1000) - epochSec;
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function statusBadge(enabled: boolean, lastStartedAt: number | null) {
  if (!enabled) return <Badge variant="secondary">Disabled</Badge>;
  if (lastStartedAt === null) return <Badge variant="outline">Never started</Badge>;
  return <Badge variant="default">Active</Badge>;
}

export function AccountCard({ username, enabled, lastStartedAt }: Props) {
  const [isPending, startTransition] = useTransition();
  const [optimisticEnabled, setOptimisticEnabled] = useState(enabled);

  const handleToggle = (value: boolean) => {
    setOptimisticEnabled(value);
    startTransition(() => toggleEnabled(username, value));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium pt-0.5">{username}</CardTitle>
        <div className="flex flex-col items-end gap-1">
          {statusBadge(optimisticEnabled, lastStartedAt)}
          {lastStartedAt !== null && (
            <span className="text-xs text-muted-foreground">
              {relativeTime(lastStartedAt)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm">
          <Switch
            checked={optimisticEnabled}
            onCheckedChange={handleToggle}
            disabled={isPending}
          />
          <span className={optimisticEnabled ? "text-foreground" : "text-muted-foreground"}>
            {optimisticEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Link
          href={`/dashboard/${username}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          <Settings2 className="h-4 w-4" />
          Configure
        </Link>
        <DeleteAccountDialog username={username} />
      </CardFooter>
    </Card>
  );
}
