import { z } from "zod";

const PRIORITIES = ["STREAK", "DROPS", "ORDER", "SUBSCRIBED", "POINTS_ASCENDING", "POINTS_DESCENDING"] as const;
const CHAT_MODES = ["ALWAYS", "NEVER", "ONLINE", "OFFLINE"] as const;
const STRATEGIES = ["SMART", "HIGH_ODDS", "MOST_VOTED", "SMART_MONEY", "PERCENTAGE", "NUMBER_1", "NUMBER_2", "NUMBER_3", "NUMBER_4", "NUMBER_5", "NUMBER_6", "NUMBER_7", "NUMBER_8"] as const;
const DELAY_MODES = ["FROM_START", "FROM_END", "PERCENTAGE"] as const;
const OUTCOME_KEYS = ["percentage_users", "odds_percentage", "odds", "top_points", "total_users", "total_points"] as const;
const CONDITIONS = ["GT", "LT", "GTE", "LTE"] as const;
const FOLLOWERS_ORDERS = ["ASC", "DESC"] as const;
const WEBHOOK_METHODS = ["GET", "POST"] as const;

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
  "DROP_STATUS",
  "CHAT_MENTION",
  "GIFTED_SUB",
  "MINER_STARTED",
  "MINER_STOPPED",
  "MINER_CRASHED",
  "ACCOUNT_ADDED",
  "ACCOUNT_CONFIG_RELOADED",
  "TEST",
] as const;

const durationString = z
  .string()
  .regex(
    /^\d+(\.\d+)?(ns|us|µs|ms|s|m|h)(\d+(\.\d+)?(ns|us|µs|ms|s|m|h))*$/,
    "Invalid duration (e.g. '2m0s', '120s')",
  );

const filterConditionSchema = z.object({
  by: z.enum(OUTCOME_KEYS),
  where: z.enum(CONDITIONS),
  value: z.number(),
});

const betSettingsSchema = z.object({
  strategy: z.enum(STRATEGIES).optional(),
  percentage: z.number().int().optional(),
  percentage_gap: z.number().int().optional(),
  max_points: z.number().int().optional(),
  minimum_points: z.number().int().optional(),
  stealth_mode: z.boolean().optional(),
  delay: z.number().optional(),
  delay_mode: z.enum(DELAY_MODES).optional(),
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
  chat: z.enum(CHAT_MODES).optional(),
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
  immediate_events: z.array(z.enum(ALL_EVENTS)).optional(),
});

const telegramSchema = z.object({
  enabled: z.boolean(),
  token: z.string().optional(),
  chat_id: z.string().optional(),
  events: z.array(z.enum(ALL_EVENTS)),
  disable_notification: z.boolean(),
  batch: batchConfigSchema.optional(),
});

const discordSchema = z.object({
  enabled: z.boolean(),
  webhook_url: z.string().url().optional().or(z.literal("")),
  events: z.array(z.enum(ALL_EVENTS)),
  batch: batchConfigSchema.optional(),
});

const webhookSchema = z.object({
  enabled: z.boolean(),
  endpoint: z.string().url().optional().or(z.literal("")),
  method: z.enum(WEBHOOK_METHODS),
  events: z.array(z.enum(ALL_EVENTS)),
  batch: batchConfigSchema.optional(),
});

const matrixSchema = z.object({
  enabled: z.boolean(),
  homeserver: z.string().optional(),
  room_id: z.string().optional(),
  access_token: z.string().optional(),
  events: z.array(z.enum(ALL_EVENTS)),
  batch: batchConfigSchema.optional(),
});

const pushoverSchema = z.object({
  enabled: z.boolean(),
  user_key: z.string().optional(),
  api_token: z.string().optional(),
  events: z.array(z.enum(ALL_EVENTS)),
  batch: batchConfigSchema.optional(),
});

const gotifySchema = z.object({
  enabled: z.boolean(),
  url: z.string().url().optional().or(z.literal("")),
  token: z.string().optional(),
  events: z.array(z.enum(ALL_EVENTS)),
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
  max_watch_streams: z.number().int().min(1).optional(),
  priority: z.array(z.enum(PRIORITIES)),
  proxy: z.string().optional(),
  category_watcher: z.object({
    enabled: z.boolean(),
    poll_interval: durationString.optional(),
    drops_only: z.boolean(),
    categories: z.array(categoryConfigSchema),
  }),
  team_watcher: z.object({
    enabled: z.boolean(),
    poll_interval: durationString.optional(),
    teams: z.array(z.object({ name: z.string().min(1) })),
  }),
  streamer_defaults: streamerSettingsSchema,
  streamers: z.array(streamerConfigSchema),
  blacklist: z.array(z.string()),
  category_blacklist: z.array(z.string()),
  followers: z.object({
    enabled: z.boolean(),
    order: z.enum(FOLLOWERS_ORDERS),
  }),
  notifications: notificationsSchema,
});

export type AccountConfigForm = z.infer<typeof accountConfigSchema>;

export const DEFAULT_CONFIG: AccountConfigForm = {
  username: "",
  enabled: true,
  features: { claim_drops_startup: false, enable_analytics: true },
  max_watch_streams: 2,
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
