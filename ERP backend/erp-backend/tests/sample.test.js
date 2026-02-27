const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';

describe('API Tests', () => {
  it('should have a working environment', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });

  it('should reject unauthorized access to me endpoint', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});