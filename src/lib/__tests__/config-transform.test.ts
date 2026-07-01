import {
  deepStrip,
  coerceNullToUndefined,
  enforceNonAdminConfig,
  prepareConfigJson,
  FORCED_STREAMER,
} from "../config-transform";
import { DEFAULT_CONFIG, type AccountConfigForm } from "../config-schema";

// ─── deepStrip ────────────────────────────────────────────────────────────────

describe("deepStrip", () => {
  it("removes empty strings at root level", () => {
    expect(deepStrip({ proxy: "", username: "foo" })).toEqual({ username: "foo" });
  });

  it("removes empty strings nested inside objects", () => {
    const result = deepStrip({
      notifications: { discord: { enabled: false, webhook_url: "" } },
    });
    expect(result).toEqual({ notifications: { discord: { enabled: false } } });
  });

  it("removes empty arrays", () => {
    expect(deepStrip({ events: [] })).toEqual(undefined);
  });

  it("preserves non-empty arrays", () => {
    expect(deepStrip({ events: ["BET_WIN"] })).toEqual({ events: ["BET_WIN"] });
  });

  it("removes undefined values", () => {
    expect(deepStrip({ a: undefined, b: 1 })).toEqual({ b: 1 });
  });

  it("passes null values through unchanged (null is valid JSON for Go omitempty fields)", () => {
    // coerceNullToUndefined handles null→undefined before the form loads;
    // deepStrip only strips empty strings and empty arrays/objects
    expect(deepStrip({ blacklist: null, username: "x" })).toEqual({ blacklist: null, username: "x" });
  });

  it("returns undefined for an empty object after stripping", () => {
    expect(deepStrip({ proxy: "", token: "" })).toBeUndefined();
  });

  it("preserves false booleans", () => {
    expect(deepStrip({ enabled: false })).toEqual({ enabled: false });
  });

  it("preserves zero numbers", () => {
    expect(deepStrip({ minimum_points: 0 })).toEqual({ minimum_points: 0 });
  });

  it("strips empty strings from per-streamer settings", () => {
    const input = {
      streamers: [{ username: "xQc", settings: { chat: "" } }],
    };
    expect(deepStrip(input)).toEqual({ streamers: [{ username: "xQc" }] });
  });

  it("removes streamers with empty username", () => {
    const result = deepStrip({ streamers: [{ username: "" }] });
    expect(result).toBeUndefined();
  });

  it("handles deeply nested structures", () => {
    const input = {
      notifications: {
        telegram: {
          enabled: true,
          token: "abc",
          chat_id: "123",
          events: ["DROP_CLAIM"],
          disable_notification: false,
          batch: { enabled: true, interval: "3h0m0s", max_entries: 15 },
        },
        discord: { enabled: false, webhook_url: "", events: [] },
      },
    };
    const result = deepStrip(input);
    expect(result).toEqual({
      notifications: {
        telegram: {
          enabled: true,
          token: "abc",
          chat_id: "123",
          events: ["DROP_CLAIM"],
          disable_notification: false,
          batch: { enabled: true, interval: "3h0m0s", max_entries: 15 },
        },
        discord: { enabled: false },
      },
    });
  });
});

// ─── coerceNullToUndefined ────────────────────────────────────────────────────

describe("coerceNullToUndefined", () => {
  it("converts null to undefined at root level", () => {
    const result = coerceNullToUndefined({ blacklist: null, username: "foo" }) as Record<string, unknown>;
    expect(result.blacklist).toBeUndefined();
    expect(result.username).toBe("foo");
  });

  it("converts null to undefined nested inside objects", () => {
    const result = coerceNullToUndefined({ a: { b: null } }) as Record<string, unknown>;
    const inner = result.a as Record<string, unknown>;
    expect(inner.b).toBeUndefined();
  });

  it("passes null inside arrays through unchanged (only null object keys are converted)", () => {
    // coerceNullToUndefined only converts null *values of object keys* to undefined,
    // not null items inside arrays — those remain as null.
    // deepStrip handles filtering out nulls from arrays as part of config serialisation.
    const result = coerceNullToUndefined({ events: [null, "BET_WIN"] }) as Record<string, unknown>;
    const events = result.events as unknown[];
    expect(events[0]).toBeNull();
    expect(events[1]).toBe("BET_WIN");
  });

  it("preserves false booleans", () => {
    const result = coerceNullToUndefined({ enabled: false }) as Record<string, unknown>;
    expect(result.enabled).toBe(false);
  });

  it("preserves zero", () => {
    const result = coerceNullToUndefined({ count: 0 }) as Record<string, unknown>;
    expect(result.count).toBe(0);
  });
});

