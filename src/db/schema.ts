import { pgTable, text, boolean, primaryKey } from "drizzle-orm/pg-core";

export const userMeta = pgTable("user_meta", {
  userId: text("user_id").primaryKey(),
  mustChangePassword: boolean("must_change_password").notNull().default(true),
  role: text("role").notNull().default("user"),
});

export const userAccounts = pgTable(
  "user_accounts",
  {
    userId: text("user_id").notNull(),
    botUsername: text("bot_username").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.botUsername] })]
);
