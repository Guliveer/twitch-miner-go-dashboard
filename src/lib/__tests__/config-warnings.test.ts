import { getConfigWarnings } from "../config-warnings";
import { DEFAULT_CONFIG, type AccountConfigForm } from "../config-schema";

const NOTIFICATION_PROVIDERS = [
  "telegram",
  "discord",
  "webhook",
  "matrix",
  "pushover",
  "gotify",
];

function baseConfig(): AccountConfigForm {
  return {
    ...DEFAULT_CONFIG,
    username: "testuser",
    notifications: {
      telegram: { enabled: false, events: [], disable_notification: false },
    },
  };
}

test("returns no warnings for a healthy config", () => {
  const config = baseConfig();
  config.streamers = [{ username: "streamer1" }, { username: "streamer2" }];
  config.notifications.telegram = {
    enabled: true,
    events: ["STREAMER_ONLINE"],
    disable_notification: false,
  };
  expect(getConfigWarnings(config, NOTIFICATION_PROVIDERS)).toEqual([]);
});

test("warns when nothing is configured (idle bot)", () => {
  const config = baseConfig();
  expect(getConfigWarnings(config, NOTIFICATION_PROVIDERS).map((w) => w.id)).toContain("no-activity");
});

test("does not warn about an idle bot when followers are enabled", () => {
  const config = baseConfig();
  config.followers = { enabled: true, order: "ASC" };
  expect(getConfigWarnings(config, NOTIFICATION_PROVIDERS).map((w) => w.id)).not.toContain("no-activity");
});

test("warns on duplicate streamers", () => {
  const config = baseConfig();
  config.streamers = [{ username: "dupe" }, { username: "dupe" }];
  const ids = getConfigWarnings(config, NOTIFICATION_PROVIDERS).map((w) => w.id);
  expect(ids).toContain("duplicate-streamer");
  expect(ids).not.toContain("no-activity");
});

test("warns when a streamer is both watched and blacklisted", () => {
  const config = baseConfig();
  config.streamers = [{ username: "Alpha" }];
  config.blacklist = ["alpha"];
  expect(getConfigWarnings(config, NOTIFICATION_PROVIDERS).map((w) => w.id)).toContain("blacklist-conflict");
});

test("warns when a category is both watched and blacklisted", () => {
  const config = baseConfig();
  config.streamers = [{ username: "streamer1" }];
  config.category_watcher = {
    enabled: true,
    poll_interval: "2m0s",
    drops_only: false,
    categories: [{ slug: "Rust" }],
  };
  config.category_blacklist = ["rust"];
  expect(getConfigWarnings(config, NOTIFICATION_PROVIDERS).map((w) => w.id)).toContain(
    "category-blacklist-conflict",
  );
});

test("warns when a notification provider is enabled without events", () => {
  const config = baseConfig();
  config.streamers = [{ username: "streamer1" }];
  config.notifications.telegram = {
    enabled: true,
    events: [],
    disable_notification: false,
  };
  expect(getConfigWarnings(config, NOTIFICATION_PROVIDERS).map((w) => w.id)).toContain(
    "notification-no-events-telegram",
  );
});

test("does not warn when a disabled provider has no events", () => {
  const config = baseConfig();
  config.streamers = [{ username: "streamer1" }];
  config.notifications.telegram = {
    enabled: false,
    events: [],
    disable_notification: false,
  };
  const ids = getConfigWarnings(config, NOTIFICATION_PROVIDERS).map((w) => w.id);
  expect(ids).not.toContain("notification-no-events-telegram");
});