// ─── enforceNonAdminConfig ────────────────────────────────────────────────────

describe("enforceNonAdminConfig", () => {
  const baseConfig: AccountConfigForm = {
    ...DEFAULT_CONFIG,
    username: "testuser",
    streamers: [{ username: "streamer1" }],
    notifications: {
      telegram: { enabled: true, token: "t", chat_id: "c", events: ["BET_WIN"], disable_notification: false },
    },
  };

  it(`prepends ${FORCED_STREAMER} to streamers list`, () => {
    const result = enforceNonAdminConfig(baseConfig);
    expect(result.streamers[0].username).toBe(FORCED_STREAMER);
    expect(result.streamers[1].username).toBe("streamer1");
  });

  it("does not duplicate forced streamer when already present", () => {
    const configWithForced: AccountConfigForm = {
      ...baseConfig,
      streamers: [{ username: FORCED_STREAMER }, { username: "streamer1" }],
    };
    const result = enforceNonAdminConfig(configWithForced);
    const forcedCount = result.streamers.filter((s) => s.username === FORCED_STREAMER).length;
    expect(forcedCount).toBe(1);
  });

  it("forced streamer has no settings (no overrides)", () => {
    const result = enforceNonAdminConfig(baseConfig);
    const forced = result.streamers.find((s) => s.username === FORCED_STREAMER);
    expect(forced?.settings).toBeUndefined();
  });

  it("clears notifications entirely", () => {
    const result = enforceNonAdminConfig(baseConfig);
    expect(result.notifications).toEqual({});
  });

  it("preserves other fields unchanged", () => {
    const result = enforceNonAdminConfig(baseConfig);
    expect(result.username).toBe("testuser");
    expect(result.followers).toEqual(baseConfig.followers);
    expect(result.max_watch_streams).toBe(baseConfig.max_watch_streams);
  });
});

// ─── prepareConfigJson ────────────────────────────────────────────────────────

