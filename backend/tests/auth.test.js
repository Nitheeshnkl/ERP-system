const request = require('supertest');
const app = require('../app');
const User = require('../src/models/User');
const OtpVerification = require('../src/models/OtpVerification');

jest.mock('../services/emailService', () => ({
  sendOTPEmail: jest.fn().mockResolvedValue(true),
}));

const login = async (email, password) => {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res;
};

describe('Auth API Endpoints', () => {
  it('health check returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });

  it('register creates OTP record and blocks admin signup', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'Secret123',
      role: 'Sales',
    });
    expect(res.statusCode).toBe(201);
    const otp = await OtpVerification.findOne({ email: 'jane@example.com' });
    expect(otp).toBeTruthy();

    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'Secret123',
      role: 'Admin',
    });
    expect(adminRes.statusCode).toBe(403);
  });

  it('register validates required fields and role', async () => {
    const missing = await request(app).post('/api/auth/register').send({ email: 'x@test.com' });
    expect(missing.statusCode).toBe(400);

    const badRole = await request(app).post('/api/auth/register').send({
      name: 'X',
      email: 'x2@test.com',
      password: 'Secret123',
      role: 'Boss',
    });
    expect(badRole.statusCode).toBe(400);
  });

  it('verifyOtp creates user and rejects invalid OTP', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'K',
      email: 'k@example.com',
      password: 'Secret123',
      role: 'Inventory',
    });
    const otp = await OtpVerification.findOne({ email: 'k@example.com' });

    const bad = await request(app).post('/api/auth/verify-otp').send({
      email: 'k@example.com',
      otp: '000000',
    });
    expect(bad.statusCode).toBe(400);

    const good = await request(app).post('/api/auth/verify-otp').send({
      email: 'k@example.com',
      otp: otp.otp,
    });
    expect(good.statusCode).toBe(200);
    const user = await User.findOne({ email: 'k@example.com' });
    expect(user).toBeTruthy();
  });

  it('verifyOtp rejects expired OTP', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Expire',
      email: 'expire@test.com',
      password: 'Secret123',
      role: 'Inventory',
    });
    const otp = await OtpVerification.findOne({ email: 'expire@test.com' });
    otp.expiresAt = new Date(Date.now() - 1000);
    await otp.save();

    const res = await request(app).post('/api/auth/verify-otp').send({
      email: 'expire@test.com',
      otp: otp.otp,
    });
    expect(res.statusCode).toBe(400);
  });

  it('login rejects missing credentials and accepts valid user', async () => {
    const missing = await request(app).post('/api/auth/login').send({});
    expect(missing.statusCode).toBe(400);

    await User.create({ name: 'A', email: 'a@test.com', password: 'Pass123!', role: 'Sales', isVerified: true, emailVerified: true });
    const res = await login('a@test.com', 'Pass123!');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.token).toBeTruthy();
  });

  it('login rejects invalid credentials and unverified users', async () => {
    await User.create({ name: 'C', email: 'c@test.com', password: 'Pass123!', role: 'Sales', isVerified: false, emailVerified: false });
    const invalid = await login('c@test.com', 'WrongPass');
    expect(invalid.statusCode).toBe(401);

    const unverified = await login('c@test.com', 'Pass123!');
    expect(unverified.statusCode).toBe(403);
  });

  it('resendOtp validates email and missing records', async () => {
    const missing = await request(app).post('/api/auth/resend-otp').send({});
    expect(missing.statusCode).toBe(400);

    const none = await request(app).post('/api/auth/resend-otp').send({ email: 'none@test.com' });
    expect(none.statusCode).toBe(404);
  });

  it('me requires auth and returns profile', async () => {
    await User.create({ name: 'B', email: 'b@test.com', password: 'Pass123!', role: 'Inventory', isVerified: true, emailVerified: true });
    const tokenRes = await login('b@test.com', 'Pass123!');
    const token = tokenRes.body.data.token;

    const unauthorized = await request(app).get('/api/auth/me');
    expect(unauthorized.statusCode).toBe(401);

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.email).toBe('b@test.com');
  });

  it('getAllUsers is admin-only', async () => {
    await User.create({ name: 'Admin', email: 'admin@test.com', password: 'Pass123!', role: 'Admin', isVerified: true, emailVerified: true });
    await User.create({ name: 'Staff', email: 'staff@test.com', password: 'Pass123!', role: 'Sales', isVerified: true, emailVerified: true });

    const adminToken = (await login('admin@test.com', 'Pass123!')).body.data.token;
    const staffToken = (await login('staff@test.com', 'Pass123!')).body.data.token;

    const staffRes = await request(app).get('/api/auth/users').set('Authorization', `Bearer ${staffToken}`);
    expect(staffRes.statusCode).toBe(403);

    const adminRes = await request(app).get('/api/auth/users').set('Authorization', `Bearer ${adminToken}`);
    expect(adminRes.statusCode).toBe(200);
    expect(Array.isArray(adminRes.body.data)).toBe(true);
  });

  it('logout clears token even without auth', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.statusCode).toBe(200);
  });
});
