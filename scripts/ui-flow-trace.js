#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const playwright = require('/Users/nitheeshvellaiyan/.nvm/versions/node/v24.5.0/lib/node_modules/playwright');

const FRONTEND_URL = 'http://127.0.0.1:5173';
const API_BASE = 'http://127.0.0.1:8000/api';
const reportPath = path.resolve(process.cwd(), 'reports/ui-flow-trace.json');

const parseJsonSafe = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

async function apiCall(base, method, endpoint, payload, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${base}${endpoint}`, {
    method,
    headers,
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const text = await response.text();
  return {
    status: response.status,
    body: parseJsonSafe(text),
  };
}

async function captureRoleFlow(browser, roleConfig) {
  const { email, routePath, buttonText, endpoint, entitySelections, quantity, unitPrice } = roleConfig;
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle' });
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/\/(dashboard)?$/, { timeout: 20000 });

  const tokenInStorage = await page.evaluate(() => localStorage.getItem('auth_token'));

  await page.goto(`${FRONTEND_URL}${routePath}`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: buttonText }).click();

  for (const item of entitySelections) {
    const locator = page.getByLabel(item.label);
    await locator.click();
    await locator.fill(item.searchText);
    await page.locator('li[role="option"]').filter({ hasText: item.optionText }).first().click();
  }

  await page.getByLabel('Quantity').fill(String(quantity));
  await page.getByLabel('Unit Price').fill(String(unitPrice));

  const [response] = await Promise.all([
    page.waitForResponse((res) => res.request().method() === 'POST' && res.url().includes(endpoint), { timeout: 15000 }),
    page.getByRole('button', { name: 'Save' }).click(),
  ]);

  const request = response.request();
  const captured = {
    request: {
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      body: parseJsonSafe(request.postData() || ''),
    },
    response: {
      status: response.status(),
      body: parseJsonSafe(await response.text()),
    },
  };

  await context.close();

  return {
    tokenPresentInLocalStorage: Boolean(tokenInStorage),
    authHeaderAttached: Boolean(captured?.request?.headers?.authorization),
    ...captured,
  };
}

function compareShape(actual, expected) {
  const actualKeys = Object.keys(actual || {}).sort();
  const expectedKeys = Object.keys(expected || {}).sort();
  return {
    missingKeys: expectedKeys.filter((key) => !actualKeys.includes(key)),
    extraKeys: actualKeys.filter((key) => !expectedKeys.includes(key)),
  };
}

async function main() {
  const runId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const salesEmail = `ui.sales.${runId}@example.com`;
  const purchaseEmail = `ui.purchase.${runId}@example.com`;

  const adminLogin = await apiCall(API_BASE, 'POST', '/auth/login', {
    email: 'admin@erp.local',
    password: 'password123',
  });
  if (adminLogin.status !== 200) {
    throw new Error(`Admin login failed: ${adminLogin.status}`);
  }
  const adminToken = adminLogin.body?.data?.token;

  const supplierRes = await apiCall(API_BASE, 'POST', '/suppliers', {
    name: `UI Supplier ${runId}`,
    email: `ui.supplier.${runId}@example.com`,
    phone: '7777777777',
    address: 'UI Supplier Address',
  }, adminToken);
  const supplier = supplierRes.body?.data;

  const productRes = await apiCall(API_BASE, 'POST', '/products', {
    name: `UI Product ${runId}`,
    sku: `UI-SKU-${runId}`,
    price: 180,
    stockQuantity: 50,
  }, adminToken);
  const product = productRes.body?.data;

  const customerRes = await apiCall(API_BASE, 'POST', '/customers', {
    name: `UI Customer ${runId}`,
    email: `ui.customer.${runId}@example.com`,
    phone: '8888888888',
    address: 'UI Customer Address',
  }, adminToken);
  const customer = customerRes.body?.data;

  await apiCall(API_BASE, 'POST', '/auth/register', {
    name: 'UI Sales User',
    email: salesEmail,
    password: 'password123',
    role: 'Sales',
  });

  await apiCall(API_BASE, 'POST', '/auth/register', {
    name: 'UI Purchase User',
    email: purchaseEmail,
    password: 'password123',
    role: 'Purchase',
  });

  const browser = await playwright.chromium.launch({ headless: true });

  const salesTrace = await captureRoleFlow(browser, {
    email: salesEmail,
    routePath: '/sales-orders',
    buttonText: 'New SO',
    endpoint: '/api/sales-orders',
    entitySelections: [
      { label: 'Customer', searchText: customer.name, optionText: customer.name },
      { label: 'Product', searchText: product.name, optionText: product.name },
    ],
    quantity: 2,
    unitPrice: 180,
  });

  const purchaseTrace = await captureRoleFlow(browser, {
    email: purchaseEmail,
    routePath: '/purchase-orders',
    buttonText: 'New PO',
    endpoint: '/api/purchase-orders',
    entitySelections: [
      { label: 'Supplier', searchText: supplier.name, optionText: supplier.name },
      { label: 'Product', searchText: product.name, optionText: product.name },
    ],
    quantity: 3,
    unitPrice: 150,
  });

  await browser.close();

  const expectedSalesPayload = {
    customerId: customer._id,
    items: [{ productId: product._id, quantity: 2, unitPrice: 180 }],
    totalAmount: 360,
    status: 'Pending',
  };

  const expectedPurchasePayload = {
    supplierId: supplier._id,
    items: [{ productId: product._id, quantity: 3, unitPrice: 150 }],
    totalAmount: 450,
    status: 'Pending',
  };

  const output = {
    generatedAt: new Date().toISOString(),
    sales: salesTrace,
    purchase: purchaseTrace,
    comparison: {
      salesVsProgrammatic: compareShape(salesTrace?.request?.body, expectedSalesPayload),
      purchaseVsProgrammatic: compareShape(purchaseTrace?.request?.body, expectedPurchasePayload),
    },
  };

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(output, null, 2));
  console.log(`UI flow trace written to ${reportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
