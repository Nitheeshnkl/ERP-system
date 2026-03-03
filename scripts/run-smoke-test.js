#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8000';
const API_BASE = `${BASE_URL}/api`;

const outFileArg = process.argv[2];
if (!outFileArg) {
  console.error('Usage: node scripts/run-smoke-test.js <output-json-path>');
  process.exit(1);
}

const outFile = path.resolve(process.cwd(), outFileArg);
const unique = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const state = {
  adminToken: '',
  salesToken: '',
  purchaseToken: '',
  supplierId: '',
  productId: '',
  customerId: '',
};

const result = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  steps: [],
};

const isJsonLike = (value) => {
  if (!value || typeof value !== 'string') return false;
  const t = value.trim();
  return t.startsWith('{') || t.startsWith('[');
};

async function callApi(name, method, endpoint, payload, token) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const request = {
    method,
    url: `${API_BASE}${endpoint}`,
    payload: payload === undefined ? null : payload,
  };

  let response;
  let body;
  let raw = '';
  try {
    response = await fetch(request.url, {
      method,
      headers,
      body: payload === undefined ? undefined : JSON.stringify(payload),
    });
    raw = await response.text();
    body = isJsonLike(raw) ? JSON.parse(raw) : raw;
  } catch (error) {
    const entry = {
      name,
      request,
      response: {
        status: 0,
        body: { success: false, message: error.message, data: null },
      },
      validationError: error.message,
    };
    result.steps.push(entry);
    return entry;
  }

  const validationError =
    response.status === 400 || response.status === 401 || response.status === 403
      ? (body && typeof body === 'object' ? body.message || null : null)
      : null;

  const entry = {
    name,
    request,
    response: {
      status: response.status,
      body,
    },
    validationError,
  };

  result.steps.push(entry);
  return entry;
}

function getTokenFromStep(step) {
  return step?.response?.body?.data?.token || '';
}

function getIdFromStep(step) {
  const data = step?.response?.body?.data;
  return data?._id || data?.id || '';
}

async function run() {
  const adminEmail = `admin+${unique}@example.com`;
  const salesEmail = `sales+${unique}@example.com`;
  const purchaseEmail = `purchase+${unique}@example.com`;

  await callApi('register_admin', 'POST', '/auth/register', {
    name: 'Smoke Admin',
    email: adminEmail,
    password: 'password123',
    role: 'Admin',
  });

  const loginAdmin = await callApi('login_admin', 'POST', '/auth/login', {
    email: 'admin@erp.local',
    password: 'password123',
  });
  state.adminToken = getTokenFromStep(loginAdmin);

  await callApi('auth_me_admin', 'GET', '/auth/me', undefined, state.adminToken);
  await callApi('dashboard_metrics_admin', 'GET', '/dashboard/metrics', undefined, state.adminToken);
  await callApi('dashboard_chart_admin', 'GET', '/dashboard/chart', undefined, state.adminToken);

  const createSupplier = await callApi('create_supplier_admin', 'POST', '/suppliers', {
    name: `Smoke Supplier ${unique}`,
    email: `supplier+${unique}@example.com`,
    phone: '9999999999',
    address: 'Smoke Address',
  }, state.adminToken);
  state.supplierId = getIdFromStep(createSupplier);

  const createProduct = await callApi('create_product_admin', 'POST', '/products', {
    name: `Smoke Product ${unique}`,
    sku: `SKU-${unique}`,
    price: 120,
    stockQuantity: 25,
  }, state.adminToken);
  state.productId = getIdFromStep(createProduct);

  const createCustomer = await callApi('create_customer_admin', 'POST', '/customers', {
    name: `Smoke Customer ${unique}`,
    email: `customer+${unique}@example.com`,
    phone: '8888888888',
    address: 'Customer Address',
  }, state.adminToken);
  state.customerId = getIdFromStep(createCustomer);

  await callApi('list_products_admin', 'GET', '/products', undefined, state.adminToken);
  await callApi('list_suppliers_admin', 'GET', '/suppliers', undefined, state.adminToken);
  await callApi('list_customers_admin', 'GET', '/customers', undefined, state.adminToken);

  await callApi('register_sales', 'POST', '/auth/register', {
    name: 'Smoke Sales',
    email: salesEmail,
    password: 'password123',
    role: 'Sales',
  });
  const loginSales = await callApi('login_sales', 'POST', '/auth/login', {
    email: salesEmail,
    password: 'password123',
  });
  state.salesToken = getTokenFromStep(loginSales);

  await callApi('auth_me_sales', 'GET', '/auth/me', undefined, state.salesToken);
  await callApi('create_sales_order_sales', 'POST', '/sales-orders', {
    customerId: state.customerId,
    customerName: state.customerId,
    items: [
      {
        productId: state.productId,
        productName: state.productId,
        quantity: 2,
        unitPrice: 120,
      },
    ],
    totalAmount: 240,
    status: 'Pending',
  }, state.salesToken);

  await callApi('register_purchase', 'POST', '/auth/register', {
    name: 'Smoke Purchase',
    email: purchaseEmail,
    password: 'password123',
    role: 'Purchase',
  });
  const loginPurchase = await callApi('login_purchase', 'POST', '/auth/login', {
    email: purchaseEmail,
    password: 'password123',
  });
  state.purchaseToken = getTokenFromStep(loginPurchase);

  await callApi('auth_me_purchase', 'GET', '/auth/me', undefined, state.purchaseToken);
  await callApi('create_purchase_order_purchase', 'POST', '/purchase-orders', {
    supplierId: state.supplierId,
    supplierName: state.supplierId,
    items: [
      {
        productId: state.productId,
        productName: state.productId,
        quantity: 3,
        unitPrice: 90,
      },
    ],
    totalAmount: 270,
    status: 'Pending',
  }, state.purchaseToken);

  await callApi('list_sales_orders_sales', 'GET', '/sales-orders', undefined, state.salesToken);
  await callApi('list_purchase_orders_purchase', 'GET', '/purchase-orders', undefined, state.purchaseToken);
  await callApi('list_invoices_admin', 'GET', '/invoices', undefined, state.adminToken);

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
  console.log(`Smoke test written to ${outFile}`);
}

run().catch((error) => {
  console.error('Smoke test failed:', error);
  process.exit(1);
});
