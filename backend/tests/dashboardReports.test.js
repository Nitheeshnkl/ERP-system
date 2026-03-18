const request = require('supertest');
const app = require('../app');
const Product = require('../src/models/Product');
const Customer = require('../src/models/Customer');
const SalesOrder = require('../src/models/SalesOrder');
const Invoice = require('../src/models/Invoice');
const { createUser, loginAndGetToken } = require('./helpers');

describe('Dashboard & Reports API', () => {
  it('returns dashboard metrics and chart data', async () => {
    const customer = await Customer.create({ name: 'Dash', email: 'dash@test.com' });
    await Product.create({ name: 'LowStock', sku: 'LS1', price: 10, stockQuantity: 5 });
    await SalesOrder.create({
      customerId: customer._id,
      customerName: customer.name,
      items: [],
      totalAmount: 120,
      status: 'Pending',
    });

    const user = await createUser({ email: 'dashuser@test.com', role: 'Sales' });
    const token = await loginAndGetToken(app, { email: user.email, password: 'Pass123!' });

    const metrics = await request(app)
      .get('/api/dashboard/metrics')
      .set('Authorization', `Bearer ${token}`);
    expect(metrics.statusCode).toBe(200);
    expect(metrics.body.data).toHaveProperty('totalSales');

    const chart = await request(app)
      .get('/api/dashboard/chart')
      .set('Authorization', `Bearer ${token}`);
    expect(chart.statusCode).toBe(200);
    expect(Array.isArray(chart.body.data)).toBe(true);
  });

  it('exports reports as CSV', async () => {
    const customer = await Customer.create({ name: 'Rep', email: 'rep@test.com' });
    const order = await SalesOrder.create({
      customerId: customer._id,
      customerName: customer.name,
      items: [],
      totalAmount: 200,
      status: 'Pending',
    });
    await Invoice.create({
      salesOrderId: order._id,
      amount: 200,
      pdfPath: '/tmp/invoice.pdf',
      paymentStatus: 'Pending',
    });

    const user = await createUser({ email: 'repuser@test.com', role: 'Sales' });
    const token = await loginAndGetToken(app, { email: user.email, password: 'Pass123!' });

    const salesReport = await request(app)
      .get('/api/reports/sales?format=csv')
      .set('Authorization', `Bearer ${token}`);
    expect(salesReport.statusCode).toBe(200);
    expect(salesReport.headers['content-type']).toMatch(/text\/csv/);

    const invoiceReport = await request(app)
      .get('/api/reports/invoices?format=csv')
      .set('Authorization', `Bearer ${token}`);
    expect(invoiceReport.statusCode).toBe(200);
    expect(invoiceReport.headers['content-type']).toMatch(/text\/csv/);
  });
});
