# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Administratorzy i użytkownicy panelu zarządzającego konfiguracjami botów twitch-miner-go. System multi-tenant: admin tworzy konta użytkowników, każdy widzi i zarządza tylko swoimi kontami botów.

## Product Purpose

Webowy panel do zarządzania konfiguracjami kont botów twitch-miner-go. Edycja configów bez dotykania plików YAML ani API bezpośrednio. Zastępuje ręczną edycję plików YAML interfejsem webowym z pełną walidacją.

## Positioning

Thin UI layer na tabeli accounts w Supabase PostgreSQL, którą bot już używa w trybie DB. Dashboard nie zastępuje bota — edytuje tylko kolumnę config_json, którą bot czyta.

## Operating Context

- Przeglądarka → Dashboard (Next.js 16) → Supabase PostgreSQL
- Bot czyta z tej samej bazy (LISTEN/NOTIFY dla natychmiastowych zmian)
- Auth: Supabase Auth, invite-only (brak publicznej rejestracji)
- Deploy: Vercel
- Edytor konfiguracji z 5 zakładkami (General, Streamers, Betting, Notifications, Watchers)

## Capabilities and Constraints

- Full config editor (wszystkie pola AccountConfig)
- Per-streamer overrides (Inherit/On/Off)
- YAML export (download pliku .yaml)
- Multi-account switcher
- Dark/light/system theme
- Role-based UI (admin: unlimited, user: 1 bot account)
- Admin panel (create users, assign accounts, reset passwords)
- 47 unit tests (config-transform + config-schema)
- Wymaga Node.js ≥ 20 + Supabase project

## Brand Commitments

- Nazwa: twitch-miner-go-dashboard
- Organizacja GitHub: Guliveer
- Licencja: GPL-3.0
- Stack: Next.js 16, Supabase, shadcn/ui, Tailwind CSS 4

## Evidence on Hand

- README.md z pełną dokumentacją
- .env.example
- supabase/migrations/
- scripts/create-admin.sh + .ps1
- .github/workflows/ci.yml

## Product Principles

1. Thin UI layer — dashboard nie zastępuje bota, tylko edytuje config
2. Multi-tenant security — RLS w Supabase, role-based access
3. Zero-rejestracja — invite-only, admin tworzy konta
4. Compat z botem — 100% zgodność z AccountConfig schema

## Accessibility & Inclusion

Brak specjalnych wymagań dotyczących dostępności. Typowe wymagania webowe.
