"use server";

import type { BotConfigSchema } from "@/lib/schema-types";
import schemaFallback from "@/lib/schema-fallback.json";

const CACHE_TTL_MS = 60_000;

let cached: BotConfigSchema | null = null;
let cacheTs = 0;

/**
 * Fetches the config schema from the bot API, falling back to the committed
 * snapshot when the bot is unreachable or not configured. Results are cached
 * in memory for 60 seconds to avoid hammering the bot on every page load.
 */
export async function getConfigSchema(): Promise<BotConfigSchema> {
  const now = Date.now();
  if (cached && now - cacheTs < CACHE_TTL_MS) {
    return cached;
  }

  const baseUrl = process.env.BOT_URL;
  const apiKey = process.env.BOT_API_KEY;

  if (!baseUrl || !apiKey) {
    console.warn("Bot API key not configured – BOT_URL, BOT_API_KEY");
    return schemaFallback;
  }

  try {
    const url = `${baseUrl.replace(/\/$/, "")}/api/config/schema`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Bot API config schema responded with ${res.status}`);
      return schemaFallback;
    }

    const data = (await res.json()) as BotConfigSchema;
    cached = data;
    cacheTs = now;
    return data;
  } catch (err) {
    console.error("Failed to fetch config schema via bot API:", err);
    return schemaFallback;
  }
}