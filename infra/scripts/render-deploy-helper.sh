#!/usr/bin/env bash
set -euo pipefail

RENDER_SERVICE_NAME="${RENDER_SERVICE_NAME:-erp-backend-prod}"
RENDER_REGION="${RENDER_REGION:-oregon}"
BACKEND_START_COMMAND="${BACKEND_START_COMMAND:-npm start}"
BACKEND_BUILD_COMMAND="${BACKEND_BUILD_COMMAND:-npm ci}"
BACKEND_ROOT_DIR="${BACKEND_ROOT_DIR:-backend}"

cat <<OUT
Render deployment helper (no secrets stored)
===========================================

Service type: Web Service
Service name: ${RENDER_SERVICE_NAME}
Region: ${RENDER_REGION}
Root directory: ${BACKEND_ROOT_DIR}
Build command: ${BACKEND_BUILD_COMMAND}
Start command: ${BACKEND_START_COMMAND}

Set these environment variables in Render dashboard:
- MONGO_URI=<paste-atlas-connection-string>
- JWT_SECRET=<paste-strong-random-secret>
- PORT=8000
- ENABLE_SOCKET_IO=false
- NODE_ENV=production
- SENTRY_DSN=<optional>

Health check path:
- /health

After service is live, set frontend env:
- VITE_API_BASE_URL=https://<render-backend-domain>/api
OUT
