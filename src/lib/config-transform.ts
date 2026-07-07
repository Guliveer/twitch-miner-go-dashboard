import { type AccountConfigForm } from "./config-schema";

export const FORCED_STREAMER = "guliveer_";

export function coerceNullToUndefined(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(coerceNullToUndefined);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        k,
        v === null ? undefined : coerceNullToUndefined(v),
      ])
    );
  }
  return obj;
}

export function enforceNonAdminConfig(config: AccountConfigForm): AccountConfigForm {
  const withoutForced = config.streamers.filter((s) => s.username !== FORCED_STREAMER);
  const streamers = [{ username: FORCED_STREAMER }, ...withoutForced];
  return {
    ...config,
    streamers,
    notifications: {},
    features: { ...config.features, enable_analytics: false },
    max_watch_streams: config.max_watch_streams != null
      ? Math.min(config.max_watch_streams, 10)
      : config.max_watch_streams,
    proxy: undefined,
  };
}

export function deepStrip(value: unknown): unknown {
  if (value === "" || value === undefined) return undefined;
  if (Array.isArray(value)) {
    const mapped = value.map(deepStrip).filter((v) => v !== undefined);
    return mapped.length > 0 ? mapped : undefined;
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const cleaned = deepStrip(v);
      if (cleaned !== undefined) result[k] = cleaned;
    }
    return Object.keys(result).length > 0 ? result : undefined;
  }
  return value;
}

/**
 * Deep merge: fills in missing nested fields from `defaults` into `source`,
 * but never overwrites an existing value with a default. Arrays are replaced,
 * not merged.
 */
export function deepMergeDefaults<T extends Record<string, unknown>>(
  defaults: T,
  source: Record<string, unknown>,
): T {
  const result = { ...defaults } as Record<string, unknown>;

  for (const key of Object.keys(source)) {
    const sv = source[key];
    if (sv === undefined) continue;

    const dv = result[key];
    if (
      typeof dv === "object" && dv !== null && !Array.isArray(dv) &&
      typeof sv === "object" && sv !== null && !Array.isArray(sv)
    ) {
      result[key] = deepMergeDefaults(
        dv as Record<string, unknown>,
        sv as Record<string, unknown>,
      );
    } else {
      result[key] = sv;
    }
  }

  return result as T;
}

export function prepareConfigJson(config: AccountConfigForm): string {
  const stripped = deepStrip(config) as Record<string, unknown>;

  const defaults = (stripped.streamer_defaults ?? {}) as Record<string, unknown>;
  if (defaults.make_predictions === true && !defaults.bet) {
    defaults.bet = {};
    stripped.streamer_defaults = defaults;
  }

  const catWatcher = (stripped.category_watcher ?? {}) as Record<string, unknown>;
  if (catWatcher.enabled === true) {
    const cats = catWatcher.categories as unknown[] | undefined;
    if (!cats || cats.length === 0) catWatcher.enabled = false;
    stripped.category_watcher = catWatcher;
  }

  const teamWatcher = (stripped.team_watcher ?? {}) as Record<string, unknown>;
  if (teamWatcher.enabled === true) {
    const teams = teamWatcher.teams as unknown[] | undefined;
    if (!teams || teams.length === 0) teamWatcher.enabled = false;
    stripped.team_watcher = teamWatcher;
  }

  const hasStreamers = (stripped.streamers as unknown[] | undefined)?.length ?? 0;
  const followersEnabled = (stripped.followers as Record<string, unknown> | undefined)?.enabled === true;
  const catEnabled = (stripped.category_watcher as Record<string, unknown> | undefined)?.enabled === true;
  const teamEnabled = (stripped.team_watcher as Record<string, unknown> | undefined)?.enabled === true;
  if (hasStreamers === 0 && !followersEnabled && !catEnabled && !teamEnabled) {
    stripped.streamers = stripped.streamers ?? [];
  }

  return JSON.stringify(stripped);
}
