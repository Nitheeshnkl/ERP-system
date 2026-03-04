const request = require('supertest');
const app = require('../app');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Customer = require('../src/models/Customer');
const SalesOrder = require('../src/models/SalesOrder');

const loginAndGetToken = async (email, password) => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return response.body?.data?.token;
};

describe('Sales Order API', () => {
  test('Create sales order with valid data', async () => {
    await User.create({ name: 'Sales User', email: 'sales@example.com', password: 'password123', role: 'Sales' });
    const token = await loginAndGetToken('sales@example.com', 'password123');

    const customer = await Customer.create({
      name: 'Customer A',
      email: 'customer.a@example.com',
      phone: '1234567890',
      address: 'Test Address',
    });

    const product = await Product.create({
      name: 'Product A',
      sku: 'SKU-001',
      price: 100,
      stockQuantity: 50,
    });

    const payload = {
      customerId: String(customer._id),
      items: [{ productId: String(product._id), quantity: 2, unitPrice: 100 }],
      totalAmount: 200,
      status: 'Pending',
    };

    const response = await request(app)
      .post('/api/sales-orders')
      .set('Authorization', `Bearer ${token}`)
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.customerName).toBe('Customer A');
  });

  test('Update sales order', async () => {
    await User.create({ name: 'Sales User', email: 'sales@example.com', password: 'password123', role: 'Sales' });
    const token = await loginAndGetToken('sales@example.com', 'password123');

    const customer = await Customer.create({
      name: 'Customer B',
      email: 'customer.b@example.com',
      phone: '1234567890',
      address: 'Test Address',
    });

    const product = await Product.create({
      name: 'Product B',
      sku: 'SKU-002',
      price: 50,
      stockQuantity: 50,
    });

    const order = await SalesOrder.create({
      customerId: customer._id,
      customerName: customer.name,
      items: [{ productId: product._id, productName: product.name, quantity: 1, unitPrice: 50 }],
      totalAmount: 50,
      status: 'Pending',
    });

    const response = await request(app)
      .put(`/api/sales-orders/${order._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Processing' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('Processing');
  });

  test('Access sales order route without proper role returns 403', async () => {
    await User.create({ name: 'Purchase User', email: 'purchase@example.com', password: 'password123', role: 'Purchase' });
    const token = await loginAndGetToken('purchase@example.com', 'password123');

    const customer = await Customer.create({
      name: 'Customer C',
      email: 'customer.c@example.com',
      phone: '1234567890',
      address: 'Test Address',
    });

    const product = await Product.create({
      name: 'Product C',
      sku: 'SKU-003',
      price: 20,
      stockQuantity: 30,
    });

    const response = await request(app)
      .post('/api/sales-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customerId: String(customer._id),
        items: [{ productId: String(product._id), quantity: 1, unitPrice: 20 }],
        totalAmount: 20,
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });
});
