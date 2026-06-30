# Twitch Miner Go — Dashboard Design

## Context

`twitch-miner-go` is a Go bot that farms Twitch channel points. It stores per-account configurations
in a Neon PostgreSQL table (`accounts.config_json`). Currently there is no web UI — config must be
edited directly in YAML files or the database.

This dashboard provides a browser-based management interface for those configurations. The goal is
to allow the owner to share the platform with friends so each person can self-manage their own bot
accounts without seeing or affecting anyone else's.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router (TypeScript) |
| UI | shadcn/ui + Tailwind CSS |
| Auth | Neon Auth (`@neondatabase/auth`) — Better Auth under the hood |
| ORM | Drizzle ORM + `@neondatabase/serverless` |
| Validation | Zod |
| Forms | React Hook Form |

---

## Database Schema

Neon Auth manages `neon_auth.users` and sessions automatically.

Three additional tables:

```sql
-- Flags and role per dashboard user
CREATE TABLE user_meta (
    user_id              TEXT PRIMARY KEY,  -- = neon_auth user ID
    must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
    role                 TEXT NOT NULL DEFAULT 'user'  -- 'user' | 'admin'
);

-- Ownership: which dashboard user owns which bot account
CREATE TABLE user_accounts (
    user_id      TEXT NOT NULL,
    bot_username TEXT NOT NULL,  -- FK → accounts.username
    PRIMARY KEY (user_id, bot_username)
);

-- Existing bot table — structure unchanged
CREATE TABLE accounts (
    username        TEXT PRIMARY KEY,
    config_json     TEXT NOT NULL,
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at      BIGINT NOT NULL,
    last_started_at BIGINT
);
```

Drizzle schema lives in `src/db/schema.ts`. All migrations via `drizzle-kit`.

---

## Authentication & Access Control

### Invite-only flow

No public registration. Only an admin can create dashboard accounts.

**Admin creates a user:**
1. Opens `/admin/users/new`
2. Enters the friend's email
3. A random temporary password is generated client-side and shown once
4. Server Action calls `auth.signUp.email({ email, password, name })` and inserts a
   `user_meta` row with `must_change_password = true, role = 'user'`
5. Admin shares email + temp password with the friend manually

**First login:**
1. User logs in at `/login` with the temp password
2. Middleware detects `must_change_password = true` → redirects to `/change-password`
3. User sets a new password via Server Action (`auth.changePassword()`)
4. `user_meta.must_change_password` is set to `false`
5. Redirect to `/dashboard`

### Middleware (`src/middleware.ts`)

Three rules, evaluated in order:

1. No valid session → redirect to `/login`
2. Session + `must_change_password = true` + not on `/change-password` → redirect to `/change-password`
3. Path starts with `/admin` + `role !== 'admin'` → 403

### Ownership enforcement

Every Server Action that reads or writes a bot account runs this check before executing:

```ts
const ownership = await db.query.userAccounts.findFirst({
  where: and(eq(userAccounts.botUsername, username), eq(userAccounts.userId, session.user.id)),
});
if (!ownership) throw new Error("Forbidden");
```

No client-provided user ID is trusted — session is always the source of truth.

---

## Pages & Routes

```
/login                     Login form
/change-password           Forced on first login; blocked until password is changed

/dashboard                 Grid of bot account cards + "New account" button
/dashboard/[username]      Config editor for one bot account (tabbed)

/admin                     Redirect to /admin/users
/admin/users               Table of all dashboard users (email, role, must_change_password)
/admin/users/new           Create user form: email → generated temp password (shown once)
```

---

## Dashboard (`/dashboard`)

Shows a card per bot account owned by the current user. Each card displays:

- Bot account username
- Status badge derived from `accounts.enabled` and `accounts.last_started_at`:
  - **Active** — `enabled = true`
  - **Disabled** — `enabled = false`
  - **Never started** — `last_started_at IS NULL`
- Quick-toggle for `enabled` (inline, no full-page reload)
- Link to the config editor

A "New account" button opens a modal:
- Input: Twitch username
- Validation: username must not already exist in `accounts`
- On submit: Server Action inserts into `accounts` (with minimal default `config_json`) and
  into `user_accounts`, then redirects to `/dashboard/[username]`

Delete is also on the card (with confirmation dialog). Server Action deletes from `accounts`
and `user_accounts` in a transaction.

---

## Config Editor (`/dashboard/[username]`)

Five tabs using shadcn `Tabs`. The entire form is one React Hook Form instance backed by a Zod
schema mirroring `AccountConfig` from the Go bot. On save, a single Server Action
`updateBotAccount(username, config)` serialises the validated object to `config_json`.

### Tab: General

| Field | Type | Notes |
|---|---|---|
| enabled | Toggle | Maps to `accounts.enabled` column directly |
| max_watch_streams | Number input | Min 1 |
| priority | Select | STREAK, DROPS, ORDER, SUBSCRIBED, POINTS_ASCENDING, POINTS_DESCENDING |
| proxy | Text input | Optional, validated as URL |
| followers.enabled | Toggle | |
| followers.order | Select | ASC, DESC |

