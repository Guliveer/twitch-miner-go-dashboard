"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { buttonVariants } from "@/components/ui/button";
import { toggleEnabled } from "@/actions/accounts";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

type Props = {
  username: string;
  enabled: boolean;
  lastStartedAt: number | null;
};

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{username}</CardTitle>
        {statusBadge(optimisticEnabled, lastStartedAt)}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch
            checked={optimisticEnabled}
            onCheckedChange={handleToggle}
            disabled={isPending}
          />
          <span>{optimisticEnabled ? "Enabled" : "Disabled"}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Link
          href={`/dashboard/${username}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Configure
        </Link>
        <DeleteAccountDialog username={username} />
      </CardFooter>
    </Card>
  );
}
