# Deployment Checklist

## Preflight
- [ ] Confirm no secrets are committed to git
- [ ] Confirm `.env` files are gitignored
- [ ] Confirm build passes locally for backend and frontend

## Backend Configuration
- [ ] `MONGO_URI` or `MONGODB_URI` set
- [ ] `JWT_SECRET` set
- [ ] `BREVO_API_KEY` set
- [ ] `BREVO_SENDER_EMAIL` set
- [ ] `NODE_ENV=production` set
- [ ] `ENABLE_EMAIL_OTP=true` unless intentionally disabled
- [ ] `CORS_ALLOWED_ORIGINS` includes frontend domain
- [ ] Render health check path set to `/health`

## Database
- [ ] MongoDB Atlas cluster is reachable
- [ ] DB user has least-privilege access
- [ ] Connection succeeds on service startup

## Frontend Configuration
- [ ] `VITE_API_BASE_URL` points to backend origin + `/api`
- [ ] `VITE_API_TIMEOUT_MS` set to a sane value (example: `30000`)

## Security and Access
- [ ] Admin seeding script executed with secure credentials
- [ ] Admin login verified
- [ ] RBAC rules confirmed for non-admin roles

## Smoke Tests
- [ ] Login works
- [ ] Signup + OTP verification works
- [ ] Product CRUD works
- [ ] Sales Order and Purchase Order flows work
- [ ] Invoice list, status update, and PDF download work
- [ ] Dashboard metrics load

## Rollback Readiness
- [ ] Previous stable deploy versions are available
- [ ] Rollback steps documented for backend and frontend
