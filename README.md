# twitch-miner-go-dashboard

Web dashboard for managing [twitch-miner-go](https://github.com/Guliveer/twitch-miner-go) bot configurations. Multi-tenant, invite-only — each user manages their own bot accounts without seeing others'.

## Stack

- **Next.js 16** — App Router, Server Actions
- **Neon Auth** (Better Auth) — invite-only session management
- **Drizzle ORM** — schema & migrations on Neon PostgreSQL
- **shadcn/ui** + **Tailwind CSS 4** — UI components
- **Zod** — config schema validation

## Features

- Full config editor for all `AccountConfig` fields (General, Streamers, Betting, Notifications, Watchers)
- Per-streamer settings with Inherit / On / Off overrides
- YAML export — download config ready to drop into `configs/<username>.yaml`
- Dark / light / system theme
- Admin panel — user management, account assignment, password reset
- CI via GitHub Actions — type check + unit tests on every push

## Setup

### Prerequisites

- Node.js ≥ 20
- A [Neon](https://neon.tech) project with Auth provisioned
- `psql` in PATH (for the first-admin script)

### Install

```bash
npm install
```

### Environment

Copy `.env.example` to `.env` and fill in:

```
DB_DSN=postgresql://...
NEON_AUTH_BASE_URL=https://<endpoint>.neonauth.<region>.aws.neon.tech/<dbname>/auth
NEON_AUTH_COOKIE_SECRET=<64-char hex>
```

Generate `NEON_AUTH_COOKIE_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database

Run migrations:

```bash
npx drizzle-kit migrate
```

### First admin account

With sign-up temporarily enabled in the Neon Auth console:

```bash
# Linux / macOS
bash scripts/create-admin.sh

# Windows
powershell -ExecutionPolicy Bypass -File scripts/create-admin.ps1
```

The script registers the account and inserts the admin role. Disable sign-up again afterwards.

### Dev server

```bash
npm run dev
```

## Testing

```bash
npm test
```

Tests cover `deepStrip`, `coerceNullToUndefined`, `enforceNonAdminConfig`, `prepareConfigJson`, and the Zod config schema. The CI pipeline runs them on every push and after merging to `main`.

## Database schema

| Table | Owner | Purpose |
|---|---|---|
| `accounts` | bot | Bot account configs — **do not modify directly** |
| `user_meta` | dashboard | Dashboard user roles and flags |
| `user_accounts` | dashboard | Ownership: which user manages which bot account |
| `neon_auth.*` | Neon Auth | Sessions, users — managed automatically |
| `goose_db_version` | bot | Bot migration tracking — do not touch |

## License

GPL-3.0 — see [LICENSE](LICENSE)
