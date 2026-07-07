"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { checkBotAuthStatus } from "@/actions/bot-auth";

export type PendingCode = {
  userCode: string;
  verificationUri: string;
  expiresAt: number;
};

export function useDeviceCode(
  username: string,
  onConsumed?: () => void,
): PendingCode | null {
  const [pending, setPending] = useState<PendingCode | null>(null);
  const hadPending = useRef(false);

  const poll = useCallback(async () => {
    const result = await checkBotAuthStatus(username);

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
        onConsumed?.();
      }
    }
  }, [username, onConsumed]);

  useEffect(() => {
    let cancelled = false;

    const loop = async () => {
      while (!cancelled) {
        await poll();
        await new Promise<void>((r) => setTimeout(r, 5000));
      }
    };

    loop();

    return () => {
      cancelled = true;
    };
  }, [poll]);

  return pending;
}
