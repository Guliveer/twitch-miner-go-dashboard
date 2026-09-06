import { accountConfigSchema } from "../config-schema";

test("parses minimal config", () => {
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

test("parses watch streak and preferred streamer settings", () => {
  const result = accountConfigSchema.safeParse({
    username: "testuser",
    features: { claim_drops_startup: false, enable_analytics: true },
    priority: ["PREFERRED", "DROPS"],
    streak_watch_streams: 0,
    watch_streak_minutes: 5,
    preferred_streamers: ["xqc", "summit1g"],
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

test("rejects watch_streak_minutes of zero", () => {
  const result = accountConfigSchema.safeParse({
    username: "testuser",
    features: { claim_drops_startup: false, enable_analytics: true },
    priority: ["STREAK"],
    watch_streak_minutes: 0,
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

test("rejects negative streak_watch_streams", () => {
  const result = accountConfigSchema.safeParse({
    username: "testuser",
    features: { claim_drops_startup: false, enable_analytics: true },
    priority: ["STREAK"],
    streak_watch_streams: -1,
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
