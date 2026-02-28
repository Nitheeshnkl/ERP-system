const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

exports.checkAuth = (req, res, next) => {
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return error(res, 'Unauthorized - No token provided', 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (authError) {
    if (authError.name === 'TokenExpiredError') {
      return error(res, 'Token expired', 401);
    }
    return error(res, 'Invalid token', 401);
  }
};

exports.checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return error(res, 'Forbidden: Insufficient privileges', 403);
    }
    return next();
  };
};
