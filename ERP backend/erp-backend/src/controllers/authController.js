const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { success, error } = require('../utils/response');
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const requestedRole = String(role || '').trim().toLowerCase();

    if (!name || !email || !password) {
      return error(res, 'Name, email, and password are required', 400);
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
      role: requestedRole === 'admin' ? 'Admin' : (role || 'Inventory')
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

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return success(res, {
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    }, 'Logged in successfully');
  } catch (requestError) {
    console.error('Login error:', requestError);
    const isProduction = process.env.NODE_ENV === 'production';
    return error(res, isProduction ? 'Authentication failed' : requestError.message, 500);
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  return success(res, null, 'Logged out successfully');
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return error(res, 'User not found', 404);
    }
    return success(res, user, 'User fetched successfully');
  } catch (requestError) {
    console.error('Me endpoint error:', requestError);
    const isProduction = process.env.NODE_ENV === 'production';
    return error(res, isProduction ? 'Failed to fetch user' : requestError.message, 500);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return error(res, 'Only admins can view all users', 403);
    }

    const users = await User.find().select('-password');
    return success(res, users, 'Users fetched successfully');
  } catch (requestError) {
    console.error('Get users error:', requestError);
    const isProduction = process.env.NODE_ENV === 'production';
    return error(res, isProduction ? 'Failed to fetch users' : requestError.message, 500);
  }
};
