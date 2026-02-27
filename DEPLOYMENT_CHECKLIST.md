# Deployment Checklist

## Environment Variables
- [ ] `PORT` configured
- [ ] `MONGODB_URI` configured and reachable
- [ ] `JWT_SECRET` set to strong secret (not default)
- [ ] `CLIENT_URL` matches deployed frontend origin
- [ ] `NODE_ENV=production`
- [ ] `ENABLE_DEMO_SEEDING=false` (unless explicitly needed)

## Database
- [ ] MongoDB service is running
- [ ] Connection from backend succeeds on startup
- [ ] Required collections exist (users, products, customers, suppliers, orders, invoices)
- [ ] Indexes are created successfully

## PDF Storage
- [ ] Invoice PDF output directory is writable
- [ ] Existing generated PDFs are accessible by backend
- [ ] `GET /api/invoices/:id/pdf` serves files correctly

## RBAC Verification
- [ ] Non-admin users cannot access admin-only routes
- [ ] Admin-only destructive actions are blocked for non-admin roles
- [ ] Admin role assignment attempt without Admin auth returns `403`
- [ ] Admin-to-admin assignment is allowed

## Export Verification
- [ ] `GET /api/reports/sales?format=csv` returns downloadable CSV
- [ ] `GET /api/reports/invoices?format=csv` returns downloadable CSV
- [ ] Export endpoints reject unsupported formats with `400`
- [ ] Export routes are protected by auth + role checks

## Core Flow Smoke Tests
- [ ] Login succeeds and token is issued
- [ ] Product CRUD works
- [ ] Sales Order flow works
- [ ] Purchase Order flow works
- [ ] Invoice list/details/status/PDF work
- [ ] Dashboard metrics and chart load
