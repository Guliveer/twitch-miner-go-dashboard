"use server";

type AuthStatusResponse = {
  status: "pending" | "no_pending";
  user_code?: string;
  verification_uri?: string;
  expires_at?: number;
};

/**
 * Checks the device code auth status for a given bot account username.
 * Returns the pending status or null if no flow is active / the bot is unreachable.
 */
export async function checkBotAuthStatus(username: string): Promise<AuthStatusResponse | null> {
  const baseUrl = process.env.BOT_URL;
  const apiKey = process.env.BOT_API_KEY;

  if (!baseUrl || !apiKey) {
    console.warn("Bot API key not configured – BOT_URL, BOT_API_KEY");
    return null;
  }

  try {
    const url = `${baseUrl.replace(/\/$/, "")}/api/auth-status/${encodeURIComponent(username)}`;

    const res = await fetch(url, {
      headers: { "X-API-Key": apiKey },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`Bot API responded with ${res.status} for user ${username}`);
      return null;
    }

    return (await res.json()) as AuthStatusResponse;
  } catch (err) {
    console.error(`Failed to check auth status for ${username}:`, err);
    return null;
  }
}
