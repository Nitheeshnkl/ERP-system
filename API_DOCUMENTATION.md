# API Documentation

Base URL: `http://localhost:8000/api`

Response envelope:
- Success: `{ "success": true, "data": ..., "message": "...", "meta"?: {...} }`
- Error: `{ "success": false, "data": null, "message": "...", "meta"?: {...} }`

## Authentication
### POST `/auth/register`
Create a user.
- Access: Public (Admin-role assignment protected by middleware)
- Body:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "Sales"
}
```
- Responses: `201`, `400`, `403`, `409`

### POST `/auth/login`
Authenticate user.
- Access: Public
- Body:
```json
{
  "email": "admin@erp.local",
  "password": "password123"
}
```
- Success `200` (sample):
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": {
      "id": "...",
      "name": "Demo Admin",
      "email": "admin@erp.local",
      "role": "Admin"
    }
  },
  "message": "Logged in successfully"
}
```

### POST `/auth/logout`
- Access: Public
- Clears auth cookie and invalidates token version if token is valid.
- Responses: `200`

### GET `/auth/me`
- Access: Authenticated
- Responses: `200`, `401`, `404`

### GET `/auth/users`
- Access: Admin
- Responses: `200`, `403`

## Customers
### GET `/customers`
List customers (supports `page`, `limit`, `search`).
- Access: `Admin`, `Sales`

### POST `/customers`
Create customer.
- Access: `Admin`, `Sales`
- Body:
```json
{
  "name": "Acme Corp",
  "email": "buyer@acme.com",
  "phone": "9999999999",
  "address": "Chennai"
}
```
- Responses: `201`, `400`, `409`

### PUT `/customers/:id`
Update customer.
- Access: `Admin`, `Sales`
- Responses: `200`, `400`, `404`

### DELETE `/customers/:id`
Delete customer.
- Access: `Admin`
- Responses: `200`, `404`

## Products
### GET `/products`
List products (supports `page`, `limit`, `search`).
- Access: `Admin`, `Sales`, `Purchase`, `Inventory`

### POST `/products`
Create product.
- Access: `Admin`, `Inventory`
- Body:
```json
{
  "name": "Widget A",
  "sku": "WID-A-001",
  "price": 120,
  "stockQuantity": 50
}
```
- Responses: `201`, `400`, `409`

### PUT `/products/:id`
Update product.
- Access: `Admin`, `Inventory`
- Responses: `200`, `400`, `404`

### DELETE `/products/:id`
Delete product.
- Access: `Admin`
- Responses: `200`, `404`

## Sales Orders
### GET `/sales-orders`
- Access: `Admin`, `Sales`

### POST `/sales-orders`
Create sales order.
- Access: `Admin`, `Sales`
- Body:
```json
{
  "customerId": "65f0...",
  "items": [
    { "productId": "65f1...", "quantity": 2, "unitPrice": 120 },
    { "productId": "65f2...", "quantity": 1, "unitPrice": 80 }
  ],
  "totalAmount": 320,
  "status": "Pending"
}
```
- Responses: `201`, `400`

### PUT `/sales-orders/:id`
Update sales order.
- Access: `Admin`, `Sales`
- ID validation is enforced here (`Invalid order id` on malformed id).
- Responses: `200`, `400`, `404`

### DELETE `/sales-orders/:id`
- Access: `Admin`
- Responses: `200`, `404`

## Purchase Orders
### GET `/purchase-orders`
- Access: `Admin`, `Purchase`

### POST `/purchase-orders`
Create purchase order.
- Access: `Admin`, `Purchase`
- Body:
```json
{
  "supplierId": "65f3...",
  "items": [
    { "productId": "65f1...", "quantity": 5, "unitPrice": 90 }
  ],
  "totalAmount": 450,
  "status": "Pending"
}
```
- Responses: `201`, `400`

### PUT `/purchase-orders/:id`
Update purchase order.
- Access: `Admin`, `Purchase`
- ID validation is enforced here (`Invalid order id` on malformed id).
- Responses: `200`, `400`, `404`

### DELETE `/purchase-orders/:id`
- Access: `Admin`
- Responses: `200`, `404`

## GRN
### GET `/grn`
- Access: `Admin`, `Purchase`, `Inventory`

### POST `/grn`
- Access: `Admin`, `Purchase`, `Inventory`

### PUT `/grn/:id`
- Access: `Admin`, `Inventory`

### DELETE `/grn/:id`
- Access: `Admin`

## Invoices
### GET `/invoices`
- Access: `Admin`, `Sales`

### GET `/invoices/:id`
- Access: `Admin`, `Sales`

### PATCH `/invoices/:id/status`
- Access: `Admin`, `Sales`
- Body:
```json
{ "status": "Paid" }
```

### GET `/invoices/:id/pdf`
- Access: `Admin`, `Sales`

### DELETE `/invoices/:id`
- Access: `Admin`

## Dashboard
### GET `/dashboard/metrics`
### GET `/dashboard/chart`
- Access: `Admin`, `Sales`, `Purchase`, `Inventory`

## Reports
### GET `/reports/sales?format=csv`
### GET `/reports/invoices?format=csv`
- Access: `Admin`, `Sales`, `Purchase`

## Error Codes
- `200` Success
- `201` Resource created
- `400` Validation/business-rule error (invalid payload/object id/duplicate key)
- `401` Unauthorized
- `403` Forbidden
- `404` Route/resource not found
- `409` Conflict (for example duplicate user email)
- `500` Internal server error
