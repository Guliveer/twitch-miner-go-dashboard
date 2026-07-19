import packageJson from "../../package.json";

export const DASHBOARD_VERSION = packageJson.version;

export type BotStatus = {
  connected: boolean;
  version: string | null;
};

/**
 * Checks whether the bot API is reachable and reads its version
 * from the health endpoint. The version field is null when the bot
 * does not expose it (older versions, or custom builds).
 */
export async function getBotStatus(): Promise<BotStatus> {
  const baseUrl = process.env.BOT_URL;
  const apiKey = process.env.BOT_API_KEY;

  if (!baseUrl || !apiKey) {
    return { connected: false, version: null };
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/health`, {
      headers: { "X-API-Key": apiKey },
      cache: "no-store",
    });

    if (!res.ok) {
      return { connected: false, version: null };
    }

    const body = await res.json().catch(() => null);
    const version =
      body && typeof body.version === "string" ? body.version : null;

    return { connected: true, version };
  } catch {
    return { connected: false, version: null };
  }
}
