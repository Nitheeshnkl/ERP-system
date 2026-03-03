const request = require('supertest');
const app = require('../app');
const User = require('../src/models/User');

const loginAndGetToken = async (email, password) => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  return response.body?.data?.token;
};

describe('Role middleware behavior', () => {
  test('Admin allowed on admin-only route', async () => {
    await User.create({ name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'Admin' });
    const token = await loginAndGetToken('admin@example.com', 'password123');

    const response = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('Sales denied on admin-only route', async () => {
    await User.create({ name: 'Sales User', email: 'sales@example.com', password: 'password123', role: 'Sales' });
    const token = await loginAndGetToken('sales@example.com', 'password123');

    const response = await request(app)
      .get('/api/auth/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });
});
