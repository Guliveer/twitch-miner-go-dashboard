import { z } from "zod";

// Enum values mirror the bot's internal/model package. Keep in sync with
// twitch-miner-go when the bot adds or renames values.
/** @deprecated Use useBotSchema() */
export const PRIORITIES = [
  "STREAK",
  "DROPS",
  "ORDER",
  "SUBSCRIBED",
  "POINTS_ASCENDING",
  "POINTS_DESCENDING",
  "ENDING_SOONEST",
  "LOW_AVAILABILITY_FIRST",
  "PREFERRED",
] as const;
/** @deprecated Use useBotSchema() */
export const CHAT_MODES = ["ALWAYS", "NEVER", "ONLINE", "OFFLINE"] as const;
/** @deprecated Use useBotSchema() */
export const STRATEGIES = ["SMART", "HIGH_ODDS", "MOST_VOTED", "SMART_MONEY", "PERCENTAGE", "NUMBER_1", "NUMBER_2", "NUMBER_3", "NUMBER_4", "NUMBER_5", "NUMBER_6", "NUMBER_7", "NUMBER_8"] as const;
/** @deprecated Use useBotSchema() */
export const DELAY_MODES = ["FROM_START", "FROM_END", "PERCENTAGE"] as const;
/** @deprecated Use useBotSchema() */
export const OUTCOME_KEYS = ["percentage_users", "odds_percentage", "odds", "top_points", "total_users", "total_points", "decision_users", "decision_points"] as const;
/** @deprecated Use useBotSchema() */
export const CONDITIONS = ["GT", "LT", "GTE", "LTE"] as const;
/** @deprecated Use useBotSchema() */
export const FOLLOWERS_ORDERS = ["ASC", "DESC"] as const;
/** @deprecated Use useBotSchema() */
export const WEBHOOK_METHODS = ["GET", "POST"] as const;

/** @deprecated Use useBotSchema() */
export const ALL_EVENTS = [
  "STREAMER_ONLINE",
  "STREAMER_OFFLINE",
  "GAIN_FOR_RAID",
  "GAIN_FOR_CLAIM",
  "GAIN_FOR_WATCH",
  "GAIN_FOR_WATCH_STREAK",
  "BET_WIN",
  "BET_LOSE",
  "BET_REFUND",
  "BET_FILTERS",
  "BET_GENERAL",
  "BET_FAILED",
  "BET_START",
  "BONUS_CLAIM",
  "MOMENT_CLAIM",
  "JOIN_RAID",
  "DROP_CLAIM",
  "DROP_CLAIM_AVAILABLE",
  "DROP_STATUS",
  "CHAT_MENTION",
  "GIFTED_SUB",
  "MINER_STARTED",
  "MINER_STOPPED",
  "MINER_CRASHED",
  "ACCOUNT_CONFIG_RELOADED",
  "DROP_MILESTONE",
  "TEST",
] as const;


const durationString = z
  .string()
  .regex(
    /^\d+(\.\d+)?(ns|us|µs|ms|s|m|h)(\d+(\.\d+)?(ns|us|µs|ms|s|m|h))*$/,
    "Invalid duration (e.g. '2m0s', '120s')",
  );

const filterConditionSchema = z.object({
  by: z.string(),
  where: z.string(),
  value: z.number(),
});

export const betSettingsSchema = z.object({
  strategy: z.string().optional(),
  percentage: z.number().int().optional(),
  percentage_gap: z.number().int().optional(),
  max_points: z.number().int().optional(),
  minimum_points: z.number().int().optional(),
  stealth_mode: z.boolean().optional(),
  delay: z.number().optional(),
  delay_mode: z.string().optional(),
  filter_condition: filterConditionSchema.optional(),
});

const streamerSettingsSchema = z.object({
  make_predictions: z.boolean().optional(),
  follow_raid: z.boolean().optional(),
  claim_drops: z.boolean().optional(),
  claim_moments: z.boolean().optional(),
  watch_streak: z.boolean().optional(),
  community_goals: z.boolean().optional(),
  drops_only: z.boolean().optional(),
  chat: z.string().optional(),
  bet: betSettingsSchema.optional(),
});

const streamerConfigSchema = z.object({
  username: z.string().min(1),
  settings: streamerSettingsSchema.optional(),
});

const categoryConfigSchema = z.object({
  slug: z.string().min(1),
  drops_only: z.boolean().optional(),
});

const batchConfigSchema = z.object({
  enabled: z.boolean().optional(),
  interval: durationString.optional(),
  max_entries: z.number().int().optional(),
  immediate_events: z.array(z.string()).optional(),
});

const telegramSchema = z.object({
  enabled: z.boolean(),
  token: z.string().optional(),
  chat_id: z.string().optional(),
  events: z.array(z.string()).default([]),
  disable_notification: z.boolean(),
  batch: batchConfigSchema.optional(),
});

const discordSchema = z.object({
  enabled: z.boolean(),
  webhook_url: z.string().url().optional().or(z.literal("")),
  events: z.array(z.string()).default([]),
  batch: batchConfigSchema.optional(),
});

const webhookSchema = z.object({
  enabled: z.boolean(),
  endpoint: z.string().url().optional().or(z.literal("")),
  method: z.string(),
  events: z.array(z.string()).default([]),
  batch: batchConfigSchema.optional(),
});

