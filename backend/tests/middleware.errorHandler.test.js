const { notFoundHandler, errorHandler } = require('../src/middleware/errorHandler');

describe('Error handler middleware', () => {
  const makeRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('returns 404 on notFoundHandler', () => {
    const req = { originalUrl: '/missing' };
    const res = makeRes();
    notFoundHandler(req, res, () => {});
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('maps validation errors to 400', () => {
    const req = { method: 'GET', originalUrl: '/x' };
    const res = makeRes();
    const err = { name: 'ValidationError', message: 'bad', errors: {} };
    errorHandler(err, req, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('maps duplicate key to 400', () => {
    const req = { method: 'POST', originalUrl: '/x' };
    const res = makeRes();
    const err = { code: 11000, keyPattern: { email: 1 }, message: 'dup' };
    errorHandler(err, req, res, () => {});
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
