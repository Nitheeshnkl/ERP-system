# API Documentation

Base URL (local): `http://localhost:5001/api`

**Response Envelope**
- Success: `{ "success": true, "data": ..., "message": "...", "meta"?: {...} }`
- Error: `{ "success": false, "data": null, "message": "...", "meta"?: {...} }`

**Authentication**
- Auth supports JWT via `Authorization: Bearer <token>` and HTTP-only cookies.
- Most endpoints return `401` when unauthenticated and `403` when role is not permitted.

## Auth
POST `/auth/register`
- Public
- Body: `name`, `email`, `password`, optional `role`
- Responses: `201`, `400`, `403`, `409`

POST `/auth/login`
- Public
- Body: `email`, `password`
- Responses: `200`, `401`

POST `/auth/logout`
- Public
- Clears auth cookie and invalidates token when available
- Responses: `200`

POST `/auth/verify-otp`
- Public
- Body: `email`, `otp`
- Responses: `200`, `400`

POST `/auth/verify-email`
- Alias of `/auth/verify-otp`

GET `/auth/me`
- Authenticated
- Responses: `200`, `401`, `404`

GET `/auth/users`
- Admin only
- Responses: `200`, `403`

## Customers
GET `/customers`
POST `/customers`
PUT `/customers/:id`
DELETE `/customers/:id`

## Products
GET `/products`
POST `/products`
PUT `/products/:id`
DELETE `/products/:id`

## Suppliers
GET `/suppliers`
POST `/suppliers`
PUT `/suppliers/:id`
DELETE `/suppliers/:id`

## Sales Orders
GET `/sales-orders`
POST `/sales-orders`
PUT `/sales-orders/:id`
DELETE `/sales-orders/:id`

## Purchase Orders
GET `/purchase-orders`
POST `/purchase-orders`
PUT `/purchase-orders/:id`
DELETE `/purchase-orders/:id`

## GRN
GET `/grn`
POST `/grn`
PUT `/grn/:id`
DELETE `/grn/:id`

## Invoices
GET `/invoices`
GET `/invoices/:id`
PATCH `/invoices/:id/status`
GET `/invoices/:id/pdf`

## Dashboard
GET `/dashboard/metrics`
GET `/dashboard/chart`

## Reports
GET `/reports/sales?format=csv`
GET `/reports/invoices?format=csv`

**Notes**
- Pagination typically uses `page`, `limit`, and `search` query params where applicable.
- `:id` parameters must be valid MongoDB ObjectIds.
