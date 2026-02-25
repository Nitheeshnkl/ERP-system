# ERP Backend

Standalone backend for the ERP system, built with Node.js, Express, and MongoDB.

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB 4.4+ (local or MongoDB Atlas)
- npm or yarn

### Installation & Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# For local MongoDB, start it:
mongosh  # or: brew services start mongodb-community (macOS)

# Seed initial admin user
npm run seed

# Start development server
npm run dev
```

The API will be available at `http://localhost:8000`

## Available Scripts

- `npm run dev` - Start with auto-reload in development
- `npm run start` - Start in production mode
- `npm run test` - Run tests with Jest
- `npm run seed` - Seed initial admin user to database
- `npm run lint` - Check code style

## Project Structure

```
src/
  ├── config/       # Database & configuration
  ├── controllers/  # Request handlers
  ├── middleware/   # Auth, error handling
  ├── models/       # Mongoose schemas
  ├── routes/       # API endpoints
  └── utils/        # Helper functions
```

## Environment Variables

See `.env.example` for all available options. Key variables:

```env
PORT=8000                                    # Server port
NODE_ENV=development                         # Environment
MONGODB_URI=mongodb://localhost:27017/erp   # Database
JWT_SECRET=your_secret_key                   # JWT signing key
CLIENT_URL=http://localhost:5173            # Frontend URL
ENABLE_DEMO_SEEDING=false                   # Disabled by default
DEMO_ADMIN_EMAIL=<set_only_if_demo_enabled>
DEMO_ADMIN_PASSWORD=<set_only_if_demo_enabled>
```

## API Endpoints

All routes require authentication (except `/api/auth/login`):

### Authentication
```
POST   /api/auth/login      # Login with email/password
POST   /api/auth/logout     # Logout (clears JWT cookie)
GET    /api/auth/me         # Get current user profile
```

### Dashboard (Protected)
```
GET    /api/dashboard/metrics    # KPI metrics
GET    /api/dashboard/chart      # Monthly revenue data
```

### Resources (Protected)
```
GET    /api/customers            # List all customers
POST   /api/customers            # Create customer
PUT    /api/customers/:id        # Update customer
DELETE /api/customers/:id        # Delete customer

# Similar patterns for:
/api/suppliers
/api/products
/api/purchase-orders
/api/sales-orders
/api/grn
/api/invoices
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage
```

## Database Seeding

Create an initial admin user for testing:

```bash
# Required credentials via env vars
SEED_USER_EMAIL=custom@example.com \
SEED_USER_PASSWORD=SecurePass123 \
npm run seed
```

## Running Locally with Frontend

1. Start MongoDB: `brew services start mongodb-community` (macOS) or equivalent
2. Start backend: `npm run dev` (runs on port 8000)
3. In another terminal, start frontend: 
   - Navigate to `../ ERP frontend`
   - Run `npm run dev` (runs on port 5173)
4. Frontend will connect to backend automatically

## Deployment

For comprehensive deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

Supported platforms:
- **Render** (recommended for beginners)
- **Railway**
- **Fly.io**
- **Docker/Docker Compose**

### Quick Deployment to Render

1. Push code to GitHub
2. Connect repository at https://dashboard.render.com
3. Select "Web Service" and configure:
   - **Build:** `npm install`
   - **Start:** `npm start`
4. Add environment variables (see DEPLOYMENT.md)
5. Deploy

## Security

- Passwords hashed with bcrypt (10-12 rounds)
- JWT authentication with HTTP-only cookies
- CORS configured for frontend domain
- Helmet.js for HTTP header hardening
- Role-based access control (Admin/Manager/User)
- Error messages sanitized in production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full security checklist.

## Troubleshooting

**MongoDB won't connect?**
- Ensure MongoDB is running: `brew services list` (macOS)
- Check `MONGODB_URI` in `.env`
- For MongoDB Atlas: verify IP whitelist

**CORS errors on frontend?**
- Ensure `CLIENT_URL` in `.env` matches frontend URL
- Verify frontend includes `withCredentials: true` in API calls

**Port already in use?**
- Kill process: `lsof -ti:8000 | xargs kill -9`
- Or use: `PORT=8001 npm run dev`

**Seed not working?**
- Ensure MongoDB is running
- User may already exist; delete and re-seed

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) - Security audit results

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT
- **Password Hashing:** Bcrypt
- **Security:** Helmet.js, CORS
- **Testing:** Jest
- **Linting:** ESLint

## License

MIT
