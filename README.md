# ERP System

A full-stack ERP application for inventory, procurement, sales, invoicing, and reporting.

**Overview**
- Backend API: Node.js + Express + MongoDB
- Frontend Web App: React + TypeScript + Vite + MUI + Redux Toolkit
- Auth: JWT + role-based access control (RBAC)
- Email: OTP verification via Gmail SMTP (Nodemailer)

**Key Features**
- Role-based login and permissions (Admin, Sales, Purchase, Inventory)
- Product, customer, and supplier management
- Sales orders, purchase orders, GRN, and invoices
- PDF invoice download
- Dashboard analytics and CSV exports
- OTP email verification for signup

**Tech Stack**
- Frontend: React 18, TypeScript, Vite, Redux Toolkit, MUI, Recharts
- Backend: Node.js, Express, Mongoose, JWT, Nodemailer
- Database: MongoDB
- Tooling: ESLint, Nodemon

**Repository Layout**
```text
.
├── backend/
├── frontend/
├── infra/
├── scripts/
├── API_DOCUMENTATION.md
├── DATABASE_STRUCTURE.md
├── DEPLOYMENT_CHECKLIST.md
├── README_DEPLOY.md
└── monitoring.md
```

**Prerequisites**
- Node.js 18+
- npm 9+
- MongoDB 7+ (local or Atlas)

**Environment Configuration**

Backend template: `backend/.env.example`
- `MONGODB_URI` (or `DB_URI` / `MONGO_URI`)
- `JWT_SECRET`
- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `ENABLE_EMAIL_OTP` (optional, default true)
- `CORS_ALLOWED_ORIGINS` (optional, comma-separated)
- `PORT` (optional, default 5001)

Frontend template: `frontend/.env.example`
- `VITE_API_BASE_URL` (example: `http://localhost:5001/api`)
- `VITE_API_TIMEOUT_MS` (example: `30000`)

**Local Development**
1. Install dependencies
```bash
cd backend
npm install

cd ../frontend
npm install
```

2. Start backend
```bash
cd backend
npm run dev
```
Backend default: `http://localhost:5001`

3. Start frontend
```bash
cd frontend
npm run dev
```
Frontend default: `http://localhost:5173`

**Common Scripts**
Backend
- `npm run dev`
- `npm run start`
- `npm run seed`

Frontend
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run type-check`

**Deployment**
See `README_DEPLOY.md` for Render (backend) + Vercel (frontend) setup and Atlas configuration.

**Documentation**
- `API_DOCUMENTATION.md`
- `DATABASE_STRUCTURE.md`
- `DEPLOYMENT_CHECKLIST.md`
- `monitoring.md`