### Tab: Streamers

A dynamic list of streamer entries. Each entry is an accordion row:

- **Header:** streamer name + remove button
- **Body (per-streamer overrides):**
  - make_predictions, follow_raid, claim_drops, claim_moments, watch_streak,
    community_goals, drops_only — all toggles
  - chat — Select (ALWAYS, NEVER, ONLINE, OFFLINE)

"Add streamer" appends a new row with default values.

### Tab: Betting

Top-level toggle: `make_predictions`. The rest of the section is disabled when off.

| Field | Type |
|---|---|
| strategy | Select (SMART, HIGH_ODDS, MOST_VOTED, SMART_MONEY, PERCENTAGE, NUMBER_1..8) |
| percentage | Number input |
| percentage_gap | Number input |
| max_points | Number input |
| minimum_points | Number input |
| stealth_mode | Toggle |
| delay | Number input (seconds) |
| delay_mode | Select (FROM_START, FROM_END, PERCENTAGE) |
| filter_condition.by | Select (percentage_users, odds_percentage, odds, top_points, total_users, total_points) |
| filter_condition.where | Select (GT, LT, GTE, LTE) |
| filter_condition.value | Number input |

### Tab: Notifications

One accordion section per provider: Telegram, Discord, Webhook, Matrix, Pushover, Gotify.
Each section has:

- `enabled` toggle in the header
- Provider-specific credential fields (shown only when enabled)
- `events` multi-select (24 event types: STREAMER_ONLINE, BET_WIN, DROP_CLAIM, etc.)
- Batch settings sub-section: enabled, interval, max_entries, immediate_events

### Tab: Watchers

Two sub-sections:

**Category Watcher:**
- enabled toggle
- poll_interval (number, seconds)
- drops_only toggle
- categories — tag-input (list of game slugs)

**Team Watcher:**
- enabled toggle
- poll_interval (number, seconds)
- teams — tag-input (list of team names)

---

## Admin Panel (`/admin/users`)

Table columns: email, role, must_change_password, created_at.

Actions per row:
- **Reset password** — generates a new temp password, calls auth API, sets
  `must_change_password = true`, shows the new temp password once
- **Delete user** — with confirmation; also deletes their `user_meta` and `user_accounts` rows
  but leaves `accounts` records intact (orphaned configs stay in the bot's table)

`/admin/users/new` form:
- Email input
- On submit: auto-generates a 16-char random password (shown in a copy-to-clipboard box)
- Creates Neon Auth user + `user_meta` row

---

## Zod / TypeScript Config Schema

A single Zod schema in `src/lib/config-schema.ts` mirrors the Go `AccountConfig` struct exactly.
This schema is used for:
1. React Hook Form validation in the editor
2. Server Action input validation before writing to the DB
3. Parsing existing `config_json` when loading the editor

---

## File Structure

```
src/
  app/
    (auth)/
      login/page.tsx
      change-password/page.tsx
    (app)/
      dashboard/page.tsx
      dashboard/[username]/page.tsx
      dashboard/[username]/tabs/  (GeneralTab, StreamersTab, BettingTab, NotificationsTab, WatchersTab)
    admin/
      users/page.tsx
      users/new/page.tsx
    api/
      auth/[...path]/route.ts     (Neon Auth catch-all)
  actions/
    auth.ts         (createUser, changePassword, resetPassword)
    accounts.ts     (createBotAccount, updateBotAccount, deleteBotAccount, toggleEnabled)
  db/
    index.ts        (Drizzle client + Neon serverless)
    schema.ts       (userMeta, userAccounts tables; accounts imported for queries)
    migrations/
  lib/
    config-schema.ts   (Zod schema for AccountConfig)
    auth.ts            (createNeonAuth instance, helper to get current session)
    utils.ts
  middleware.ts
  components/
    ui/              (shadcn primitives)
    config-editor/   (tab components, shared form pieces)
    dashboard/       (AccountCard, NewAccountModal, DeleteAccountDialog)
    admin/           (UsersTable, CreateUserForm)
```

---

## Verification

1. **Auth flow** — create a user as admin, log in with temp password, confirm redirect to
   `/change-password`, set new password, confirm redirect to `/dashboard`
2. **Ownership isolation** — log in as user A, note their bot account username, log in as user B,
   confirm `/dashboard/[usernameA]` returns 403/redirect
3. **Config round-trip** — fill in all five tabs, save, reload page, confirm all values match
4. **Bot compatibility** — after saving, read `config_json` from Neon directly (psql or Neon
   console) and confirm it parses without error against the Go `AccountConfig` struct
5. **Status badge** — toggle `enabled` via the card quick-toggle, confirm the badge updates and
   the `accounts` row changes in the DB
6. **Delete** — delete a bot account, confirm it disappears from `accounts` and `user_accounts`
7. **Admin access control** — log in as a regular user, attempt to navigate to `/admin/users`,
   confirm redirect/403
