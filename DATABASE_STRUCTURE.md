# Database Structure

Database: MongoDB (`erp` by default)

## Collections

**users**
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, bcrypt-hashed)
- `role` (Enum: `Admin`, `Sales`, `Purchase`, `Inventory`)
- `tokenVersion` (Number, default `0`)
- `createdAt`, `updatedAt`

Indexes
- Unique index on `email`

**products**
- `name` (String, required)
- `sku` (String, required, unique)
- `price` (Number, min `0`)
- `stockQuantity` (Number, min `0`, default `0`)
- `createdAt`, `updatedAt`

Indexes
- Unique index on `sku`
- Secondary index on `name`

**customers**
- `name` (String, required)
- `email` (String, required, unique)
- `phone` (String)
- `address` (String)
- `createdAt`, `updatedAt`

Indexes
- Unique index on `email`
- Secondary index on `name`

**suppliers**
- `name` (String, required)
- `email` (String, normalized to lowercase, optional)
- `phone` (String)
- `address` (String)
- `city`, `state`, `country`, `postalCode` (String)
- `createdAt`, `updatedAt`

Indexes
- Secondary index on `name`
- Partial unique index on `email` when present

**salesorders**
- `customerId` (ObjectId -> `customers`, required)
- `legacy_customerId` (String, nullable)
- `customerName` (String)
- `items[]` with `productId`, `legacy_productId`, `productName`, `quantity`, `unitPrice`
- `totalAmount` (Number, min `0`)
- `status` (Enum: `Pending`, `Processing`, `Completed`, `Cancelled`)
- `createdAt`, `updatedAt`

Indexes
- `customerName`
- `status`

**purchaseorders**
- `supplierId` (ObjectId -> `suppliers`, required)
- `legacy_supplierId` (String, nullable)
- `supplierName` (String)
- `items[]` with `productId`, `legacy_productId`, `productName`, `quantity`, `unitPrice`
- `totalAmount` (Number, min `0`)
- `status` (Enum: `Pending`, `Received`, `Cancelled`)
- `createdAt`, `updatedAt`

Indexes
- `supplierName`
- `status`

**grns**
- `purchaseOrderId` (ObjectId -> `purchaseorders`, required)
- `legacy_purchaseOrderId` (String, nullable)
- `items[]` with `productId`, `legacy_productId`, `receivedQuantity`
- `createdAt`, `updatedAt`

Indexes
- Default `_id`

**invoices**
- `salesOrderId` (ObjectId -> `salesorders`, required, unique)
- `legacy_salesOrderId` (String, nullable)
- `amount` (Number, required)
- `pdfPath` (String, required)
- `paymentStatus` (Enum: `Paid`, `Pending`, `Cancelled`)
- `createdAt`, `updatedAt`

Indexes
- Unique index on `salesOrderId`
- Secondary index on `paymentStatus`

**demometadatas**
- `type` (String, unique, default `demo_credentials`)
- `role` (String, required)
- `email` (String, required)
- `password_hint` (String, required)
- `note` (String)
- `createdAt`, `updatedAt`

Indexes
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
- `legacy_*` fields are retained for backward compatibility with legacy identifiers.
