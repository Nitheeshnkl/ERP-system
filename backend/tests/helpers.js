const request = require('supertest');
const User = require('../src/models/User');

const createUser = async ({ name = 'Test User', email = 'user@test.com', password = 'Pass123!', role = 'Inventory' } = {}) => {
  const user = new User({ name, email, password, role, isVerified: true, emailVerified: true });
  await user.save();
  return user;
};

const loginAndGetToken = async (app, { email = 'user@test.com', password = 'Pass123!' } = {}) => {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body?.data?.token;
};

module.exports = {
  createUser,
  loginAndGetToken,
};
