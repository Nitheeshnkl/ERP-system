const request = require('supertest');
const app = require('../app');
const Product = require('../src/models/Product');
const Customer = require('../src/models/Customer');
const SalesOrder = require('../src/models/SalesOrder');
const Invoice = require('../src/models/Invoice');
const { createUser, loginAndGetToken } = require('./helpers');

jest.mock('../src/utils/pdfGenerator', () => ({
  generateInvoicePDF: jest.fn().mockResolvedValue('/tmp/invoice.pdf'),
}));

describe('Sales Orders API', () => {
  it('creates order and validates payload', async () => {
    const customer = await Customer.create({ name: 'Cust', email: 'cust@test.com' });
    const product = await Product.create({ name: 'Item', sku: 'S1', price: 10, stockQuantity: 50 });

    const salesUser = await createUser({ email: 'sales5@test.com', role: 'Sales' });
    const token = await loginAndGetToken(app, { email: salesUser.email, password: 'Pass123!' });

    const bad = await request(app)
      .post('/api/sales-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ customerId: customer._id });
    expect(bad.statusCode).toBe(400);

    const created = await request(app)
      .post('/api/sales-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId: customer._id,
        items: [{ productId: product._id, quantity: 2, unitPrice: 10 }],
        totalAmount: 20,
        status: 'Pending',
      });
    expect(created.statusCode).toBe(201);
  });

  it('updates to Completed and creates invoice', async () => {
    const customer = await Customer.create({ name: 'Cust2', email: 'cust2@test.com' });
    const product = await Product.create({ name: 'Item2', sku: 'S2', price: 10, stockQuantity: 10 });

    const order = await SalesOrder.create({
      customerId: customer._id,
      customerName: customer.name,
      items: [{ productId: product._id, productName: product.name, quantity: 2, unitPrice: 10 }],
      totalAmount: 20,
      status: 'Pending',
    });

    const salesUser = await createUser({ email: 'sales6@test.com', role: 'Sales' });
    const token = await loginAndGetToken(app, { email: salesUser.email, password: 'Pass123!' });

    const updated = await request(app)
      .put(`/api/sales-orders/${order._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Completed' });
    expect(updated.statusCode).toBe(200);

    const invoice = await Invoice.findOne({ salesOrderId: order._id });
    expect(invoice).toBeTruthy();
  });

  it('returns error when insufficient stock on completion', async () => {
    const customer = await Customer.create({ name: 'Cust3', email: 'cust3@test.com' });
    const product = await Product.create({ name: 'LowStock', sku: 'LS-1', price: 10, stockQuantity: 1 });

    const order = await SalesOrder.create({
      customerId: customer._id,
      customerName: customer.name,
      items: [{ productId: product._id, productName: product.name, quantity: 2, unitPrice: 10 }],
      totalAmount: 20,
      status: 'Pending',
    });

    const salesUser = await createUser({ email: 'sales8@test.com', role: 'Sales' });
    const token = await loginAndGetToken(app, { email: salesUser.email, password: 'Pass123!' });

    const res = await request(app)
      .put(`/api/sales-orders/${order._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Completed' });
    expect(res.statusCode).toBe(400);
  });

  it('rejects invalid update id', async () => {
    const salesUser = await createUser({ email: 'sales7@test.com', role: 'Sales' });
    const token = await loginAndGetToken(app, { email: salesUser.email, password: 'Pass123!' });

    const res = await request(app)
      .put('/api/sales-orders/not-a-valid-id')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Completed' });
    expect(res.statusCode).toBe(400);
  });
});
