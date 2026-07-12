"use server";

import type { AccountConfigForm } from "@/lib/config-schema";

type GenerateResponse = {
  username: string;
  filename: string;
  yaml: string;
  generated_at: string;
};

/**
 * Calls the bot API to generate a YAML config from the given form data.
 * Returns the YAML string and filename, or null if the bot is unreachable.
 */
export async function generateConfigYaml(
  config: AccountConfigForm,
): Promise<{ yaml: string; filename: string } | null> {
  const baseUrl = process.env.BOT_URL;
  const apiKey = process.env.BOT_API_KEY;

  if (!baseUrl || !apiKey) {
    console.warn("Bot API key not configured – BOT_URL, BOT_API_KEY");
    return null;
  }

  try {
    const url = `${baseUrl.replace(/\/$/, "")}/api/config/generate`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(config),
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Bot API config generate responded with ${res.status}`);
      return null;
    }

    const data = (await res.json()) as GenerateResponse;
    return { yaml: data.yaml, filename: data.filename };
  } catch (err) {
    console.error("Failed to generate config via bot API:", err);
    return null;
  }
}
