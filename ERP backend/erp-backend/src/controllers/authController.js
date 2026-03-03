const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { success, error } = require('../utils/response');
const { canonicalizeRole, normalizeRole } = require('../utils/roles');
const mongoose = require('mongoose');
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}
const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const requestedRole = normalizeRole(role);
    const normalizedRole = role ? canonicalizeRole(role) : 'Inventory';

    if (!name || !email || !password) {
      return error(res, 'Name, email, and password are required', 400);
    }

    if (role && !normalizedRole) {
      return error(res, 'Invalid role. Allowed roles: Admin, Sales, Purchase, Inventory', 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return error(res, 'Email already registered', 409);
    }

    if (requestedRole === 'admin') {
      let token = req.cookies?.token;
      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return error(res, 'Admin accounts cannot be created via public signup', 403);
      }

      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (_tokenError) {
        return error(res, 'Admin accounts cannot be created via public signup', 403);
      }

      const requester = await User.findById(decoded.id).select('role');
      if (!requester || String(requester.role).toLowerCase() !== 'admin') {
        return error(res, 'Admin accounts cannot be created via public signup', 403);
      }
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: requestedRole === 'admin' ? 'Admin' : normalizedRole
    });

    await user.save();

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return success(res, userResponse, 'User registered successfully', 201);
  } catch (requestError) {
    console.error('Register error:', requestError);
    const isProduction = process.env.NODE_ENV === 'production';
    return error(res, isProduction ? 'Registration failed' : requestError.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || '').trim();

    if (!identifier || !password) {
      return error(res, 'Email/username and password are required', 400);
    }

    const escapedIdentifier = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let user = await User.findOne({
      email: { $regex: `^${escapedIdentifier}$`, $options: 'i' },
    });

    if (!user && !identifier.includes('@')) {
      user = await User.findOne({
        email: { $regex: `^${escapedIdentifier}@`, $options: 'i' },
      });
    }

    if (!user || !(await user.comparePassword(password))) {
      return error(res, 'Invalid credentials', 401);
    }

    if (Number(user.tokenVersion || 0) < 0) {
      return error(res, 'User account is deactivated', 403);
    }

    const canonicalUserRole = canonicalizeRole(user.role) || 'Inventory';
    if (canonicalUserRole !== user.role) {
      user.role = canonicalUserRole;
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: canonicalUserRole, tv: Number(user.tokenVersion || 0) }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return success(res, {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: canonicalUserRole }
    }, 'Logged in successfully');
  } catch (requestError) {
    console.error('Login error:', requestError);
    const isProduction = process.env.NODE_ENV === 'production';
    return error(res, isProduction ? 'Authentication failed' : requestError.message, 500);
  }
};

exports.logout = (req, res) => {
  const completeLogout = () => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    return success(res, null, 'Logged out successfully');
  };

  let token = req.cookies?.token;
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return completeLogout();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded?.id) {
      User.findByIdAndUpdate(decoded.id, { $inc: { tokenVersion: 1 } })
        .finally(() => completeLogout());
      return;
    }
  } catch (_logoutTokenError) {
    // Fall through and clear cookie even for invalid/expired tokens.
  }

  return completeLogout();
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return error(res, 'User not found', 404);
    }
    const canonicalUserRole = canonicalizeRole(user.role) || 'Inventory';
    const payload = {
      ...user.toObject(),
      role: canonicalUserRole,
    };
    return success(res, payload, 'User fetched successfully');
  } catch (requestError) {
    console.error('Me endpoint error:', requestError);
    const isProduction = process.env.NODE_ENV === 'production';
    return error(res, isProduction ? 'Failed to fetch user' : requestError.message, 500);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    if (normalizeRole(req.user.role) !== 'admin') {
      return error(res, 'Only admins can view all users', 403);
    }

    const users = await User.find().select('-password');
    const usersWithActiveState = users.map((item) => ({
      ...item.toObject(),
      active: Number(item.tokenVersion || 0) >= 0,
    }));
    return success(res, usersWithActiveState, 'Users fetched successfully');
  } catch (requestError) {
    console.error('Get users error:', requestError);
    const isProduction = process.env.NODE_ENV === 'production';
    return error(res, isProduction ? 'Failed to fetch users' : requestError.message, 500);
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (normalizeRole(req.user.role) !== 'admin') {
      return error(res, 'Only admins can update users', 403);
    }

    const userId = String(req.params.id || '').trim();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return error(res, 'Invalid user id', 400);
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return error(res, 'User not found', 404);
    }

    const { role, active, name, password } = req.body || {};
    const normalizedRole = role ? canonicalizeRole(role) : null;
    if (role && !normalizedRole) {
      return error(res, 'Invalid role. Allowed roles: Admin, Sales, Purchase, Inventory', 400);
    }

    if (typeof name === 'string' && name.trim()) {
      targetUser.name = name.trim();
    }

    if (typeof password === 'string' && password.trim().length >= 6) {
      targetUser.password = password.trim();
    }

    if (normalizedRole) {
      targetUser.role = normalizedRole;
    }

    if (typeof active === 'boolean') {
      const tokenVersion = Number(targetUser.tokenVersion || 0);
      if (!active) {
        targetUser.tokenVersion = tokenVersion >= 0 ? tokenVersion + 1 : Math.abs(tokenVersion) + 1;
        targetUser.tokenVersion = -targetUser.tokenVersion;
      } else if (tokenVersion < 0) {
        targetUser.tokenVersion = Math.abs(tokenVersion) + 1;
      }
    }

    await targetUser.save();

    const updatedUser = await User.findById(targetUser._id).select('-password');
    return success(
      res,
      {
        ...updatedUser.toObject(),
        active: Number(updatedUser.tokenVersion || 0) >= 0,
      },
      'User updated successfully'
    );
  } catch (requestError) {
    console.error('Update user error:', requestError);
    const isProduction = process.env.NODE_ENV === 'production';
    return error(res, isProduction ? 'Failed to update user' : requestError.message, 500);
  }
};
