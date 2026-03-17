# Production Deployment Guide

This guide covers a typical setup with Render (backend), Vercel (frontend), and MongoDB Atlas.

## 1) MongoDB Atlas
1. Create a production cluster.
2. Create a database user with least-privilege access.
3. Configure Network Access to allow your backend host.
4. Store the connection string as a secret:
`MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<db>?retryWrites=true&w=majority`

## 2) Backend on Render
1. Create a new Render Web Service linked to this repo.
2. Set root directory to `backend`.
3. Build command: `npm ci`
4. Start command: `npm start`
5. Add environment variables:
`MONGO_URI`, `JWT_SECRET`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `NODE_ENV=production`
6. Set health check path to `/health`.

Notes
- Render sets `PORT` automatically. Only set it manually if your platform requires it.
- Add `CORS_ALLOWED_ORIGINS` with your frontend domain.

## 3) Frontend on Vercel
1. Import the repository into Vercel.
2. Set project root directory to `frontend`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable:
`VITE_API_BASE_URL=https://<backend-domain>/api`

## 4) Seed Production Admin
Run from repo root with secure values in your shell session:

```bash
MONGO_URI='<atlas-connection-string>' \
SEED_ADMIN_EMAIL='admin@yourcompany.com' \
SEED_ADMIN_PASSWORD='<strong-password>' \
SEED_ADMIN_NAME='Production Admin' \
bash infra/scripts/seed-admin.sh
```

## 5) Post-Deploy Verification
```bash
FRONTEND_URL='https://<frontend-domain>' \
BACKEND_URL='https://<backend-domain>' \
bash infra/scripts/prod-healthcheck.sh
```
