const request = require('supertest');
const app = require('../app');
const User = require('../src/models/User');

describe('Auth API', () => {
  test('Login success', async () => {
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'Admin',
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.user.email).toBe('admin@example.com');
  });

  test('Login failure with wrong password', async () => {
    await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'Admin',
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'wrong-password' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('Protected route without token returns 401', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('Swagger UI loads on /api-docs', async () => {
    const response = await request(app).get('/api-docs');

    expect(response.status).toBe(301);
    expect(response.headers.location).toBe('/api-docs/');
  });

  test('Swagger UI index loads on /api-docs/', async () => {
    const response = await request(app).get('/api-docs/');

    expect(response.status).toBe(200);
    expect(String(response.headers['content-type'] || '')).toContain('text/html');
  });
});
