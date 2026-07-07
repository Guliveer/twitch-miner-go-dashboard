"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";
import type { PendingCode } from "@/hooks/useDeviceCode";

type Props = {
  username: string;
  code: PendingCode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeviceCodeModal({ username, code, open, onOpenChange }: Props) {
  const [copied, setCopied] = useState(false);

  const isExpired = code.expiresAt > 0 && Date.now() / 1000 > code.expiresAt;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.userCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Authorize {username}
          </DialogTitle>
          <DialogDescription>
            This bot account needs Twitch authorization. Open the link and enter the code below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border bg-background p-3">
            <code className="flex-1 text-center text-lg font-bold tracking-widest text-amber-700 dark:text-amber-400">
              {code.userCode}
            </code>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="shrink-0"
              aria-label="Copy authorization code"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>

          <a
            href={code.verificationUri}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <ExternalLink className="h-4 w-4" />
            Open {new URL(code.verificationUri).hostname}
          </a>

          {isExpired && (
            <p className="text-center text-xs text-destructive">
              This code has expired. The bot will generate a new one shortly.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
