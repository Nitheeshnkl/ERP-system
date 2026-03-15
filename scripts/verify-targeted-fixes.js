#!/usr/bin/env node

const path = require('path');

const jwt = require(path.resolve(__dirname, '../backend/node_modules/jsonwebtoken'));

const BASE_URL = 'http://127.0.0.1:8000/api';
const JWT_SECRET = 'tempdevsecret';
const runId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

async function api(name, method, endpoint, payload, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const body = await response.json();
  return { name, status: response.status, body, payload };
}

async function main() {
  const out = [];

  const loginAdmin = await api('login_admin', 'POST', '/auth/login', {
    email: 'admin@erp.local',
    password: 'password123',
  });
  out.push(loginAdmin);
  const adminToken = loginAdmin.body?.data?.token;

  const supplierNoEmail = await api('create_supplier_admin_without_email', 'POST', '/suppliers', {
    name: `Supplier No Email ${runId}`,
    phone: '9999999999',
    address: 'No email address',
  }, adminToken);
  out.push(supplierNoEmail);

  const product = await api('create_product_admin_for_role_test', 'POST', '/products', {
    name: `RoleTest Product ${runId}`,
    sku: `ROLE-${runId}`,
    price: 300,
    stockQuantity: 20,
  }, adminToken);
  out.push(product);

  const customer = await api('create_customer_admin_for_role_test', 'POST', '/customers', {
    name: `RoleTest Customer ${runId}`,
    email: `roletest.customer.${runId}@example.com`,
    phone: '8888888888',
    address: 'Role test address',
  }, adminToken);
  out.push(customer);

  const supplier = await api('create_supplier_admin_for_purchase_test', 'POST', '/suppliers', {
    name: `RoleTest Supplier ${runId}`,
    email: `roletest.supplier.${runId}@example.com`,
    phone: '7777777777',
    address: 'Role test supplier address',
  }, adminToken);
  out.push(supplier);

  const salesRegister = await api('register_sales', 'POST', '/auth/register', {
    name: 'Role Test Sales',
    email: `roletest.sales.${runId}@example.com`,
    password: 'password123',
    role: 'Sales',
  });
  out.push(salesRegister);

  const salesLogin = await api('login_sales', 'POST', '/auth/login', {
    email: `roletest.sales.${runId}@example.com`,
    password: 'password123',
  });
  out.push(salesLogin);

  const salesUser = salesLogin.body?.data?.user;
  const salesLowerToken = jwt.sign(
    { id: salesUser.id, role: 'sales', tv: 0 },
    JWT_SECRET,
    { expiresIn: '30m' }
  );

  const salesOrderWithLowerRole = await api('create_sales_order_with_lowercase_role_token', 'POST', '/sales-orders', {
    customerId: customer.body?.data?._id || customer.body?.data?.id,
    items: [{
      productId: product.body?.data?._id || product.body?.data?.id,
      quantity: 2,
      unitPrice: 300,
    }],
    totalAmount: 600,
    status: 'Pending',
  }, salesLowerToken);
  out.push(salesOrderWithLowerRole);

  const purchaseRegister = await api('register_purchase', 'POST', '/auth/register', {
    name: 'Role Test Purchase',
    email: `roletest.purchase.${runId}@example.com`,
    password: 'password123',
    role: 'Purchase',
  });
  out.push(purchaseRegister);

  const purchaseLogin = await api('login_purchase', 'POST', '/auth/login', {
    email: `roletest.purchase.${runId}@example.com`,
    password: 'password123',
  });
  out.push(purchaseLogin);

  const purchaseUser = purchaseLogin.body?.data?.user;
  const purchaseLowerToken = jwt.sign(
    { id: purchaseUser.id, role: 'purchase', tv: 0 },
    JWT_SECRET,
    { expiresIn: '30m' }
  );

  const purchaseOrderWithLowerRole = await api('create_purchase_order_with_lowercase_role_token', 'POST', '/purchase-orders', {
    supplierId: supplier.body?.data?._id || supplier.body?.data?.id,
    items: [{
      productId: product.body?.data?._id || product.body?.data?.id,
      quantity: 4,
      unitPrice: 250,
    }],
    totalAmount: 1000,
    status: 'Pending',
  }, purchaseLowerToken);
  out.push(purchaseOrderWithLowerRole);

  console.log(JSON.stringify(out, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
