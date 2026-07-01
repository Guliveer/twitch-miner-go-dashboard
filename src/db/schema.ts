import { pgTable, text, boolean, primaryKey, pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const userMeta = pgTable("user_meta", {
  userId: text("user_id").primaryKey(),
  mustChangePassword: boolean("must_change_password").notNull().default(true),
  role: userRoleEnum("role").notNull().default("user"),
});

export const userAccounts = pgTable(
  "user_accounts",
  {
    userId: text("user_id").notNull(),
    botUsername: text("bot_username").notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.botUsername] })]
);
