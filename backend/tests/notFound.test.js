const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { createUser, loginAndGetToken } = require('./helpers');

describe('Not found responses', () => {
  const makeId = () => new mongoose.Types.ObjectId().toString();

  it('returns 404 for missing customer/supplier/product', async () => {
    const sales = await createUser({ email: 'nf-sales@test.com', role: 'Sales' });
    const salesToken = await loginAndGetToken(app, { email: sales.email, password: 'Pass123!' });

    const productRes = await request(app)
      .get(`/api/products/${makeId()}`)
      .set('Authorization', `Bearer ${salesToken}`);
    expect(productRes.statusCode).toBe(404);

    const customerRes = await request(app)
      .get(`/api/customers/${makeId()}`)
      .set('Authorization', `Bearer ${salesToken}`);
    expect(customerRes.statusCode).toBe(404);

    const purchaseUser = await createUser({ email: 'nf-purchase@test.com', role: 'Purchase' });
    const purchaseToken = await loginAndGetToken(app, { email: purchaseUser.email, password: 'Pass123!' });

    const supplierRes = await request(app)
      .get(`/api/suppliers/${makeId()}`)
      .set('Authorization', `Bearer ${purchaseToken}`);
    expect(supplierRes.statusCode).toBe(404);
  });

  it('returns 404 on delete when record missing', async () => {
    const admin = await createUser({ email: 'nf-admin@test.com', role: 'Admin' });
    const token = await loginAndGetToken(app, { email: admin.email, password: 'Pass123!' });

    const prodDel = await request(app)
      .delete(`/api/products/${makeId()}`)
      .set('Authorization', `Bearer ${token}`);
    expect(prodDel.statusCode).toBe(404);

    const custDel = await request(app)
      .delete(`/api/customers/${makeId()}`)
      .set('Authorization', `Bearer ${token}`);
    expect(custDel.statusCode).toBe(404);

    const supDel = await request(app)
      .delete(`/api/suppliers/${makeId()}`)
      .set('Authorization', `Bearer ${token}`);
    expect(supDel.statusCode).toBe(404);
  });
});
