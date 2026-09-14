import type { AccountConfigForm } from "./config-schema";

export type ConfigWarning = {
  id: string;
  message: string;
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Returns non-blocking warnings about a config that would make the bot
 * idle, ineffective, or contradictory. Used for the in-editor warning banner.
 */
export function getConfigWarnings(
  config: AccountConfigForm,
  notificationProviders: string[],
): ConfigWarning[] {
  const warnings: ConfigWarning[] = [];

  const hasStreamers = config.streamers.length > 0;
  const followersEnabled = config.followers.enabled === true;
  const catEnabled = config.category_watcher.enabled === true;
  const teamEnabled = config.team_watcher.enabled === true;
  if (!hasStreamers && !followersEnabled && !catEnabled && !teamEnabled) {
    warnings.push({
      id: "no-activity",
      message:
        "No streamers are configured and followers / watchers are disabled — the bot will not do anything.",
    });
  }

  const seenStreamers = new Set<string>();
  for (const s of config.streamers) {
    const key = s.username.trim().toLowerCase();
    if (!key) continue;
    if (seenStreamers.has(key)) {
      warnings.push({
        id: "duplicate-streamer",
        message: `Streamer "${s.username}" appears more than once in the streamers list.`,
      });
    }
    seenStreamers.add(key);
  }

  const blacklist = new Set(
    config.blacklist.map((b) => b.trim().toLowerCase()),
  );
  for (const s of config.streamers) {
    if (blacklist.has(s.username.trim().toLowerCase())) {
      warnings.push({
        id: "blacklist-conflict",
        message: `Streamer "${s.username}" is on both the streamers list and the blacklist.`,
      });
    }
  }

  const categoryBlacklist = new Set(
    config.category_blacklist.map((c) => c.trim().toLowerCase()),
  );
  for (const c of config.category_watcher.categories) {
    if (categoryBlacklist.has(c.slug.trim().toLowerCase())) {
      warnings.push({
        id: "category-blacklist-conflict",
        message: `Category "${c.slug}" is on both the category watcher list and the category blacklist.`,
      });
    }
  }

  for (const provider of notificationProviders) {
    const settings =
      config.notifications?.[
        provider as Exclude<keyof AccountConfigForm["notifications"], "batch">
      ];
    if (settings?.enabled && (settings.events ?? []).length === 0) {
      warnings.push({
        id: `notification-no-events-${provider}`,
        message: `${capitalize(provider)} notifications are enabled but no events are selected — nothing will be sent.`,
      });
    }
  }

  return warnings;
}
