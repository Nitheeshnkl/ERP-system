# Production Deployment Guide (Frontend: Vercel, Backend: Render, DB: MongoDB Atlas)

This guide prepares deployment assets and manual production steps without storing any secrets in git.

## 1) MongoDB Atlas setup (manual)
1. Create a MongoDB Atlas project and production cluster.
2. Create a database user with least privilege required for the ERP database.
3. Configure Network Access (IP allow list) based on your Render outbound access model.
4. Copy the connection string and replace credentials placeholders.
5. Keep this value private and use it only in platform dashboards/secrets:
   - `MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority`

## 2) Configure backend on Render (manual)
1. Create a new Render Web Service linked to this repository.
2. Set root directory to `backend`.
3. Set build command: `npm ci`
4. Set start command: `npm start`
5. Set required environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT=8000`
   - `ENABLE_SOCKET_IO=false`
   - `NODE_ENV=production`
   - `SENTRY_DSN` (optional)
6. Set health check path to `/health`.
7. Deploy and note the public backend URL.

## 3) Configure frontend on Vercel (manual)
1. Import the repository into Vercel.
2. Set project root directory to `frontend`.
3. Confirm build command is `npm run build` and output directory is `dist`.
4. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-render-backend-domain>/api`
5. Deploy and verify frontend can access backend.

## 4) Seed production admin user (manual)
Run this from repository root with secure values in shell/session only:

```bash
MONGO_URI='<atlas-connection-string>' \
SEED_ADMIN_EMAIL='admin@yourcompany.com' \
SEED_ADMIN_PASSWORD='<strong-password>' \
SEED_ADMIN_NAME='Production Admin' \
bash infra/scripts/seed-admin.sh
```

Notes:
- Script is idempotent: existing admin email is not recreated.
- Password is printed once by the script and not stored in repository files.

## 5) Security notes
- Backend JWT secret fallback has been removed. `JWT_SECRET` must be set in production.
- Do not commit `.env` files with real values.
- Use platform secret managers (GitHub Secrets, Render Env Vars, Vercel Env Vars).

## 6) Post-deploy verification

```bash
FRONTEND_URL='https://<frontend-domain>' \
BACKEND_URL='https://<backend-domain>' \
bash infra/scripts/prod-healthcheck.sh
```
