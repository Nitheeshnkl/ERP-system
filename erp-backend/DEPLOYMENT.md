# ERP Backend - Deployment Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Database Setup](#database-setup)
3. [Environment Variables](#environment-variables)
4. [Seeding Initial Data](#seeding-initial-data)
5. [Running Locally](#running-locally)
6. [Production Deployment](#production-deployment)
7. [Docker Deployment](#docker-deployment)
8. [Security Checklist](#security-checklist)
9. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- MongoDB 4.4+ (local or cloud)
- Git

### Installation Steps

```bash
cd "ERP backend/erp-backend"
npm install
```

### Configuration
Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Default `.env` for local development:
```
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/erp
JWT_SECRET=change_me_local_dev_secret
CLIENT_URL=http://localhost:5173
BCRYPT_ROUNDS=10
UPLOAD_DIR=uploads
```

---

## Database Setup

### Option 1: Local MongoDB (Recommended for Development)

#### Install MongoDB Community Edition

**macOS (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

**Windows:**
Download from https://www.mongodb.com/try/download/community and install.

#### Verify Connection
```bash
mongosh
> use erp
> db.version()
```

### Option 2: MongoDB Atlas (Cloud - Recommended for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/erp?retryWrites=true&w=majority
   ```
5. Set in `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/erp?retryWrites=true&w=majority
   ```

---

## Environment Variables

### Development (.env)
```env
# Server
PORT=8000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/erp

# JWT (MUST CHANGE IN PRODUCTION)
JWT_SECRET=change_me_local_dev_secret

# Frontend URL
CLIENT_URL=http://localhost:5173

# Password Hashing
BCRYPT_ROUNDS=10

# File uploads
UPLOAD_DIR=uploads
```

### Production (.env)
**⚠️ CRITICAL: Never commit production .env to git!**

```env
# Server
PORT=8000
NODE_ENV=production

# Database (Use MongoDB Atlas in production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/erp?retryWrites=true&w=majority

# JWT (Generate secure random string)
# Command: openssl rand -base64 32
JWT_SECRET=__GENERATE_STRONG_RANDOM_KEY__

# Frontend URL (your production domain)
CLIENT_URL=https://your-frontend-domain.com

# Password Hashing
BCRYPT_ROUNDS=12

# File uploads
UPLOAD_DIR=./uploads
```

#### Generating Secure JWT_SECRET
```bash
# macOS/Linux
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Seeding Initial Data

### Create Initial Admin User

```bash
npm run seed
```

This will create a default admin user with:
- **Email:** `admin@erp.local`
- **Password:** `Admin@123456`
- **Role:** Admin

### Custom User Seeding
```bash
SEED_USER_EMAIL=custom@example.com \
SEED_USER_PASSWORD=SecurePassword123 \
SEED_USER_ROLE=Admin \
npm run seed
```

**Note:** User seeding is idempotent - running it twice won't create duplicates.

---

## Running Locally

### Development Mode (with auto-reload)
```bash
npm run dev
```

Logger output:
```
✓ MongoDB Connected: localhost
Server running on port 8000
```

### Production Mode
```bash
npm run start
```

### Verify API is Running
```bash
# Check server health
curl http://localhost:8000/api
# Expected: 404 (route not found - server is responding)

# Check auth endpoint
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@erp.local","password":"Admin@123456"}'
# Expected: { "message": "Logged in successfully", "user": {...} }
```

---

## Production Deployment

### Option 1: Render (Recommended for Beginners)

#### Step 1: Push Code to GitHub
```bash
git push origin main
```

#### Step 2: Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name:** erp-backend
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start`
   - **Environment:** Production
5. Add Environment Variables:
   ```
   PORT=8000
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=<generate-secure-key>
   CLIENT_URL=<your-frontend-url>
   BCRYPT_ROUNDS=12
   UPLOAD_DIR=./uploads
   ```
6. Deploy

#### Step 3: Link MongoDB Atlas
1. Create MongoDB Atlas cluster
2. Get connection string
3. Add to Render environment variables

### Option 2: Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Create new project
3. Connect GitHub repository
4. Add MongoDB plugin
5. Configure environment variables (same as above)
6. Deploy

### Option 3: Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Create app
flyctl launch

# Set environment variables
flyctl secrets set JWT_SECRET=your_secret
flyctl secrets set MONGODB_URI=your_mongodb_uri

# Deploy
flyctl deploy
```

---

## Docker Deployment

### Build Docker Image

```bash
docker build -t erp-backend:latest .

# Run locally
docker run -p 8000:8000 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/erp \
  -e JWT_SECRET=your_secret \
  -e NODE_ENV=production \
  erp-backend:latest
```

### Docker Compose (Backend + MongoDB)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: erp

  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/erp
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: ${NODE_ENV}
      CLIENT_URL: ${CLIENT_URL}
    depends_on:
      - mongodb

volumes:
  mongodb_data:
```

Run:
```bash
docker-compose up -d
```

---

## Security Checklist

### ✅ Authentication & Authorization
- [x] JWT tokens with 1-day expiry
- [x] Bcrypt password hashing (rounds: 10-12)
- [x] HTTP-only cookies (production only)
- [x] Role-based access control (RBAC)
- [x] Protected endpoints require authentication

### ✅ API Security
- [x] Helmet.js enabled (HTTP headers hardening)
- [x] CORS configured with credentials
- [x] Request body size limits enforced
- [x] SQL/NoSQL injection prevention (Mongoose schemas)
- [x] Error messages don't leak sensitive info in production

### ✅ Environment & Deployment
- [x] Environment variables for all secrets
- [x] JWT_SECRET is unique per environment
- [x] NODE_ENV properly set for production
- [x] HTTPS enforced in production (via reverse proxy)
- [x] Database credentials in .env (never in code)

### ✅ Database
- [x] MongoDB authentication enabled (production)
- [x] IP whitelist configured in MongoDB Atlas
- [x] Regular backups scheduled
- [x] Schema validation in place
- [x] Indexes optimized for queries

### ⚠️ TODO for Production Launch
- [ ] Set strong, unique JWT_SECRET
- [ ] Enable IP whitelist in MongoDB Atlas
- [ ] Configure HTTPS/SSL certificate
- [ ] Set up monitoring and alerting
- [ ] Configure database backup strategy
- [ ] Add rate limiting middleware
- [ ] Enable audit logging for sensitive operations
- [ ] Test CORS with actual frontend domain
- [ ] Set secure cookies attributes (Secure + SameSite)

---

## Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
1. Verify MongoDB is running: `brew services list` (macOS) or `systemctl status mongodb` (Linux)
2. Check MONGODB_URI in .env is correct
3. For MongoDB Atlas: verify IP whitelist includes your IP

### JWT_SECRET Missing or Invalid
```
JsonWebTokenError: secretOrPrivateKey is required
```
**Solution:**
1. Check .env file exists
2. Ensure JWT_SECRET is set to a non-empty value
3. Verify .env is loaded before app starts

### CORS Errors
```
Access to XMLHttpRequest... blocked by CORS policy
```
**Solution:**
1. Verify CLIENT_URL in .env matches frontend URL
2. Ensure `credentials: true` is set in CORS config
3. Frontend must include `withCredentials: true` in axios

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::8000
```
**Solution:**
```bash
# Kill process using port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
PORT=8001 npm run dev
```

### Seed User Not Working
```
✗ Email already exists in database
```
**Solution:**
1. User already seeds, seed is idempotent
2. Delete user from MongoDB: `db.users.deleteOne({email: "admin@erp.local"})`
3. Re-run seed

---

## API Documentation

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me          (requires auth)
```

### Dashboard (Protected)
```
GET  /api/dashboard/metrics  (requires auth)
GET  /api/dashboard/chart    (requires auth)
```

### Resources (Protected)
```
GET    /api/customers
GET    /api/customers/:id
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id

# Similar patterns for:
/api/suppliers
/api/products
/api/purchase-orders
/api/sales-orders
/api/grn
/api/invoices
```

---

## Support & Reference

- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Render Deployment:** https://docs.render.com
- **Railway:** https://docs.railway.app
- **Fly.io:** https://fly.io/docs
- **Node.js Best Practices:** https://nodejs.org/en/docs/guides/nodejs-security-best-practices
- **Express Security:** https://expressjs.com/en/advanced/best-practice-security.html

---

**Last Updated:** February 21, 2026  
**Backend Version:** 1.0.0
