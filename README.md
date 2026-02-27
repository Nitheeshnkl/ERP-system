# ERP Management System

Production-ready ERP platform for inventory, purchasing, sales, invoicing, dashboard analytics, and role-based operations.

## Features
- Secure authentication with JWT + cookie support
- Role-based access control (Admin, Sales, Purchase, Inventory)
- Product, customer, and supplier management (CRUD)
- Sales orders and purchase orders workflows
- GRN (Goods Receipt Note) handling
- Invoicing with PDF generation and download
- Dashboard metrics and monthly revenue chart
- CSV export for sales and invoices reports

## User Roles
- Admin: full system access, user/role governance, destructive actions
- Sales: sales orders, invoices, customer-facing operations, sales reports
- Purchase: purchase orders, suppliers, GRN, purchasing reports
- Inventory: inventory/product operations and stock-related workflows

## Invoicing
- List invoices: `GET /api/invoices`
- View invoice JSON by id: `GET /api/invoices/:id`
- Update payment status: `PATCH /api/invoices/:id/status` with `Paid | Pending | Cancelled`
- View/download invoice PDF: `GET /api/invoices/:id/pdf`

Frontend notes:
- Invoice UI safely maps optional fields and avoids crashes on missing values.
- View/Download actions are wired directly to PDF endpoints.

## Reports & Export
- Sales CSV export: `GET /api/reports/sales?format=csv`
- Invoices CSV export: `GET /api/reports/invoices?format=csv`
- Exports stream rows safely from MongoDB cursor to response.

## Deployment Steps
1. Configure environment variables (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `PORT`).
2. Install dependencies:
   - Backend: `cd ERP backend/erp-backend && npm install`
   - Frontend: `cd " ERP frontend" && npm install`
3. Start MongoDB and backend:
   - `cd ERP backend/erp-backend && npm start`
4. Build and serve frontend:
   - `cd " ERP frontend" && npm run build`
   - `npm run preview` (or serve `dist` with your web server)
5. Verify critical flows:
   - Login
   - Product CRUD
   - Sales Order
   - Purchase Order
   - Invoice PDF view/download
   - Dashboard metrics/chart
   - CSV exports (sales/invoices)

## Notes
- Admin role assignment is protected server-side: only an authenticated Admin can assign Admin role.
- Demo credentials remain functional for internal testing but are not exposed in frontend UI.
