# ERP Management System

Full-stack ERP application for inventory, procurement, sales, invoicing, and operational reporting.

## Project Overview
This repository contains:
- Backend API: `ERP backend/erp-backend` (Node.js, Express, MongoDB, Mongoose)
- Frontend app: ` ERP frontend` (React, Vite, TypeScript, Redux Toolkit, MUI)

## Tech Stack
- MongoDB
- Node.js + Express
- React + Vite + TypeScript
- Redux Toolkit
- Material UI

## Core Features
- JWT + cookie-based authentication
- Role-based access control (`Admin`, `Sales`, `Purchase`, `Inventory`)
- Product, Customer, Supplier CRUD
- Sales Orders (multi-line item support)
- Purchase Orders (multi-line item support)
- GRN (Goods Receipt Notes)
- Invoice generation + PDF retrieval
- Dashboard metrics and chart data
- CSV exports for reports

## Roles and Permissions
- `Admin`: Full access, including delete operations and user listing
- `Sales`: Customers, Sales Orders, Invoices, Dashboard, Reports
- `Purchase`: Suppliers, Purchase Orders, GRN, Dashboard, Reports
- `Inventory`: Products, GRN update, Dashboard

## Environment Variables
### Backend (`ERP backend/erp-backend/.env`)
Required:
- `MONGODB_URI` (or `DB_URI` / `MONGO_URI`)
- `JWT_SECRET`

Common:
- `PORT=8000`
- `NODE_ENV=development`
- `BCRYPT_ROUNDS=10`
- `CLIENT_URL=http://localhost:5173`
- `CLIENT_URLS=http://localhost:5173,http://127.0.0.1:5173`
- `ENABLE_DEMO_SEEDING=false`
- `DEMO_ADMIN_EMAIL=`
- `DEMO_ADMIN_PASSWORD=`

Template file: `ERP backend/erp-backend/.env.example`

### Frontend (` ERP frontend/.env.local`)
- `VITE_API_URL=http://localhost:8000`
- `VITE_API_BASE_URL=http://localhost:8000/api`

Template file: ` ERP frontend/.env.example`

## Setup Instructions
1. Install backend dependencies:
```bash
cd "ERP backend/erp-backend"
npm install
```
2. Install frontend dependencies:
```bash
cd "/Users/nitheeshvellaiyan/Desktop/ERP system/ ERP frontend"
npm install
```
3. Configure env files from `.env.example` templates.
4. Start MongoDB locally.

## Run Instructions
### Backend
```bash
cd "ERP backend/erp-backend"
npm run dev
```
Backend URL: `http://localhost:8000`

### Frontend
```bash
cd "/Users/nitheeshvellaiyan/Desktop/ERP system/ ERP frontend"
npm run dev -- --host 127.0.0.1
```
Frontend URL: `http://127.0.0.1:5173`

## API Endpoints Summary
Base URL: `http://localhost:8000/api`

- Auth: `/auth/*`
- Products: `/products/*`
- Customers: `/customers/*`
- Suppliers: `/suppliers/*`
- Sales Orders: `/sales-orders/*`
- Purchase Orders: `/purchase-orders/*`
- GRN: `/grn/*`
- Invoices: `/invoices/*`
- Dashboard: `/dashboard/*`
- Reports: `/reports/*`

Detailed reference: `API_DOCUMENTATION.md`

## Folder Structure
```text
ERP system/
├── ERP backend/
│   └── erp-backend/
│       ├── app.js
│       ├── package.json
│       ├── src/
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   ├── models/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── utils/
│       │   └── validations/
│       └── scripts/
├──  ERP frontend/
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       ├── styles/
│       ├── types/
│       └── utils/
├── scripts/
└── reports/
```

## Known Limitations
- Demo metadata seeding currently logs a validation warning when `password_hint` is not provided by seed payload.
- Some root-level `scripts/` and `reports/` are operational artifacts (not runtime dependencies) and can be archived after validation.

## Additional Docs
- `API_DOCUMENTATION.md`
- `DATABASE_STRUCTURE.md`
- `CHANGELOG.md`
<<<<<<< HEAD

## Docker

### Build and Run with Docker Compose
```bash
docker-compose up --build
```

### Service Endpoints
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`

### Stop Services
```bash
docker-compose down
```

## GitHub Actions CI

Workflow file: `.github/workflows/ci.yml`

### Triggers
- Push to `main`
- Pull request to `main`

### Jobs
- Backend: install dependencies and run `npm test`
- Frontend: install dependencies, run `npm test`, run `npm run type-check`
- Docker build: build backend and frontend Docker images (validation only, no push)
=======
>>>>>>> origin/main
