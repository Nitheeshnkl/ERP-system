const request = require('supertest');
const app = require('../app');
const Supplier = require('../src/models/Supplier');
const { createUser, loginAndGetToken } = require('./helpers');

describe('Suppliers API', () => {
  it('requires auth', async () => {
    const res = await request(app).get('/api/suppliers');
    expect(res.statusCode).toBe(401);
  });

  it('lists suppliers and validates payloads', async () => {
    await Supplier.create({ name: 'Supply Co', email: 'sup@test.com' });
    const purchase = await createUser({ email: 'purchase@test.com', role: 'Purchase' });
    const token = await loginAndGetToken(app, { email: purchase.email, password: 'Pass123!' });

    const list = await request(app)
      .get('/api/suppliers?page=1&limit=10&search=Sup')
      .set('Authorization', `Bearer ${token}`);
    expect(list.statusCode).toBe(200);

    const bad = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(bad.statusCode).toBe(400);

    const created = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'NewSup', email: 'newsup@test.com' });
    expect(created.statusCode).toBe(201);
  });

  it('allows admin to delete', async () => {
    const supplier = await Supplier.create({ name: 'Delete Sup', email: 'del@sup.com' });
    const admin = await createUser({ email: 'adminsup@test.com', role: 'Admin' });
    const token = await loginAndGetToken(app, { email: admin.email, password: 'Pass123!' });

    const res = await request(app)
      .delete(`/api/suppliers/${supplier._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