const matrixSchema = z.object({
  enabled: z.boolean(),
  homeserver: z.string().optional(),
  room_id: z.string().optional(),
  access_token: z.string().optional(),
  events: z.array(z.string()).default([]),
  batch: batchConfigSchema.optional(),
});

const pushoverSchema = z.object({
  enabled: z.boolean(),
  user_key: z.string().optional(),
  api_token: z.string().optional(),
  events: z.array(z.string()).default([]),
  batch: batchConfigSchema.optional(),
});

const gotifySchema = z.object({
  enabled: z.boolean(),
  url: z.string().url().optional().or(z.literal("")),
  token: z.string().optional(),
  events: z.array(z.string()).default([]),
  batch: batchConfigSchema.optional(),
});

const notificationsSchema = z.object({
  batch: batchConfigSchema.optional(),
  telegram: telegramSchema.optional(),
  discord: discordSchema.optional(),
  webhook: webhookSchema.optional(),
  matrix: matrixSchema.optional(),
  pushover: pushoverSchema.optional(),
  gotify: gotifySchema.optional(),
});

export const accountConfigSchema = z.object({
  username: z.string().min(1),
  enabled: z.boolean().optional(),
  features: z.object({
    claim_drops_startup: z.boolean(),
    enable_analytics: z.boolean(),
  }),
  max_watch_streams: z.number().int().min(0).optional(),
  streak_watch_streams: z.number().int().min(0).optional(),
  watch_streak_minutes: z.number().positive().optional(),
  preferred_streamers: z.array(z.string()).catch([]),
  priority: z.array(z.string()),
  proxy: z
    .string()
    .refine(
      (v) => v === "" || /^(http|https|socks5):\/\/\S+/.test(v),
      "Proxy must start with http://, https://, or socks5:// (e.g. socks5://127.0.0.1:1080)",
    )
    .optional(),
  category_watcher: z.object({
    enabled: z.boolean(),
    poll_interval: durationString.optional(),
    drops_only: z.boolean(),
    categories: z.array(categoryConfigSchema).catch([]),
  }),
  team_watcher: z.object({
    enabled: z.boolean(),
    poll_interval: durationString.optional(),
    teams: z.array(z.object({ name: z.string().min(1) })).catch([]),
  }),
  streamer_defaults: streamerSettingsSchema,
  streamers: z.array(streamerConfigSchema).catch([]),
  blacklist: z.array(z.string()).catch([]),
  category_blacklist: z.array(z.string()).catch([]),
  followers: z.object({
    enabled: z.boolean(),
    order: z.string(),
  }),
  notifications: notificationsSchema,
});

export const generalTabSchema = accountConfigSchema.pick({
  enabled: true,
  max_watch_streams: true,
  streak_watch_streams: true,
  watch_streak_minutes: true,
  preferred_streamers: true,
  priority: true,
  proxy: true,
  features: true,
  followers: true,
});

export const streamersTabSchema = accountConfigSchema.pick({
  streamer_defaults: true,
  streamers: true,
  blacklist: true,
  category_blacklist: true,
});

export const bettingTabSchema = z.object({
  streamer_defaults: z.object({
    make_predictions: z.boolean().optional(),
    bet: betSettingsSchema.optional(),
  }).optional(),
});

export const notificationsTabSchema = accountConfigSchema.pick({
  notifications: true,
});

export const watchersTabSchema = accountConfigSchema.pick({
  category_watcher: true,
  team_watcher: true,
});

export type AccountConfigForm = z.infer<typeof accountConfigSchema>;

export const DEFAULT_CONFIG: AccountConfigForm = {
  username: "",
  enabled: true,
  features: { claim_drops_startup: false, enable_analytics: true },
  max_watch_streams: 2,
  streak_watch_streams: 2,
  watch_streak_minutes: 10,
  preferred_streamers: [],
  priority: ["STREAK", "DROPS", "ORDER"],
  proxy: "",
  category_watcher: { enabled: false, poll_interval: "2m0s", drops_only: false, categories: [] },
  team_watcher: { enabled: false, poll_interval: "2m0s", teams: [] },
  streamer_defaults: {
    make_predictions: true,
    follow_raid: true,
    claim_drops: true,
    claim_moments: true,
    watch_streak: true,
    community_goals: false,
    drops_only: false,
    chat: "ONLINE",
    bet: {
      strategy: "SMART",
      percentage: 5,
      percentage_gap: 20,
      max_points: 50000,
      minimum_points: 0,
      stealth_mode: false,
      delay: 6,
      delay_mode: "FROM_END",
      filter_condition: { by: "total_users", where: "GTE", value: 0 },
    },
  },
  streamers: [],
  blacklist: [],
  category_blacklist: [],
  followers: { enabled: false, order: "ASC" },
  notifications: {
    telegram: { enabled: false, events: [], disable_notification: false },
    discord: { enabled: false, events: [] },
    webhook: { enabled: false, method: "POST", events: [] },
    matrix: { enabled: false, events: [] },
    pushover: { enabled: false, events: [] },
    gotify: { enabled: false, events: [] },
  },
};
