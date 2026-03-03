#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BASE = 'http://127.0.0.1:8000/api';
const runId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const outFile = path.resolve(process.cwd(), 'reports/rbac-matrix.json');

const decodeJwtPayload = (token) => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
};

async function req(name, method, url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${BASE}${url}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }
  return { name, status: response.status, request: { method, url: `${BASE}${url}`, body: body ?? null }, body: parsed };
}

async function main() {
  const steps = [];

  const loginAdmin = await req('login_admin', 'POST', '/auth/login', {
    email: 'admin@erp.local',
    password: 'password123',
  });
  steps.push(loginAdmin);
  const adminToken = loginAdmin.body?.data?.token;

  const supplier = await req('create_supplier_admin', 'POST', '/suppliers', {
    name: `RBAC Supplier ${runId}`,
    email: `rbac.supplier.${runId}@example.com`,
    phone: '7777777777',
    address: 'RBAC address',
  }, adminToken);
  steps.push(supplier);

  const product = await req('create_product_admin', 'POST', '/products', {
    name: `RBAC Product ${runId}`,
    sku: `RBAC-${runId}`,
    price: 199,
    stockQuantity: 40,
  }, adminToken);
  steps.push(product);

  const customer = await req('create_customer_admin', 'POST', '/customers', {
    name: `RBAC Customer ${runId}`,
    email: `rbac.customer.${runId}@example.com`,
    phone: '8888888888',
    address: 'RBAC customer address',
  }, adminToken);
  steps.push(customer);

  const salesEmail = `rbac.sales.${runId}@example.com`;
  const purchaseEmail = `rbac.purchase.${runId}@example.com`;

  steps.push(await req('register_sales', 'POST', '/auth/register', {
    name: 'RBAC Sales',
    email: salesEmail,
    password: 'password123',
    role: 'Sales',
  }));

  const loginSales = await req('login_sales', 'POST', '/auth/login', {
    email: salesEmail,
    password: 'password123',
  });
  steps.push(loginSales);
  const salesToken = loginSales.body?.data?.token;

  steps.push(await req('register_purchase', 'POST', '/auth/register', {
    name: 'RBAC Purchase',
    email: purchaseEmail,
    password: 'password123',
    role: 'Purchase',
  }));

  const loginPurchase = await req('login_purchase', 'POST', '/auth/login', {
    email: purchaseEmail,
    password: 'password123',
  });
  steps.push(loginPurchase);
  const purchaseToken = loginPurchase.body?.data?.token;

  const supplierId = supplier.body?.data?._id || supplier.body?.data?.id;
  const productId = product.body?.data?._id || product.body?.data?.id;
  const customerId = customer.body?.data?._id || customer.body?.data?.id;

  const soBody = {
    customerId,
    items: [{ productId, quantity: 2, unitPrice: 199 }],
    totalAmount: 398,
    status: 'Pending',
  };

  const poBody = {
    supplierId,
    items: [{ productId, quantity: 3, unitPrice: 150 }],
    totalAmount: 450,
    status: 'Pending',
  };

  steps.push(await req('admin_create_sales_order', 'POST', '/sales-orders', soBody, adminToken));
  steps.push(await req('admin_create_purchase_order', 'POST', '/purchase-orders', poBody, adminToken));
  steps.push(await req('sales_create_sales_order', 'POST', '/sales-orders', soBody, salesToken));
  steps.push(await req('sales_create_purchase_order', 'POST', '/purchase-orders', poBody, salesToken));
  steps.push(await req('purchase_create_purchase_order', 'POST', '/purchase-orders', poBody, purchaseToken));
  steps.push(await req('purchase_create_sales_order', 'POST', '/sales-orders', soBody, purchaseToken));

  const summary = {
    adminTokenRole: decodeJwtPayload(adminToken)?.role || null,
    salesTokenRole: decodeJwtPayload(salesToken)?.role || null,
    purchaseTokenRole: decodeJwtPayload(purchaseToken)?.role || null,
    expectedMatrix: {
      admin_create_sales_order: 201,
      admin_create_purchase_order: 201,
      sales_create_sales_order: 201,
      sales_create_purchase_order: 403,
      purchase_create_purchase_order: 201,
      purchase_create_sales_order: 403,
    },
    actualMatrix: Object.fromEntries(
      steps
        .filter((s) => s.name.includes('_create_'))
        .map((s) => [s.name, s.status])
    ),
  };

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify({ generatedAt: new Date().toISOString(), summary, steps }, null, 2));
  console.log(`RBAC matrix written to ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
