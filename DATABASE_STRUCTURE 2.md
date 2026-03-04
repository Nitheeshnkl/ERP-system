# Database Structure

Database: MongoDB (`erp` by default)

## Collections

## `users`
Fields:
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, bcrypt-hashed)
- `role` (Enum: `Admin`, `Sales`, `Purchase`, `Inventory`)
- `tokenVersion` (Number, default `0`)
- `createdAt`, `updatedAt`

Indexes:
- Unique index on `email`

## `products`
Fields:
- `name` (String, required)
- `sku` (String, required, unique)
- `price` (Number, min `0`)
- `stockQuantity` (Number, min `0`, default `0`)
- `createdAt`, `updatedAt`

Indexes:
- Unique index on `sku`
- Secondary index on `name`

## `customers`
Fields:
- `name` (String, required)
- `email` (String, required, unique)
- `phone` (String)
- `address` (String)
- `createdAt`, `updatedAt`

Indexes:
- Unique index on `email`
- Secondary index on `name`

## `suppliers`
Fields:
- `name` (String, required)
- `email` (String, normalized to lowercase, optional)
- `phone` (String)
- `address` (String)
- `city`, `state`, `country`, `postalCode` (String)
- `createdAt`, `updatedAt`

Indexes:
- Secondary index on `name`
- Partial unique index on `email` (only when email is present as string)

## `salesorders`
Fields:
- `customerId` (ObjectId -> `customers`, required)
- `legacy_customerId` (String, nullable)
- `customerName` (String)
- `items[]`
  - `productId` (ObjectId -> `products`, required)
  - `legacy_productId` (String, nullable)
  - `productName` (String)
  - `quantity` (Number, min `1`)
  - `unitPrice` (Number, min `0`)
- `totalAmount` (Number, min `0`)
- `status` (Enum: `Pending`, `Processing`, `Completed`, `Cancelled`)
- `createdAt`, `updatedAt`

Indexes:
- `customerName`
- `status`

## `purchaseorders`
Fields:
- `supplierId` (ObjectId -> `suppliers`, required)
- `legacy_supplierId` (String, nullable)
- `supplierName` (String)
- `items[]`
  - `productId` (ObjectId -> `products`, required)
  - `legacy_productId` (String, nullable)
  - `productName` (String)
  - `quantity` (Number, min `1`)
  - `unitPrice` (Number, min `0`)
- `totalAmount` (Number, min `0`)
- `status` (Enum: `Pending`, `Received`, `Cancelled`)
- `createdAt`, `updatedAt`

Indexes:
- `supplierName`
- `status`

## `grns`
Fields:
- `purchaseOrderId` (ObjectId -> `purchaseorders`, required)
- `legacy_purchaseOrderId` (String, nullable)
- `items[]`
  - `productId` (ObjectId -> `products`, required)
  - `legacy_productId` (String, nullable)
  - `receivedQuantity` (Number, min `1`)
- `createdAt`, `updatedAt`

Indexes:
- Default `_id`

## `invoices`
Fields:
- `salesOrderId` (ObjectId -> `salesorders`, required, unique)
- `legacy_salesOrderId` (String, nullable)
- `amount` (Number, required)
- `pdfPath` (String, required)
- `paymentStatus` (Enum: `Paid`, `Pending`, `Cancelled`)
- `createdAt`, `updatedAt`

Indexes:
- Unique index on `salesOrderId`
- Secondary index on `paymentStatus`

## `demometadatas`
Fields:
- `type` (String, unique, default `demo_credentials`)
- `role` (String, required)
- `email` (String, required)
- `password_hint` (String, required)
- `note` (String)
- `createdAt`, `updatedAt`

Indexes:
- Unique index on `type`

## Relationships Summary
- `SalesOrder.customerId` -> `Customer._id`
- `SalesOrder.items[].productId` -> `Product._id`
- `PurchaseOrder.supplierId` -> `Supplier._id`
- `PurchaseOrder.items[].productId` -> `Product._id`
- `GRN.purchaseOrderId` -> `PurchaseOrder._id`
- `GRN.items[].productId` -> `Product._id`
- `Invoice.salesOrderId` -> `SalesOrder._id` (1:1 enforced by unique index)

## Notes
- `legacy_*` fields are maintained to preserve compatibility with legacy string identifiers.
- No schema changes were made as part of this documentation update.
