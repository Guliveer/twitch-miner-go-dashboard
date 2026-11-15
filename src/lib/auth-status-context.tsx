"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { checkBotAuthStatuses, type AuthStatusMap } from "@/actions/bot-auth";

const POLL_INTERVAL_MS = 5000;

export type BotAuthStatusValue = {
  statuses: AuthStatusMap;
  /** False when the bot build predates the batched auth status endpoint. */
  batchSupported: boolean;
};

const BotAuthStatusCtx = createContext<BotAuthStatusValue>({
  statuses: {},
  batchSupported: true,
});

/**
 * Polls every pending device code flow once per interval and shares the result
 * with all mounted consumers, so the page keeps a single request in flight no
 * matter how many accounts it shows.
 */
export function BotAuthStatusProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<AuthStatusMap>({});
  const [batchSupported, setBatchSupported] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      const result = await checkBotAuthStatuses();
      if (cancelled) return;

      if (result === null) {
        setStatuses({});
        setBatchSupported(false);
        return;
      }

      setBatchSupported(true);
      setStatuses(result);
      timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return (
    <BotAuthStatusCtx.Provider value={{ statuses, batchSupported }}>
      {children}
    </BotAuthStatusCtx.Provider>
  );
}

export function useBotAuthStatus(): BotAuthStatusValue {
  return useContext(BotAuthStatusCtx);
}
