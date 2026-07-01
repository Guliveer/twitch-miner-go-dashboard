#!/usr/bin/env bash
# Creates the first admin account for the dashboard.
# Usage: ./scripts/create-admin.sh
# Requires: curl, psql (or uses DB_DSN from .env)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Load .env
if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +a
fi

: "${NEON_AUTH_BASE_URL:?Missing NEON_AUTH_BASE_URL in .env}"
: "${DB_DSN:?Missing DB_DSN in .env}"

echo ""
echo "=== Twitch Miner Dashboard — First Admin Setup ==="
echo ""

read -rp "Email: " EMAIL
read -rsp "Password (min 8 chars): " PASSWORD
echo ""
read -rp "Display name: " NAME
echo ""

# 1. Register via Neon Auth
echo "Creating auth account..."
RESPONSE=$(curl -sf -X POST "${NEON_AUTH_BASE_URL}/sign-up/email" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"$NAME\"}")

USER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [[ -z "$USER_ID" ]]; then
  echo ""
  echo "Error: Failed to create auth account. Response:"
  echo "$RESPONSE"
  exit 1
fi

echo "Auth account created. User ID: $USER_ID"

# 2. Insert admin row into user_meta
echo "Inserting admin role into database..."
psql "$DB_DSN" -c \
  "INSERT INTO user_meta (user_id, must_change_password, role)
   VALUES ('$USER_ID', false, 'admin')
   ON CONFLICT (user_id) DO UPDATE SET role = 'admin', must_change_password = false;"

echo ""
echo "Done! You can now log in at /login with:"
echo "  Email:    $EMAIL"
echo "  Password: (the one you just set)"
echo ""