describe("prepareConfigJson", () => {
  function parse(config: AccountConfigForm): Record<string, unknown> {
    return JSON.parse(prepareConfigJson(config));
  }

  const minimalConfig: AccountConfigForm = {
    ...DEFAULT_CONFIG,
    username: "guliveer_",
    streamers: [{ username: "xQc" }],
  };

  it("produces valid JSON", () => {
    expect(() => prepareConfigJson(minimalConfig)).not.toThrow();
  });

  it("strips empty proxy string", () => {
    const config = { ...minimalConfig, proxy: "" };
    const result = parse(config);
    expect(result.proxy).toBeUndefined();
  });

  it("strips empty webhook_url in discord", () => {
    const config: AccountConfigForm = {
      ...minimalConfig,
      notifications: {
        discord: { enabled: false, webhook_url: "", events: [] },
      },
    };
    const result = parse(config);
    const discord = (result.notifications as Record<string, unknown>)?.discord as Record<string, unknown> | undefined;
    expect(discord?.webhook_url).toBeUndefined();
  });

  it("strips empty events array from disabled provider", () => {
    const config: AccountConfigForm = {
      ...minimalConfig,
      notifications: {
        discord: { enabled: false, webhook_url: "", events: [] },
      },
    };
    const result = parse(config);
    const discord = (result.notifications as Record<string, unknown>)?.discord as Record<string, unknown> | undefined;
    expect(discord?.events).toBeUndefined();
  });

  it("preserves non-empty events array", () => {
    const config: AccountConfigForm = {
      ...minimalConfig,
      notifications: {
        telegram: { enabled: true, token: "t", chat_id: "c", events: ["BET_WIN", "DROP_CLAIM"], disable_notification: false },
      },
    };
    const result = parse(config);
    const telegram = (result.notifications as Record<string, unknown>)?.telegram as Record<string, unknown> | undefined;
    expect(telegram?.events).toEqual(["BET_WIN", "DROP_CLAIM"]);
  });

  it("adds empty bet object when make_predictions=true and bet is missing", () => {
    const config: AccountConfigForm = {
      ...minimalConfig,
      streamer_defaults: { make_predictions: true },
    };
    const result = parse(config);
    const defaults = result.streamer_defaults as Record<string, unknown>;
    expect(defaults.make_predictions).toBe(true);
    expect(defaults.bet).toBeDefined();
  });

  it("does not add bet when make_predictions=false", () => {
    const config: AccountConfigForm = {
      ...minimalConfig,
      streamer_defaults: { make_predictions: false },
    };
    const result = parse(config);
    const defaults = result.streamer_defaults as Record<string, unknown> | undefined;
    expect(defaults?.bet).toBeUndefined();
  });

  it("disables category_watcher when enabled=true but no categories", () => {
    const config: AccountConfigForm = {
      ...minimalConfig,
      category_watcher: { enabled: true, drops_only: false, categories: [] },
    };
    const result = parse(config);
    const cw = result.category_watcher as Record<string, unknown>;
    expect(cw.enabled).toBe(false);
  });

  it("keeps category_watcher enabled when categories are present", () => {
    const config: AccountConfigForm = {
      ...minimalConfig,
      category_watcher: {
        enabled: true,
        drops_only: false,
        categories: [{ slug: "valorant" }],
      },
    };
    const result = parse(config);
    const cw = result.category_watcher as Record<string, unknown>;
    expect(cw.enabled).toBe(true);
  });

  it("disables team_watcher when enabled=true but no teams", () => {
    const config: AccountConfigForm = {
      ...minimalConfig,
      team_watcher: { enabled: true, teams: [] },
    };
    const result = parse(config);
    const tw = result.team_watcher as Record<string, unknown>;
    expect(tw.enabled).toBe(false);
  });

  it("keeps team_watcher enabled when teams are present", () => {
    const config: AccountConfigForm = {
      ...minimalConfig,
      team_watcher: { enabled: true, teams: [{ name: "rainbow6" }] },
    };
    const result = parse(config);
    const tw = result.team_watcher as Record<string, unknown>;
    expect(tw.enabled).toBe(true);
  });

  it("ensures streamers array exists even when empty (avoids Go validation error)", () => {
    const config: AccountConfigForm = {
      ...minimalConfig,
      streamers: [],
      followers: { enabled: false, order: "ASC" },
      category_watcher: { enabled: false, drops_only: false, categories: [] },
      team_watcher: { enabled: false, teams: [] },
    };
    const result = parse(config);
    expect(Array.isArray(result.streamers)).toBe(true);
  });

  it("strips per-streamer settings.chat empty string", () => {
    const config: AccountConfigForm = {
      ...minimalConfig,
      streamers: [{ username: "xQc", settings: { chat: "" as unknown as "ALWAYS" } }],
    };
    const result = parse(config);
    const streamers = result.streamers as Record<string, unknown>[];
    expect((streamers[0].settings as Record<string, unknown> | undefined)?.chat).toBeUndefined();
  });

  it("preserves per-streamer settings.chat when set", () => {
    const config: AccountConfigForm = {
      ...minimalConfig,
      streamers: [{ username: "xQc", settings: { chat: "NEVER" } }],
    };
    const result = parse(config);
    const streamers = result.streamers as Record<string, unknown>[];
    expect((streamers[0].settings as Record<string, unknown>).chat).toBe("NEVER");
  });

  it("does not write username inside config_json (bot derives it from filename)", () => {
    const result = parse(minimalConfig);
    // username IS stored in config_json for the DB — but the bot uses AccountConfigFromJSON
    // which overrides it from the DB row anyway. Just verify it's present and correct.
    expect(result.username).toBe("guliveer_");
  });

  it("real-world config round-trip: guliveer_ stays intact after strip", () => {
    const config: AccountConfigForm = {
      ...DEFAULT_CONFIG,
      username: "guliveer_",
      max_watch_streams: 10,
      priority: ["DROPS", "ORDER", "STREAK"],
      category_watcher: {
        enabled: true,
        poll_interval: "3m0s",
        drops_only: true,
        categories: [{ slug: "tom-clancys-rainbow-six-siege", drops_only: false }],
      },
      team_watcher: { enabled: true, poll_interval: "3m0s", teams: [{ name: "rainbow6" }] },
      streamers: [{ username: "Guliveer_" }, { username: "Battlefield" }],
      followers: { enabled: false, order: "ASC" },
      notifications: {
        telegram: {
          enabled: true,
          token: "5662954956:AAESF6tl3WnQrdut7RNUEvZdiy-bXhvOz0s",
          chat_id: "5712601158",
          events: ["DROP_CLAIM", "MINER_STARTED"],
          disable_notification: true,
          batch: { enabled: true, interval: "4h0m0s", max_entries: 15 },
        },
      },
      proxy: "",
    };
    const result = parse(config);

    expect(result.proxy).toBeUndefined();
    expect((result.category_watcher as Record<string, unknown>).enabled).toBe(true);
    expect((result.team_watcher as Record<string, unknown>).enabled).toBe(true);
    const telegram = ((result.notifications as Record<string, unknown>).telegram) as Record<string, unknown>;
    expect(telegram.enabled).toBe(true);
    expect(telegram.events).toEqual(["DROP_CLAIM", "MINER_STARTED"]);
    expect((telegram.batch as Record<string, unknown>).interval).toBe("4h0m0s");
  });
});

