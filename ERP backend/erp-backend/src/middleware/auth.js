const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');
const User = require('../models/User');
const { hasRole } = require('../utils/roles');
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}
const JWT_SECRET = process.env.JWT_SECRET;

exports.checkAuth = async (req, res, next) => {
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
    const user = await User.findById(decoded.id).select('tokenVersion');
    if (!user) {
      return error(res, 'Unauthorized - User not found', 401);
    }

    if (Number(user.tokenVersion || 0) < 0) {
      return error(res, 'Unauthorized - User deactivated', 401);
    }

    if (Number(decoded.tv || 0) !== Number(user.tokenVersion || 0)) {
      return error(res, 'Invalid token', 401);
    }

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
    if (!req.user || !hasRole(req.user.role, roles)) {
      return error(res, 'Forbidden: Insufficient privileges', 403);
    }
    return next();
  };
};
