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
