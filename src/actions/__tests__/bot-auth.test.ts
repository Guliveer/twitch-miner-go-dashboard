import { checkBotAuthStatuses } from "../bot-auth";

const BOT_URL = "http://bot.test";
const PENDING = {
  status: "pending" as const,
  user_code: "ABCD-1234",
  verification_uri: "https://www.twitch.tv/activate",
  expires_at: 1730000000,
};

function mockFetch(response: Response | Error) {
  return jest.spyOn(global, "fetch").mockImplementation(() => {
    if (response instanceof Error) {
      return Promise.reject(response);
    }
    return Promise.resolve(response);
  });
}

beforeEach(() => {
  process.env.BOT_URL = BOT_URL;
  process.env.BOT_API_KEY = "test-key";
});

afterEach(() => {
  delete process.env.BOT_URL;
  delete process.env.BOT_API_KEY;
  jest.restoreAllMocks();
});

test("fetches every pending flow in a single request", async () => {
  const fetchMock = mockFetch(
    new Response(JSON.stringify({ Alice: PENDING, bob: { ...PENDING, user_code: "EFGH" } }), {
      status: 200,
    }),
  );

  const statuses = await checkBotAuthStatuses();

  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0][0]).toBe(`${BOT_URL}/api/auth-status`);
  expect(statuses).toEqual({
    alice: PENDING,
    bob: { ...PENDING, user_code: "EFGH" },
  });
});

test("returns an empty map when no flow is pending", async () => {
  mockFetch(new Response("{}", { status: 200 }));

  await expect(checkBotAuthStatuses()).resolves.toEqual({});
});

test("returns null when the bot predates the batched endpoint", async () => {
  mockFetch(new Response("not found", { status: 404 }));

  await expect(checkBotAuthStatuses()).resolves.toBeNull();
});

test("drops malformed entries", async () => {
  mockFetch(new Response(JSON.stringify({ alice: PENDING, broken: "x", empty: null }), { status: 200 }));

  await expect(checkBotAuthStatuses()).resolves.toEqual({ alice: PENDING });
});

test("returns an empty map when the bot is unreachable", async () => {
  mockFetch(new Error("connect ECONNREFUSED"));

  await expect(checkBotAuthStatuses()).resolves.toEqual({});
});

test("returns null without bot configuration", async () => {
  delete process.env.BOT_URL;
  const fetchMock = jest.spyOn(global, "fetch");

  await expect(checkBotAuthStatuses()).resolves.toBeNull();
  expect(fetchMock).not.toHaveBeenCalled();
});
