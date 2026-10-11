import { getConfigSchema } from "../get-config-schema";
import schemaFallback from "@/lib/schema-fallback.json";

test("returns fallback schema when BOT_URL is unset", async () => {
  delete process.env.BOT_URL;
  delete process.env.BOT_API_KEY;
  const schema = await getConfigSchema();
  expect(schema).toEqual(schemaFallback);
});