const jwt = require('jsonwebtoken');
const { ensureAdminAssignsAdminRole } = require('../src/middleware/rbac');

jest.mock('../src/models/User', () => ({
  findById: jest.fn(),
}));

const User = require('../src/models/User');

describe('RBAC middleware', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const makeRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('allows non-admin role assignment without auth', async () => {
    const req = { body: { role: 'Sales' }, cookies: {}, headers: {} };
    const res = makeRes();
    const next = jest.fn();

    await ensureAdminAssignsAdminRole(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('blocks admin assignment without token', async () => {
    const req = { body: { role: 'Admin' }, cookies: {}, headers: {} };
    const res = makeRes();
    const next = jest.fn();

    await ensureAdminAssignsAdminRole(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('blocks non-admin requester', async () => {
    const req = { body: { role: 'Admin' }, cookies: { token: 't' }, headers: {} };
    const res = makeRes();
    const next = jest.fn();

    jest.spyOn(jwt, 'verify').mockReturnValue({ id: 'u1' });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ role: 'Sales' }) });

    await ensureAdminAssignsAdminRole(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('allows admin requester', async () => {
    const req = { body: { role: 'Admin' }, cookies: { token: 't' }, headers: {} };
    const res = makeRes();
    const next = jest.fn();

    jest.spyOn(jwt, 'verify').mockReturnValue({ id: 'u1' });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ role: 'Admin' }) });

    await ensureAdminAssignsAdminRole(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
