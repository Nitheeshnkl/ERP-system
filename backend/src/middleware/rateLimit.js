const rateLimit = require('express-rate-limit');
const { error } = require('../utils/response');

const isProd = process.env.NODE_ENV === 'production';
const perMinuteMax = isProd ? 100 : 1000;

const toRateLimitHandler = (message) => (_req, res) => error(res, message, 429);

const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: perMinuteMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/auth/logout' || req.path === '/health' || req.path === '/ready',
  handler: toRateLimitHandler('Too many requests. Please try again shortly.')
});

const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: perMinuteMax,
  standardHeaders: true,
  legacyHeaders: false,
  handler: toRateLimitHandler('Too many authentication attempts. Please try again later.')
});

module.exports = {
  apiRateLimiter,
  authRateLimiter,
};
