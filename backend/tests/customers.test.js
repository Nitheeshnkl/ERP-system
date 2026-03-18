const request = require('supertest');
const app = require('../app');
const Customer = require('../src/models/Customer');
const { createUser, loginAndGetToken } = require('./helpers');

describe('Customers API', () => {
  it('rejects unauthenticated access', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.statusCode).toBe(401);
  });

  it('lists customers with pagination', async () => {
    await Customer.create({ name: 'Alpha', email: 'alpha@test.com' });
    const user = await createUser({ email: 'sales3@test.com', role: 'Sales' });
    const token = await loginAndGetToken(app, { email: user.email, password: 'Pass123!' });

    const res = await request(app)
      .get('/api/customers?page=1&limit=10&search=Al')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('validates create/update and enforces roles', async () => {
    const sales = await createUser({ email: 'sales4@test.com', role: 'Sales' });
    const salesToken = await loginAndGetToken(app, { email: sales.email, password: 'Pass123!' });

    const bad = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({});
    expect(bad.statusCode).toBe(400);

    const created = await request(app)
      .post('/api/customers')
      .set('Authorization', `Bearer ${salesToken}`)
      .send({ name: 'Beta', email: 'beta@test.com' });
    expect(created.statusCode).toBe(201);

    const updateBad = await request(app)
      .put(`/api/customers/${created.body.data._id}`)
      .set('Authorization', `Bearer ${salesToken}`)
      .send({});
    expect(updateBad.statusCode).toBe(400);
  });

  it('allows admin to delete', async () => {
    const customer = await Customer.create({ name: 'DeleteMe', email: 'del@test.com' });
    const admin = await createUser({ email: 'admin3@test.com', role: 'Admin' });
    const token = await loginAndGetToken(app, { email: admin.email, password: 'Pass123!' });

    const res = await request(app)
      .delete(`/api/customers/${customer._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
