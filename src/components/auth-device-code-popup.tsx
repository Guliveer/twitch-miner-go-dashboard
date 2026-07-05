"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { checkBotAuthStatus } from "@/actions/bot-auth";

type Props = {
  username: string;
  onComplete?: () => void;
};

type PendingCode = {
  userCode: string;
  verificationUri: string;
  expiresAt: number;
};

export function AuthDeviceCodePopup({ username, onComplete }: Props) {
  const [pending, setPending] = useState<PendingCode | null>(null);
  const [showCode, setShowCode] = useState(false);
  const hadPending = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      const result = await checkBotAuthStatus(username);

      if (cancelled) return;

      if (result && result.user_code && result.verification_uri) {
        setPending({
          userCode: result.user_code,
          verificationUri: result.verification_uri,
          expiresAt: result.expires_at ?? 0,
        });
        hadPending.current = true;
      } else {
        setPending(null);
        if (hadPending.current) {
          hadPending.current = false;
          onComplete?.();
        }
      }

      timeoutId = setTimeout(poll, 5000);
    };

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [username]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!pending) return null;

  const isExpired = pending.expiresAt > 0 && Date.now() / 1000 > pending.expiresAt;

  return (
    <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="text-lg">📺</span>
          Authorize: {username}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-muted-foreground">
          This bot account needs Twitch authorization. Open the link and enter the code.
        </p>

        <div className="rounded border bg-background p-3 font-mono text-center space-y-1">
          {showCode ? (
            <>
              <div className="text-lg font-bold tracking-wider text-amber-700 dark:text-amber-400">
                {pending.userCode}
              </div>
              <button
                className="text-xs text-muted-foreground underline"
                onClick={() => setShowCode(false)}
              >
                Hide code
              </button>
            </>
          ) : (
            <button
              className="text-xs text-muted-foreground underline"
              onClick={() => setShowCode(true)}
            >
              Show code
            </button>
          )}
        </div>

        <a
          href={pending.verificationUri}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 font-medium"
        >
          Open {new URL(pending.verificationUri).hostname}
        </a>

        {isExpired && (
          <p className="text-xs text-destructive">This code has expired. The bot will generate a new one shortly.</p>
        )}
      </CardContent>
    </Card>
  );
}
