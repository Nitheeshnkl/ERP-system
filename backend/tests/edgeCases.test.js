const request = require('supertest');
const app = require('../app');
const Product = require('../src/models/Product');
const Supplier = require('../src/models/Supplier');
const Customer = require('../src/models/Customer');
const SalesOrder = require('../src/models/SalesOrder');
const Invoice = require('../src/models/Invoice');
const { createUser, loginAndGetToken } = require('./helpers');

describe('API edge cases', () => {
  it('rejects invalid report formats', async () => {
    const user = await createUser({ email: 'edge@test.com', role: 'Sales' });
    const token = await loginAndGetToken(app, { email: user.email, password: 'Pass123!' });

    const sales = await request(app)
      .get('/api/reports/sales?format=pdf')
      .set('Authorization', `Bearer ${token}`);
    expect(sales.statusCode).toBe(400);

    const invoices = await request(app)
      .get('/api/reports/invoices?format=pdf')
      .set('Authorization', `Bearer ${token}`);
    expect(invoices.statusCode).toBe(400);
  });

  it('handles invoice not found and invalid status', async () => {
    const user = await createUser({ email: 'edge2@test.com', role: 'Sales' });
    const token = await loginAndGetToken(app, { email: user.email, password: 'Pass123!' });

    const notFound = await request(app)
      .get('/api/invoices/64b9a2364a46eddc75d238bc')
      .set('Authorization', `Bearer ${token}`);
    expect(notFound.statusCode).toBe(404);

    const customer = await Customer.create({ name: 'Inv', email: 'inv@edge.com' });
    const order = await SalesOrder.create({ customerId: customer._id, customerName: customer.name, items: [], totalAmount: 10, status: 'Pending' });
    const invoice = await Invoice.create({ salesOrderId: order._id, amount: 10, pdfPath: '/tmp/x.pdf', paymentStatus: 'Pending' });

    const badStatus = await request(app)
      .patch(`/api/invoices/${invoice._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Unknown' });
    expect(badStatus.statusCode).toBe(400);
  });

  it('handles GRN not found', async () => {
    const user = await createUser({ email: 'edge3@test.com', role: 'Inventory' });
    const token = await loginAndGetToken(app, { email: user.email, password: 'Pass123!' });

    const res = await request(app)
      .get('/api/grn/64b9a2364a46eddc75d238bc')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });

  it('blocks edits to completed sales orders with items', async () => {
    const customer = await Customer.create({ name: 'Comp', email: 'comp@edge.com' });
    const product = await Product.create({ name: 'P', sku: 'P-EDGE', price: 10, stockQuantity: 10 });
    const order = await SalesOrder.create({
      customerId: customer._id,
      customerName: customer.name,
      items: [{ productId: product._id, productName: product.name, quantity: 1, unitPrice: 10 }],
      totalAmount: 10,
      status: 'Completed',
    });

    const user = await createUser({ email: 'edge4@test.com', role: 'Sales' });
    const token = await loginAndGetToken(app, { email: user.email, password: 'Pass123!' });

    const res = await request(app)
      .put(`/api/sales-orders/${order._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: product._id, quantity: 2, unitPrice: 10 }] });
    expect(res.statusCode).toBe(400);
  });

  it('returns 404 when purchase order not found', async () => {
    const user = await createUser({ email: 'edge5@test.com', role: 'Purchase' });
    const token = await loginAndGetToken(app, { email: user.email, password: 'Pass123!' });

    const res = await request(app)
      .get('/api/purchase-orders/64b9a2364a46eddc75d238bc')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
});
