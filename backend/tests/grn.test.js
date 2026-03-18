const request = require('supertest');
const app = require('../app');
const Product = require('../src/models/Product');
const Supplier = require('../src/models/Supplier');
const PurchaseOrder = require('../src/models/PurchaseOrder');
const { createUser, loginAndGetToken } = require('./helpers');

describe('GRN API', () => {
  it('creates and fetches GRN', async () => {
    const supplier = await Supplier.create({ name: 'Sup', email: 'supgrn@test.com' });
    const product = await Product.create({ name: 'Item', sku: 'G1', price: 10, stockQuantity: 5 });
    const order = await PurchaseOrder.create({
      supplierId: supplier._id,
      supplierName: supplier.name,
      items: [{ productId: product._id, productName: product.name, quantity: 2, unitPrice: 10 }],
      totalAmount: 20,
      status: 'Pending',
    });

    const user = await createUser({ email: 'grn@test.com', role: 'Inventory' });
    const token = await loginAndGetToken(app, { email: user.email, password: 'Pass123!' });

    const created = await request(app)
      .post('/api/grn')
      .set('Authorization', `Bearer ${token}`)
      .send({ purchaseOrderId: order._id, items: [{ productId: product._id, receivedQuantity: 2 }] });
    expect(created.statusCode).toBe(201);

    const list = await request(app)
      .get('/api/grn')
      .set('Authorization', `Bearer ${token}`);
    expect(list.statusCode).toBe(200);
    expect(Array.isArray(list.body.data)).toBe(true);
  });

  it('rejects GRN creation without items', async () => {
    const supplier = await Supplier.create({ name: 'Sup2', email: 'supgrn2@test.com' });
    const order = await PurchaseOrder.create({
      supplierId: supplier._id,
      supplierName: supplier.name,
      items: [],
      totalAmount: 0,
      status: 'Pending',
    });

    const user = await createUser({ email: 'grn2@test.com', role: 'Inventory' });
    const token = await loginAndGetToken(app, { email: user.email, password: 'Pass123!' });

    const res = await request(app)
      .post('/api/grn')
      .set('Authorization', `Bearer ${token}`)
      .send({ purchaseOrderId: order._id, items: [] });
    expect(res.statusCode).toBe(400);
  });
});
