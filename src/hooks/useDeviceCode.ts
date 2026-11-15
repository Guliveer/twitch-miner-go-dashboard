"use client";

import { useEffect, useRef, useState } from "react";
import { checkBotAuthStatus, type AuthStatusResponse } from "@/actions/bot-auth";
import { useBotAuthStatus } from "@/lib/auth-status-context";

const POLL_INTERVAL_MS = 5000;

export type PendingCode = {
  userCode: string;
  verificationUri: string;
  expiresAt: number;
};

export function useDeviceCode(
  username: string,
  onConsumed?: () => void,
): PendingCode | null {
  const { statuses, batchSupported } = useBotAuthStatus();
  const [legacyStatus, setLegacyStatus] = useState<AuthStatusResponse | null>(null);
  const hadPending = useRef(false);

  // Older bot builds have no batched endpoint, so such a bot is polled per
  // account until it is upgraded.
  useEffect(() => {
    if (batchSupported) {
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const loop = async () => {
      const result = await checkBotAuthStatus(username);
      if (cancelled) return;
      setLegacyStatus(result);
      timer = setTimeout(loop, POLL_INTERVAL_MS);
    };

    loop();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [batchSupported, username]);

  const status = batchSupported ? statuses[username.toLowerCase()] : legacyStatus;

  useEffect(() => {
    if (status) {
      hadPending.current = true;
      return;
    }

    if (hadPending.current) {
      hadPending.current = false;
      onConsumed?.();
    }
  }, [status, onConsumed]);

  if (!status || !status.user_code || !status.verification_uri) {
    return null;
  }

  return {
    userCode: status.user_code,
    verificationUri: status.verification_uri,
    expiresAt: status.expires_at ?? 0,
  };
}
