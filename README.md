# ERP Management System

A full-stack MERN ERP platform for managing inventory, procurement, sales, invoicing, and operational reporting.

## Overview
This repository includes:
- Backend API (Node.js + Express + MongoDB)
- Frontend Web App (React + TypeScript + MUI + Redux)
- Dockerized local environment
- CI workflow for backend/frontend checks and Docker build validation

## Key Capabilities
- JWT-based authentication with role-based access control (RBAC)
- Master data management: Products, Customers, Suppliers
- Transaction modules: Sales Orders, Purchase Orders, GRN
- Invoice generation and PDF retrieval
- Dashboard analytics and charts
- Export-ready reporting endpoints

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Redux Toolkit, MUI, Recharts
- **Backend:** Node.js, Express, Joi validation, JWT auth
- **Database:** MongoDB + Mongoose
- **Quality:** Jest, React Testing Library
- **Ops:** Docker, Docker Compose, GitHub Actions

## User Roles
- `Admin`: Full access across all modules
- `Sales`: Customers, Sales Orders, Invoices, Dashboard, Reports
- `Purchase`: Suppliers, Purchase Orders, GRN, Dashboard, Reports
- `Inventory`: Products, GRN (inventory scope), Dashboard

## Repository Layout
```text
.
├── backend/                     # Backend app (canonical layout)
├── frontend/                    # Frontend app (canonical layout)
├── backend/                    # Active backend path in this workspace
├── frontend/                   # Active frontend path in this workspace
├── .github/workflows/           # CI workflow(s)
├── docker-compose.yml
├── API_DOCUMENTATION.md
├── DATABASE_STRUCTURE.md
└── CHANGELOG.md
```

## Prerequisites
- Node.js 18+
- npm 9+
- MongoDB 7+
- Docker + Docker Compose (optional, recommended)

## Environment Configuration

### Backend
Create `.env` from template:
- `backend/.env.example`

Required values:
- `MONGODB_URI` (or `DB_URI` / `MONGO_URI`)
- `JWT_SECRET`
- `SENDGRID_API_KEY`
- `EMAIL_FROM`
- `BACKEND_URL`

### Frontend
Create `.env.local` from template:
- `frontend/.env.example`

Typical values:
- `VITE_API_URL=http://localhost:8000`
- `VITE_API_BASE_URL=http://localhost:8000/api`

## Local Development

### 1) Install Dependencies
```bash
cd "backend"
npm install

cd "../frontend"
npm install
```

### 2) Run Backend
```bash
cd "backend"
npm run dev
```
Backend default: `http://localhost:8000`

### 3) Run Frontend
```bash
cd "frontend"
npm run dev -- --host 127.0.0.1
```
Frontend default: `http://127.0.0.1:5173`

## SendGrid Email Verification Setup
Steps:
1. Create a SendGrid account.
2. Verify a sender identity (single sender or domain).
3. Create a SendGrid API key with Mail Send permissions.
4. Add the following to `backend/.env`:
   - `SENDGRID_API_KEY=<your_sendgrid_api_key>`
   - `EMAIL_FROM=noreply@yourdomain.com`
   - `BACKEND_URL=https://your-backend-domain.com`

## Docker Setup
Run full stack:
```bash
docker-compose up --build
```

Default service mapping in this repository:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:18000` (host) → `5000` (container)
- MongoDB: `mongodb://localhost:27017`

Stop services:
```bash
docker-compose down
```

## Testing & Quality

### Backend Tests
```bash
cd "backend"
npm test
```

### Frontend Tests
```bash
cd "frontend"
npm test
```

### Frontend Type Check
```bash
cd "frontend"
npm run type-check
```

## API Documentation
- Swagger UI: `http://localhost:18000/api-docs/` (Docker runtime)
- Detailed docs: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## CI/CD
Workflow: `.github/workflows/ci.yml`

Triggers:
- Push to `main`
- Pull requests targeting `main`

Pipeline coverage:
- Backend dependency install + tests
- Frontend dependency install + tests + build + type-check
- Docker image build validation (no registry push)

## Additional Documentation
- [DATABASE_STRUCTURE.md](DATABASE_STRUCTURE.md)
- [CHANGELOG.md](CHANGELOG.md)
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---
If you want, I can also add GitHub badges (build status, last commit, release tag) to this README.