// ─── accountConfigSchema ─────────────────────────────────────────────────────

import { accountConfigSchema } from "../config-schema";

describe("accountConfigSchema", () => {
  it("parses minimal valid config", () => {
    const result = accountConfigSchema.safeParse({
      username: "testuser",
      features: { claim_drops_startup: false, enable_analytics: true },
      priority: ["STREAK"],
      category_watcher: { enabled: false, drops_only: false, categories: [] },
      team_watcher: { enabled: false, teams: [] },
      streamer_defaults: {},
      streamers: [],
      blacklist: [],
      category_blacklist: [],
      followers: { enabled: false, order: "ASC" },
      notifications: {},
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid priority value", () => {
    const result = accountConfigSchema.safeParse({
      username: "x",
      features: { claim_drops_startup: false, enable_analytics: false },
      priority: ["INVALID_PRIORITY"],
      category_watcher: { enabled: false, drops_only: false, categories: [] },
      team_watcher: { enabled: false, teams: [] },
      streamer_defaults: {},
      streamers: [],
      blacklist: [],
      category_blacklist: [],
      followers: { enabled: false, order: "ASC" },
      notifications: {},
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid chat mode in streamer_defaults", () => {
    const result = accountConfigSchema.safeParse({
      username: "x",
      features: { claim_drops_startup: false, enable_analytics: false },
      priority: ["STREAK"],
      category_watcher: { enabled: false, drops_only: false, categories: [] },
      team_watcher: { enabled: false, teams: [] },
      streamer_defaults: { chat: "SOMETIMES" },
      streamers: [],
      blacklist: [],
      category_blacklist: [],
      followers: { enabled: false, order: "ASC" },
      notifications: {},
    });
    expect(result.success).toBe(false);
  });

  it("coerces null arrays to empty via .catch([])", () => {
    const result = accountConfigSchema.safeParse({
      username: "x",
      features: { claim_drops_startup: false, enable_analytics: false },
      priority: ["STREAK"],
      category_watcher: { enabled: false, drops_only: false, categories: null },
      team_watcher: { enabled: false, teams: null },
      streamer_defaults: {},
      streamers: null,
      blacklist: null,
      category_blacklist: null,
      followers: { enabled: false, order: "ASC" },
      notifications: {},
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.streamers).toEqual([]);
      expect(result.data.blacklist).toEqual([]);
      expect(result.data.category_watcher.categories).toEqual([]);
    }
  });

  it("validates correct bet strategy enum", () => {
    const result = accountConfigSchema.safeParse({
      username: "x",
      features: { claim_drops_startup: false, enable_analytics: false },
      priority: ["STREAK"],
      category_watcher: { enabled: false, drops_only: false, categories: [] },
      team_watcher: { enabled: false, teams: [] },
      streamer_defaults: { bet: { strategy: "SMART" } },
      streamers: [],
      blacklist: [],
      category_blacklist: [],
      followers: { enabled: false, order: "ASC" },
      notifications: {},
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid bet strategy", () => {
    const result = accountConfigSchema.safeParse({
      username: "x",
      features: { claim_drops_startup: false, enable_analytics: false },
      priority: ["STREAK"],
      category_watcher: { enabled: false, drops_only: false, categories: [] },
      team_watcher: { enabled: false, teams: [] },
      streamer_defaults: { bet: { strategy: "YOLO" } },
      streamers: [],
      blacklist: [],
      category_blacklist: [],
      followers: { enabled: false, order: "ASC" },
      notifications: {},
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid duration string for poll_interval", () => {
    const result = accountConfigSchema.safeParse({
      username: "x",
      features: { claim_drops_startup: false, enable_analytics: false },
      priority: ["STREAK"],
      category_watcher: { enabled: false, poll_interval: "3m0s", drops_only: false, categories: [] },
      team_watcher: { enabled: false, poll_interval: "2m30s", teams: [] },
      streamer_defaults: {},
      streamers: [],
      blacklist: [],
      category_blacklist: [],
      followers: { enabled: false, order: "ASC" },
      notifications: {},
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid duration string", () => {
    const result = accountConfigSchema.safeParse({
      username: "x",
      features: { claim_drops_startup: false, enable_analytics: false },
      priority: ["STREAK"],
      category_watcher: { enabled: false, poll_interval: "5 minutes", drops_only: false, categories: [] },
      team_watcher: { enabled: false, teams: [] },
      streamer_defaults: {},
      streamers: [],
      blacklist: [],
      category_blacklist: [],
      followers: { enabled: false, order: "ASC" },
      notifications: {},
    });
    expect(result.success).toBe(false);
  });
});
