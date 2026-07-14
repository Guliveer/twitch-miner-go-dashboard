-- User role enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Dashboard user metadata (linked to Supabase Auth users)
CREATE TABLE user_meta (
    user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
    role            user_role NOT NULL DEFAULT 'user'
);

-- Links dashboard users to bot accounts they own
CREATE TABLE user_accounts (
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bot_username TEXT NOT NULL,
    PRIMARY KEY (user_id, bot_username)
);

-- Bot accounts (owned and migrated by the Go bot, not the dashboard)
-- Uses IF NOT EXISTS because the bot's goose migrations may have already created this table.
CREATE TABLE IF NOT EXISTS accounts (
    username        TEXT PRIMARY KEY,
    config_json     TEXT NOT NULL,
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at      BIGINT NOT NULL,
    last_started_at BIGINT
);

-- Notify function for real-time subscriptions (used by the Go bot)
CREATE OR REPLACE FUNCTION accounts_notify() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN PERFORM pg_notify('accounts_changed', ''); RETURN NULL; END;
$$;

DROP TRIGGER IF EXISTS accounts_changed_trigger ON accounts;
CREATE TRIGGER accounts_changed_trigger
    AFTER INSERT OR UPDATE OR DELETE ON accounts
    FOR EACH STATEMENT EXECUTE FUNCTION accounts_notify();

-- RLS policies
ALTER TABLE user_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- user_meta: users can read/update their own row; service_role bypasses
CREATE POLICY "Users can view own meta"
    ON user_meta FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own meta"
    ON user_meta FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role manages user_meta"
    ON user_meta FOR ALL
    USING (true)
    WITH CHECK (true);

-- user_accounts: users see only their own links
CREATE POLICY "Users can view own account links"
    ON user_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role manages account links"
    ON user_accounts FOR ALL
    USING (true)
    WITH CHECK (true);

-- accounts: readable by all authenticated users (dashboard needs to list them)
CREATE POLICY "Authenticated users can read accounts"
    ON accounts FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Service role manages accounts"
    ON accounts FOR ALL
    USING (true)
    WITH CHECK (true);

-- Seed admin user_meta row (the first user created becomes admin via dashboard)
-- You'll insert this manually after first signup:
-- INSERT INTO user_meta (user_id, role, must_change_password) VALUES ('<auth-uuid>', 'admin', false);

-- Heartbeat table — keeps Supabase free tier alive via Vercel cron
CREATE TABLE IF NOT EXISTS heartbeat (
    id         INT PRIMARY KEY DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO heartbeat (id, updated_at) VALUES (1, now()) ON CONFLICT (id) DO NOTHING;
ALTER TABLE heartbeat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages heartbeat"
    ON heartbeat FOR ALL
    USING (true)
    WITH CHECK (true);
