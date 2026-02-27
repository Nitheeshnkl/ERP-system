const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { error } = require('../utils/response');

exports.ensureAdminAssignsAdminRole = async (req, res, next) => {
  try {
    const requestedRole = String(req.body?.role || '').trim().toLowerCase();
    if (requestedRole !== 'admin') {
      return next();
    }

    let token = req.cookies?.token;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return error(res, 'Admin role assignment requires an authenticated Admin user', 403);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_tokenError) {
      return error(res, 'Admin role assignment requires an authenticated Admin user', 403);
    }

    const requester = await User.findById(decoded.id).select('role');
    if (!requester || String(requester.role).toLowerCase() !== 'admin') {
      return error(res, 'Only an Admin can assign Admin role', 403);
    }

    return next();
  } catch (_requestError) {
    return error(res, 'Role assignment validation failed', 500);
  }
};
