const TWITCH_CATEGORY_URL_RE =
  /^https?:\/\/(?:www\.)?twitch\.tv\/directory\/category\/([a-z0-9-]+)/i;

export function parseCategorySlug(input: string): string {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(TWITCH_CATEGORY_URL_RE);
  if (urlMatch) return urlMatch[1].toLowerCase();

  return trimmed
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isTwitchCategoryUrl(input: string): boolean {
  return TWITCH_CATEGORY_URL_RE.test(input.trim());
}

const TWITCH_TEAM_URL_RE =
  /^https?:\/\/(?:www\.)?twitch\.tv\/team\/([a-z0-9-]+)/i;

export function parseTeamSlug(input: string): string {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(TWITCH_TEAM_URL_RE);
  if (urlMatch) return urlMatch[1].toLowerCase();

  return trimmed
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isTwitchTeamUrl(input: string): boolean {
  return TWITCH_TEAM_URL_RE.test(input.trim());
}
