const request = require('supertest');
const app = require('../app');
const Product = require('../src/models/Product');
const Supplier = require('../src/models/Supplier');
const PurchaseOrder = require('../src/models/PurchaseOrder');
const { createUser, loginAndGetToken } = require('./helpers');

describe('Purchase Orders API', () => {
  it('creates and updates purchase orders with role checks', async () => {
    const supplier = await Supplier.create({ name: 'Supply', email: 'supply@test.com' });
    const product = await Product.create({ name: 'Item', sku: 'IT1', price: 10, stockQuantity: 100 });

    const purchaseUser = await createUser({ email: 'po@test.com', role: 'Purchase' });
    const token = await loginAndGetToken(app, { email: purchaseUser.email, password: 'Pass123!' });

    const bad = await request(app)
      .post('/api/purchase-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ supplierId: supplier._id });
    expect(bad.statusCode).toBe(400);

    const created = await request(app)
      .post('/api/purchase-orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        supplierId: supplier._id,
        items: [{ productId: product._id, quantity: 5, unitPrice: 9 }],
        totalAmount: 45,
        status: 'Pending',
      });
    expect(created.statusCode).toBe(201);

    const updated = await request(app)
      .put(`/api/purchase-orders/${created.body.data._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Received', totalAmount: 45 });
    expect(updated.statusCode).toBe(200);
  });

  it('rejects invalid id on update', async () => {
    const purchaseUser = await createUser({ email: 'po2@test.com', role: 'Purchase' });
    const token = await loginAndGetToken(app, { email: purchaseUser.email, password: 'Pass123!' });

    const res = await request(app)
      .put('/api/purchase-orders/not-a-valid-id')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Received' });
    expect(res.statusCode).toBe(400);
  });

  it('allows admin to delete', async () => {
    const supplier = await Supplier.create({ name: 'Sup', email: 'sup2@test.com' });
    const product = await Product.create({ name: 'Item2', sku: 'IT2', price: 10, stockQuantity: 100 });
    const order = await PurchaseOrder.create({
      supplierId: supplier._id,
      supplierName: supplier.name,
      items: [{ productId: product._id, productName: product.name, quantity: 2, unitPrice: 10 }],
      totalAmount: 20,
      status: 'Pending',
    });

    const admin = await createUser({ email: 'poadmin@test.com', role: 'Admin' });
    const token = await loginAndGetToken(app, { email: admin.email, password: 'Pass123!' });

    const res = await request(app)
      .delete(`/api/purchase-orders/${order._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
