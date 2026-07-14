# twitch-miner-go-dashboard

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![CI](https://img.shields.io/github/actions/workflow/status/Guliveer/twitch-miner-go-dashboard/ci.yml?style=for-the-badge&logo=github&label=CI)](https://github.com/Guliveer/twitch-miner-go-dashboard/actions)
[![License](https://img.shields.io/github/license/Guliveer/twitch-miner-go-dashboard?style=for-the-badge)](LICENSE)

Web dashboard for managing [twitch-miner-go](https://github.com/Guliveer/twitch-miner-go) bot configurations.

Multi-tenant and invite-only — the owner creates accounts for users, each person sees and manages only their own bot accounts. Built on [Supabase](https://supabase.com) PostgreSQL and Supabase Auth, deployed to [Vercel](https://vercel.com).

---

## Table of contents

1. [How it works](#how-it-works)
2. [Features](#features)
3. [Tech stack](#tech-stack)
4. [Prerequisites](#prerequisites)
5. [Local setup](#local-setup)
   - [1. Clone and install](#1-clone-and-install)
   - [2. Create a Supabase project](#2-create-a-supabase-project)
   - [3. Configure environment variables](#3-configure-environment-variables)
   - [4. Run database migrations](#4-run-database-migrations)
   - [5. Create the first admin account](#5-create-the-first-admin-account)
   - [6. Start the dev server](#6-start-the-dev-server)
6. [Deploying to Vercel](#deploying-to-vercel)
7. [Adding users (invite flow)](#adding-users-invite-flow)
8. [Config editor overview](#config-editor-overview)
9. [YAML export](#yaml-export)
10. [Admin panel](#admin-panel)
11. [Database schema](#database-schema)
12. [Testing](#testing)
13. [Project structure](#project-structure)
14. [License](#license)

---

## How it works

The dashboard is a thin UI layer on top of the `accounts` table that `twitch-miner-go` already uses when running in database mode (`DB_ENABLED=true`). It does **not** replace the bot — it only edits the `config_json` column that the bot reads.

```
Browser → Dashboard (Next.js) → Supabase PostgreSQL
                                       ↑
                               twitch-miner-go bot
                               (reads same DB)
```

Changes saved in the dashboard take effect the next time the bot restarts or reloads its config (via PostgreSQL LISTEN/NOTIFY if the bot is configured for it).

---

## Features

- **Full config editor** — all `AccountConfig` fields across five tabs: General, Streamers, Betting, Notifications, Watchers
- **Per-streamer overrides** — each streamer can inherit defaults or override individual settings (Inherit / On / Off)
- **YAML export** — download a config file ready to drop into `configs/<username>.yaml`
- **Multi-account switcher** — switch between bot accounts from inside the editor (warns about unsaved changes)
- **Dark / light / system theme**
- **Invite-only auth** — no public registration; the admin creates accounts with a one-time password
- **Role-based UI** — non-admin users get a simplified interface; admin users get full search, filters, and unlimited accounts. Non-admins are limited to 1 bot account.
- **Admin panel** — create users, assign orphaned bot accounts, reset passwords
- **CI/CD** — GitHub Actions runs `tsc` and Jest on every push

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) |
| Auth | Supabase Auth (`@supabase/supabase-js`, `@supabase/ssr`) |
| Database | Supabase PostgreSQL via `@supabase/supabase-js` |
| UI | shadcn/ui + Tailwind CSS 4 + @base-ui/react |
| Forms | React Hook Form + Zod |
| Analytics | Vercel Analytics |

---

## Prerequisites

- **Node.js ≥ 20** — check with `node --version`
- **A Supabase account** — [supabase.com](https://supabase.com) — free tier is sufficient

---

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/Guliveer/twitch-miner-go-dashboard.git
cd twitch-miner-go-dashboard
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Go to **Settings → API** and copy the **Project URL**, **anon public** key, and **service_role** key.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in the values:

```env
# Supabase API credentials (from Supabase Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_[your-key]

# Supabase secret key (server-only, never exposed to client)
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIs...
```

> **Never commit `.env`** — it is git-ignored. Only `.env.example` is tracked.

### 4. Run database migrations

Open the **Supabase SQL Editor** (Dashboard → SQL Editor) and paste the contents of `supabase/migrations/00000000000000_init.sql`, then click **Run**. This creates:

- `user_role` enum
- `user_meta` table (dashboard user metadata)
- `user_accounts` table (user ↔ bot account links)
- `accounts` table (bot-owned, with trigger for LISTEN/NOTIFY)
- Row Level Security policies for all tables

The bot's existing `accounts` table (if you already run twitch-miner-go) is **not** overwritten — the migration uses `CREATE TABLE IF NOT EXISTS` logic and matches the bot's schema exactly.

### 5. Create the first admin account

Sign-up is disabled by default. To bootstrap the first admin:

**Step 1** — Temporarily enable sign-up in the Supabase dashboard:
- Go to **Authentication → Providers → Email**
- Enable **Confirm email** (or disable it for testing)
- Save

**Step 2** — Run the setup script:

```bash
# Linux / macOS
bash scripts/create-admin.sh

# Windows
powershell -ExecutionPolicy Bypass -File scripts/create-admin.ps1
```

The script will ask for your email, display name, and password. It then:
1. Registers the account via Supabase Auth
2. Inserts a `user_meta` row with `role = 'admin'`

**Step 3** — Disable sign-up again in the Supabase dashboard.

> If you don't have `psql`, insert the row manually via the Supabase SQL editor:
> ```sql
> INSERT INTO user_meta (user_id, must_change_password, role)
> VALUES ('<your-user-id>', false, 'admin');
> ```
> The user ID is printed by the script before it tries to run `psql`.

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login`.

---

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Add the environment variables from your `.env` under **Project Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `BOT_URL` (optional)
   - `BOT_API_KEY` (optional)
4. Deploy.
5. **Add the production URL as an authorized redirect URL in Supabase:**
   - Go to **Supabase Dashboard → Authentication → URL Configuration**
   - Add `https://<your-app>.vercel.app` to **Redirect URLs**
   - Without this step, Supabase Auth will reject all requests from the production domain.

---

## Adding users (invite flow)

There is no public registration. Only an admin can create accounts.

1. Log in as admin and go to **Admin → Users → New user**.
2. Enter the user's email and display name.
3. A one-time temporary password is generated and shown **once** — share it with the user.
4. On first login, the user is forced to change their password before accessing the dashboard.

To assign existing bot accounts (created directly in the database by the bot) to a user, go to **Admin → Bot accounts**.

### Account limits

| Role | Bot accounts |
|---|---|
| Admin | Unlimited |
| User (non-admin) | 1 |

Non-admin users who reach the limit see a prompt to [run twitch-miner-go themselves](https://github.com/Guliveer/twitch-miner-go) for unlimited accounts.

---

## Config editor overview

The editor has five tabs that map directly to the bot's `AccountConfig` struct:

| Tab | Fields |
|---|---|
| **General** | `enabled`, `max_watch_streams`, `priority`, `proxy`, `features`, `followers` |
| **Streamers** | `streamer_defaults` (global), `streamers[]` with per-streamer overrides |
| **Betting** | `streamer_defaults.make_predictions`, `streamer_defaults.bet` |
| **Notifications** | `notifications.*` — Telegram, Discord, Webhook, Matrix, Pushover, Gotify *(admin only)* |
| **Watchers** | `category_watcher`, `team_watcher` |

**Per-streamer overrides** work in three states:
- **Inherit** — field is omitted from the config; the bot uses the value from `streamer_defaults`
- **On** — explicitly `true`, overrides the default
- **Off** — explicitly `false`, overrides the default

**Notifications tab** is only visible to the admin. Non-admin users cannot configure notifications — any notification data they submit is silently stripped server-side.

The bot account `guliveer_` is automatically added to every non-admin user's streamer list and cannot be removed by them.

---

## YAML export

The **Download YAML** button exports the current form state (including unsaved changes) as a `.yaml` file compatible with the bot's `configs/<username>.yaml` format.

The export:
- Strips empty strings and empty arrays (equivalent to Go's `omitempty`)
- Excludes `auth_token` and `password` (those are `json:"-"` in the bot and must be set via env vars)
- Sets the filename to `<username>.yaml`

To use the file: copy it to the bot's `configs/` directory and restart the bot. The bot will load it from the filesystem on startup (or from the DB if `DB_ENABLED=true` — in that case the dashboard already wrote the config to the DB and no file is needed).

---

## Admin panel

Accessible at `/admin` (admin role required).

### Users (`/admin/users`)

| Action | How |
|---|---|
| Create user | "New user" — enter email + name, receive one-time password |
| Reset password | "Reset password" per row — generates a new one-time password, sets `must_change_password = true` |

### Bot accounts (`/admin/accounts`)

Lists bot accounts that exist in the `accounts` table but are not yet claimed by any dashboard user. This happens when the bot creates accounts directly in the database.

Use the dropdown to assign an unclaimed account to a user.

---

## Database schema

The dashboard adds two tables to your Supabase database. The bot's existing tables are never modified.

```
accounts          ← bot-owned, read/written by both bot and dashboard
user_meta         ← dashboard-owned
user_accounts     ← dashboard-owned (ownership junction)
auth.users        ← managed by Supabase Auth automatically
goose_db_version  ← bot migration tracking, do not touch
```

### `user_meta`

| Column | Type | Description |
|---|---|---|
| `user_id` | `text` PK | Supabase Auth user ID |
| `must_change_password` | `boolean` | `true` on first login; cleared after user sets a new password |
| `role` | `user_role` enum | `'user'` or `'admin'` |

### `user_accounts`

| Column | Type | Description |
|---|---|---|
| `user_id` | `text` | Dashboard user ID |
| `bot_username` | `text` | Bot account username (FK → `accounts.username`) |

Primary key is `(user_id, bot_username)`.

---

## Testing

```bash
npm test
```

47 unit tests across two suites:

| Suite | What it covers |
|---|---|
| `config-transform.test.ts` | `deepStrip`, `coerceNullToUndefined`, `enforceNonAdminConfig`, `prepareConfigJson` — all config serialisation logic that protects against malformed JSON reaching the bot |
| `config-schema.test.ts` | Zod schema parsing, null-to-empty-array coercion, enum validation, duration string format |

The GitHub Actions CI pipeline (`.github/workflows/ci.yml`) runs `tsc --noEmit` and `npm test` on every push to any branch and on every pull request targeting `main`.

---

## Project structure

```
src/
  actions/          Server Actions (auth.ts, accounts.ts, admin.ts)
  app/
    (auth)/         Login and change-password pages
    (app)/          Dashboard and config editor (requires auth)
    admin/          Admin panel (requires admin role)
  components/
    config-editor/  Five-tab config editor and shared form components
    dashboard/      Account cards, modals, grid
    admin/          Users table, claim form, create user form
    settings/       Profile and password change form
    ui/             shadcn/ui primitives
  lib/
    auth.ts             Supabase Auth helpers (signIn, signOut, createUser, etc.)
    client.ts           Supabase browser client
    server.ts           Supabase server client + admin client (service_role)
    middleware.ts       Supabase middleware helper
    config-schema.ts    Zod schema mirroring Go AccountConfig
    config-transform.ts Pure functions: deepStrip, prepareConfigJson, enforceNonAdminConfig
    export-yaml.ts      Client-side YAML export utility
    utils.ts            cn(), generatePassword()
  proxy.ts          Route protection (Next.js 16 renamed middleware to proxy)
supabase/
  migrations/       SQL migration files (run via Supabase SQL Editor)
scripts/
  create-admin.sh   First-admin setup (Linux/macOS)
  create-admin.ps1  First-admin setup (Windows)
.github/workflows/
  ci.yml            Type check + tests on every push
```

---

## License

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue?style=for-the-badge)](LICENSE)

GPL-3.0 — see [LICENSE](LICENSE)
