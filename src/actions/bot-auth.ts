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
  const botUser = process.env.BOT_USERNAME;
  const botPass = process.env.BOT_PASSWORD;

  if (!baseUrl || !botUser || !botPass) {
    console.warn("Bot API credentials not configured – BOT_URL, BOT_USERNAME, BOT_PASSWORD");
    return null;
  }

  try {
    const url = `${baseUrl.replace(/\/$/, "")}/api/auth-status/${encodeURIComponent(username)}`;
    const basicAuth = btoa(`${botUser}:${botPass}`);

    const res = await fetch(url, {
      headers: { Authorization: `Basic ${basicAuth}` },
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
