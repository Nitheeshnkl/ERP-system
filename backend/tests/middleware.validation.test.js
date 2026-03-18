const Joi = require('joi');
const { validate } = require('../src/middleware/validation');

describe('Validation middleware', () => {
  const makeRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  it('passes valid payload and strips unknown', () => {
    const schema = Joi.object({ name: Joi.string().required() });
    const middleware = validate(schema);
    const req = { body: { name: 'A', extra: 'x' } };
    const res = makeRes();
    const next = jest.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.body.extra).toBeUndefined();
  });

  it('returns 400 on invalid payload', () => {
    const schema = Joi.object({ name: Joi.string().required() });
    const middleware = validate(schema);
    const req = { body: { } };
    const res = makeRes();
    const next = jest.fn();

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
