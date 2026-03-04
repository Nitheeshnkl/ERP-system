#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const API = 'http://127.0.0.1:8000/api';
const runId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
const outPath = path.resolve(process.cwd(), 'reports/sales-customer-resolution-test.json');

async function call(name, method, endpoint, payload, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API}${endpoint}`, {
    method,
    headers,
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { name, status: response.status, payload: payload ?? null, body };
}

async function main() {
  const steps = [];

  const loginAdmin = await call('login_admin', 'POST', '/auth/login', {
    email: 'admin@erp.local',
    password: 'password123',
  });
  steps.push(loginAdmin);
  const adminToken = loginAdmin.body?.data?.token;

  const customer = await call('create_customer_admin', 'POST', '/customers', {
    name: `Customer ${runId}`,
    email: `customer.${runId}@example.com`,
    phone: '8888888888',
    address: 'Address',
  }, adminToken);
  steps.push(customer);
  const customerId = customer.body?.data?._id || customer.body?.data?.id;

  const product = await call('create_product_admin', 'POST', '/products', {
    name: `Product ${runId}`,
    sku: `SKU-${runId}`,
    price: 200,
    stockQuantity: 30,
  }, adminToken);
  steps.push(product);
  const productId = product.body?.data?._id || product.body?.data?.id;

  const registerSales = await call('register_sales', 'POST', '/auth/register', {
    name: 'Sales User',
    email: `sales.${runId}@example.com`,
    password: 'password123',
    role: 'Sales',
  });
  steps.push(registerSales);

  const loginSales = await call('login_sales', 'POST', '/auth/login', {
    email: `sales.${runId}@example.com`,
    password: 'password123',
  });
  steps.push(loginSales);
  const salesToken = loginSales.body?.data?.token;

  const validPayload = {
    customerId,
    items: [{ productId, quantity: 2, unitPrice: 200 }],
    totalAmount: 400,
    status: 'Pending',
  };

  steps.push(await call('admin_create_so_valid_customer', 'POST', '/sales-orders', validPayload, adminToken));
  steps.push(await call('sales_create_so_valid_customer', 'POST', '/sales-orders', validPayload, salesToken));
  steps.push(await call('admin_create_so_invalid_customer_id', 'POST', '/sales-orders', {
    ...validPayload,
    customerId: 'not-an-objectid',
  }, adminToken));
  steps.push(await call('admin_create_so_non_existing_customer', 'POST', '/sales-orders', {
    ...validPayload,
    customerId: '507f1f77bcf86cd799439011',
  }, adminToken));
  steps.push(await call('admin_create_so_missing_customer', 'POST', '/sales-orders', {
    items: validPayload.items,
    totalAmount: 400,
    status: 'Pending',
  }, adminToken));

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), steps }, null, 2));
  console.log(`Sales customer resolution report written to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
