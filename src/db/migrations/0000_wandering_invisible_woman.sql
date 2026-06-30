CREATE TABLE "user_accounts" (
	"user_id" text NOT NULL,
	"bot_username" text NOT NULL,
	CONSTRAINT "user_accounts_user_id_bot_username_pk" PRIMARY KEY("user_id","bot_username")
);
--> statement-breakpoint
CREATE TABLE "user_meta" (
	"user_id" text PRIMARY KEY NOT NULL,
	"must_change_password" boolean DEFAULT true NOT NULL,
	"role" text DEFAULT 'user' NOT NULL
);
