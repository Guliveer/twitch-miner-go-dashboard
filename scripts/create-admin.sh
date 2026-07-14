#!/usr/bin/env bash
# Creates the first admin account for the dashboard.
# Usage: ./scripts/create-admin.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a
  source "$ROOT_DIR/.env"
  set +a
fi

: "${NEXT_PUBLIC_SUPABASE_URL:?Missing NEXT_PUBLIC_SUPABASE_URL in .env}"
: "${SUPABASE_SECRET_KEY:?Missing SUPABASE_SECRET_KEY in .env}"

node "$SCRIPT_DIR/create-admin.mjs"
