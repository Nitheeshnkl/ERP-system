🚀 ERP System

A full-stack Enterprise Resource Planning (ERP) application designed to streamline business operations including inventory management, procurement, sales, invoicing, and analytics.

🌐 Live Access

🔗 Web Application:
https://erp-system-five-blush.vercel.app/login

🔗 API Base URL:
https://erp-system-zjno.onrender.com

📘 Swagger API Docs:
https://erp-system-zjno.onrender.com/api-docs/

🔐 Demo Admin Access
Email: admin@erp.com
Password: Admin@123

⚠️ These credentials are for demo/testing purposes only.

📌 Overview

This ERP system is built using a modern MERN-based architecture with scalable design and secure authentication.

Frontend: React + TypeScript + Vite + MUI + Redux Toolkit

Backend: Node.js + Express + MongoDB

Authentication: JWT with Role-Based Access Control (RBAC)

Email Service: OTP verification using Brevo

✨ Key Features

🔐 Secure authentication with JWT + RBAC

👥 Role-based dashboards (Admin, Sales, Purchase, Inventory)

📦 Product, customer, and supplier management

🧾 Sales Orders, Purchase Orders, GRN, and Invoice generation

📄 Downloadable PDF invoices

📊 Interactive dashboards with analytics & reporting

📁 CSV export functionality

📧 OTP-based email verification system

🛠️ Tech Stack
Frontend

React 18

TypeScript

Vite

Redux Toolkit

Material UI (MUI)

Recharts

Backend

Node.js

Express.js

Mongoose

JWT Authentication

Nodemailer / Brevo API

Database

MongoDB (Local / Atlas)

Tooling

ESLint

Nodemon

📂 Project Structure
.
├── backend/                 # Express API
├── frontend/                # React App
├── infra/                   # Deployment configs
├── scripts/                 # Utility scripts (e.g., seeding)
├── API_DOCUMENTATION.md
├── DATABASE_STRUCTURE.md
├── DEPLOYMENT_CHECKLIST.md
├── README_DEPLOY.md
└── monitoring.md
⚙️ Prerequisites

Node.js (v18+)

npm (v9+)

MongoDB (v7+ or MongoDB Atlas)

🔧 Environment Configuration
Backend (backend/.env.example)
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_email
ENABLE_EMAIL_OTP=true
CORS_ALLOWED_ORIGINS=http://localhost:5173
PORT=5001
Frontend (frontend/.env.example)
VITE_API_BASE_URL=http://localhost:5001/api
VITE_API_TIMEOUT_MS=30000
🚀 Local Development Setup
1️⃣ Install Dependencies
cd backend
npm install

cd ../frontend
npm install
2️⃣ Start Backend
cd backend
npm run dev

📍 Runs on: http://localhost:5001

3️⃣ Start Frontend
cd frontend
npm run dev

📍 Runs on: http://localhost:5173

📜 Available Scripts
Backend

npm run dev → Start development server

npm run start → Production server

npm run seed → Seed database with initial data

Frontend

npm run dev → Start dev server

npm run build → Build for production

npm run preview → Preview build

npm run type-check → TypeScript validation

🚀 Deployment

Deployment setup is documented in:

📄 README_DEPLOY.md

Includes:

Backend deployment on Render

Frontend deployment on Vercel

MongoDB Atlas configuration

📚 Documentation

📘 API_DOCUMENTATION.md – API reference

🗂️ DATABASE_STRUCTURE.md – DB schema

✅ DEPLOYMENT_CHECKLIST.md – Production checklist

📊 monitoring.md – Logs & monitoring

👨‍💻 Author

Nitheesh V
Final Year ECE Student | Aspiring Full Stack Developer

⭐ Project Highlights

✔ Production-ready MERN architecture
✔ Secure authentication & RBAC
✔ Real-world business workflow implementation
✔ Fully deployed (Frontend + Backend)
✔ API documented with Swagger
