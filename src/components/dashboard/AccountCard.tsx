"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toggleEnabled } from "@/actions/accounts";
import Link from "next/link";
import { KeyRound, Settings2 } from "lucide-react";
import { useDeviceCode } from "@/hooks/useDeviceCode";
import { DeviceCodeModal } from "@/components/device-code-modal";
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
  const [modalOpen, setModalOpen] = useState(false);
  const pendingCode = useDeviceCode(username);

  const handleToggle = (value: boolean) => {
    setOptimisticEnabled(value);
    startTransition(() => toggleEnabled(username, value));
  };

  return (
    <div className="flex flex-col p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{username}</h3>
          {lastStartedAt !== null && (
            <span className="text-xs text-muted-foreground">
              {relativeTime(lastStartedAt)}
            </span>
          )}
        </div>
        {statusBadge(optimisticEnabled, lastStartedAt)}
      </div>

      <div className="flex items-center gap-2 text-xs mb-5">
        <Switch
          checked={optimisticEnabled}
          onCheckedChange={handleToggle}
          disabled={isPending}
          size="sm"
        />
        <span className={optimisticEnabled ? "text-foreground" : "text-muted-foreground"}>
          {optimisticEnabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 mt-auto border-t border-border pt-4">
        <div className="flex gap-2">
          {pendingCode && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(true)}
            >
              <KeyRound className="h-3.5 w-3.5" />
              Authorize
            </Button>
          )}
          <Link href={`/dashboard/${username}`}>
            <Button variant="default" size="sm">
              <Settings2 className="h-3.5 w-3.5" />
              Configure
            </Button>
          </Link>
        </div>
        <DeleteAccountDialog username={username} />
      </div>

      {pendingCode && (
        <DeviceCodeModal
          username={username}
          code={pendingCode}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  );
}
