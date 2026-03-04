#!/usr/bin/env bash
set -euo pipefail

FRONTEND_URL="${FRONTEND_URL:-https://your-frontend.example.com}"
BACKEND_URL="${BACKEND_URL:-https://your-backend.example.com}"
API_DOCS_REQUIRED="${API_DOCS_REQUIRED:-false}"

failures=0

check_url() {
  local name="$1"
  local url="$2"
  local required="${3:-true}"

  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' "$url" || true)"

  if [[ "$code" =~ ^2|3 ]]; then
    echo "[OK] $name -> $url ($code)"
    return
  fi

  if [[ "$required" == "true" ]]; then
    echo "[FAIL] $name -> $url ($code)"
    failures=$((failures + 1))
  else
    echo "[WARN] $name -> $url ($code)"
  fi
}

check_url "Frontend" "$FRONTEND_URL"
check_url "Backend Root" "$BACKEND_URL"
check_url "Backend Health" "$BACKEND_URL/health"

if [[ "$API_DOCS_REQUIRED" == "true" ]]; then
  check_url "Backend API Docs" "$BACKEND_URL/api-docs" "true"
else
  check_url "Backend API Docs" "$BACKEND_URL/api-docs" "false"
fi

if [[ "$failures" -gt 0 ]]; then
  echo "Healthcheck failed with $failures required endpoint failure(s)."
  exit 1
fi

echo "Healthcheck passed."
