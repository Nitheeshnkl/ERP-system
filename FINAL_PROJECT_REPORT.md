# ERP System Project Report

**Status**: Release candidate
**Version**: 1.0.0
**Last updated**: 2026-03-16

## Summary
The ERP System is a full-stack web application that covers inventory, procurement, sales, invoicing, and reporting. The build includes authentication, role-based access control, and OTP email verification to support secure onboarding.

## Tech Stack
- Frontend: React 18, TypeScript, Vite, Redux Toolkit, MUI
- Backend: Node.js, Express, Mongoose
- Database: MongoDB
- Email: Gmail SMTP (Nodemailer)
- Auth: JWT + RBAC

## Scope Delivered
- User authentication and role-based permissions
- Master data management for products, customers, and suppliers
- Transaction flows for sales orders, purchase orders, GRN, and invoices
- PDF invoice generation and retrieval
- Dashboard metrics and reports

## Notable Behaviors
- OTP email verification is required for non-admin signup.
- Admin roles cannot be self-assigned through public signup.
- API responses are normalized in a consistent success/error envelope.

## Deployment Targets
- Backend: Render or equivalent Node.js hosting
- Frontend: Vercel or equivalent static hosting
- Database: MongoDB Atlas

## Known Follow-Ups
- Add full audit logging for admin actions.
- Expand reporting to include additional export formats.
