"use server";

export type AuthStatusResponse = {
  status: "pending" | "no_pending";
  user_code?: string;
  verification_uri?: string;
  expires_at?: number;
};

export type AuthStatusMap = Record<string, AuthStatusResponse>;

const warnedUnreachable = new Set<string>();

function botEndpoint(): { baseUrl: string; apiKey: string } | null {
  const baseUrl = process.env.BOT_URL;
  const apiKey = process.env.BOT_API_KEY;

  if (!baseUrl || !apiKey) {
    if (!warnedUnreachable.has("__config__")) {
      warnedUnreachable.add("__config__");
      console.warn("Bot API key not configured – BOT_URL, BOT_API_KEY");
    }
    return null;
  }

  return { baseUrl: baseUrl.replace(/\/$/, ""), apiKey };
}

function toStatusMap(body: unknown): AuthStatusMap {
  const statuses: AuthStatusMap = {};

  if (!body || typeof body !== "object") {
    return statuses;
  }

  for (const [username, value] of Object.entries(body as Record<string, unknown>)) {
    if (value && typeof value === "object" && "status" in value) {
      statuses[username.toLowerCase()] = value as AuthStatusResponse;
    }
  }

  return statuses;
}

/**
 * Checks the device code auth status for a given bot account username.
 * Returns the pending status or null if no flow is active / the bot is unreachable.
 */
export async function checkBotAuthStatus(username: string): Promise<AuthStatusResponse | null> {
  const bot = botEndpoint();

  if (!bot) {
    return null;
  }

  try {
    const url = `${bot.baseUrl}/api/auth-status/${encodeURIComponent(username)}`;

    const res = await fetch(url, {
      headers: { "X-API-Key": bot.apiKey },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`Bot API responded with ${res.status} for user ${username}`);
      warnedUnreachable.delete(username);
      return null;
    }

    warnedUnreachable.delete(username);
    return (await res.json()) as AuthStatusResponse;
  } catch {
    if (!warnedUnreachable.has(username)) {
      warnedUnreachable.add(username);
      console.warn(`Bot unreachable for ${username}`);
    }
    return null;
  }
}

/**
 * Fetches the pending device code status of every account in a single request,
 * keyed by lowercase username. Returns null when the bot does not expose the
 * batched endpoint, so callers can fall back to per-account polling against
 * older bot builds.
 */
export async function checkBotAuthStatuses(): Promise<AuthStatusMap | null> {
  const bot = botEndpoint();

  if (!bot) {
    return null;
  }

  try {
    const res = await fetch(`${bot.baseUrl}/api/auth-status`, {
      headers: { "X-API-Key": bot.apiKey },
      cache: "no-store",
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      console.warn(`Bot API responded with ${res.status} for the auth status list`);
      return {};
    }

    warnedUnreachable.delete("__list__");
    return toStatusMap(await res.json());
  } catch {
    if (!warnedUnreachable.has("__list__")) {
      warnedUnreachable.add("__list__");
      console.warn("Bot unreachable for the auth status list");
    }
    return {};
  }
}
