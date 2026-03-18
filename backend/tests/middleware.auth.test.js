const jwt = require('jsonwebtoken');
const { checkAuth } = require('../src/middleware/auth');

jest.mock('../src/models/User', () => ({
  findById: jest.fn(),
}));

const User = require('../src/models/User');

describe('Auth middleware', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const makeRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('rejects when no token provided', async () => {
    const req = { cookies: {}, headers: {} };
    const res = makeRes();
    const next = jest.fn();

    await checkAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects invalid token', async () => {
    const req = { cookies: { token: 'bad' }, headers: {} };
    const res = makeRes();
    const next = jest.fn();

    jest.spyOn(jwt, 'verify').mockImplementation(() => { throw new Error('bad'); });

    await checkAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('rejects when tokenVersion mismatch', async () => {
    const req = { cookies: { token: 't' }, headers: {} };
    const res = makeRes();
    const next = jest.fn();

    jest.spyOn(jwt, 'verify').mockReturnValue({ id: 'u1', tv: 2 });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ tokenVersion: 1 }) });

    await checkAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('calls next with valid token', async () => {
    const req = { cookies: { token: 't' }, headers: {} };
    const res = makeRes();
    const next = jest.fn();

    jest.spyOn(jwt, 'verify').mockReturnValue({ id: 'u1', tv: 1, role: 'Admin' });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ tokenVersion: 1 }) });

    await checkAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
  });
});
