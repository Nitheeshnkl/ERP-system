# Deployment Checklist (Manual + Automated)

## A. Preflight
- [ ] Confirm branch is `deploy/prod-setup-YYYYMMDD-HHMM` and reviewed.
- [ ] Confirm no secrets are committed to git.
- [ ] Confirm GitHub Actions workflow `.github/workflows/deploy-prod.yml` exists.

## B. Manual secrets and platform setup
- [ ] Create MongoDB Atlas project/cluster.
- [ ] Create Atlas DB user and copy connection string.
- [ ] Add secrets in GitHub repo settings (if later enabling automated deploy):
  - [ ] `MONGO_URI`
  - [ ] `JWT_SECRET`
  - [ ] Optional integration secrets as needed.
- [ ] Link Render to repository.
- [ ] Configure Render service (`backend` root dir, build `npm ci`, start `npm start`).
- [ ] Add Render env vars:
  - [ ] `MONGO_URI`
  - [ ] `JWT_SECRET`
  - [ ] `PORT=8000`
  - [ ] `ENABLE_SOCKET_IO=false`
  - [ ] `NODE_ENV=production`
  - [ ] `SENTRY_DSN` (optional)
- [ ] Link Vercel to repository.
- [ ] Configure Vercel project (`frontend` root dir, build output `dist`).
- [ ] Add Vercel env var `VITE_API_BASE_URL=https://<backend-domain>/api`.
- [ ] Configure domain and DNS records (A/CNAME) for frontend/backend.
- [ ] Confirm HTTPS certificates are active.

## C. Automated workflow run
- [ ] Merge this branch to `main` (or push release tag `v*`).
- [ ] Open GitHub Actions run: `Deploy Production (Manual Artifact Preparation)`.
- [ ] Confirm successful completion:
  - [ ] backend dependency install
  - [ ] backend test step
  - [ ] frontend build
  - [ ] backend docker build validation
- [ ] Download workflow artifacts:
  - [ ] `frontend-dist`
  - [ ] `backend-docker-build-logs`

## D. Go-live commands
- [ ] Seed admin user:
  - [ ] `bash infra/scripts/seed-admin.sh` with secure env vars
- [ ] Validate health:
  - [ ] `bash infra/scripts/prod-healthcheck.sh` with production URLs
- [ ] Confirm login and core ERP pages function in production.

## E. Rollback plan
- [ ] Keep previous stable Render deploy version and Vercel deployment available.
- [ ] If release fails, rollback frontend in Vercel to previous deployment.
- [ ] Rollback backend in Render to previous deploy.
- [ ] If admin seed partially applied, verify user state manually in DB.
- [ ] Re-run healthcheck and smoke tests after rollback.
