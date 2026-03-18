const request = require('supertest');
const app = require('../app');
const Product = require('../src/models/Product');
const { createUser, loginAndGetToken } = require('./helpers');

describe('Products API', () => {
  it('requires auth for list', async () => {
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toBe(401);
  });

  it('lists products with pagination', async () => {
    await Product.create({ name: 'Widget', sku: 'W-1', price: 10, stockQuantity: 5 });
    const user = await createUser({ email: 'sales@test.com', role: 'Sales' });
    const token = await loginAndGetToken(app, { email: user.email, password: 'Pass123!' });

    const res = await request(app)
      .get('/api/products?page=1&limit=10&search=Wid')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.meta).toBeDefined();
  });

  it('validates create payload and enforces role', async () => {
    const sales = await createUser({ email: 'sales2@test.com', role: 'Sales' });
    const salesToken = await loginAndGetToken(app, { email: sales.email, password: 'Pass123!' });

    const forbidden = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ name: 'X', sku: 'X1', price: 9, stockQuantity: 1 });
    expect(forbidden.statusCode).toBe(403);

    const inventory = await createUser({ email: 'inv@test.com', role: 'Inventory' });
    const invToken = await loginAndGetToken(app, { email: inventory.email, password: 'Pass123!' });

    const bad = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${invToken}`)
      .send({ sku: 'X1' });
    expect(bad.statusCode).toBe(400);

    const good = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${invToken}`)
      .send({ name: 'Gadget', sku: 'G1', price: 99, stockQuantity: 3 });
    expect(good.statusCode).toBe(201);
    expect(good.body.data.sku).toBe('G1');
  });

  it('updates and deletes product with proper roles', async () => {
    const product = await Product.create({ name: 'Bolt', sku: 'B1', price: 5, stockQuantity: 2 });

    const inventory = await createUser({ email: 'inv2@test.com', role: 'Inventory' });
    const invToken = await loginAndGetToken(app, { email: inventory.email, password: 'Pass123!' });

    const updated = await request(app)
      .put(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${invToken}`)
      .send({ price: 6 });
    expect(updated.statusCode).toBe(200);
    expect(updated.body.data.price).toBe(6);

    const admin = await createUser({ email: 'admin2@test.com', role: 'Admin' });
    const adminToken = await loginAndGetToken(app, { email: admin.email, password: 'Pass123!' });

    const deleted = await request(app)
      .delete(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleted.statusCode).toBe(200);
  });
});
