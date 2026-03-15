const User = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { success, error } = require('../utils/response');
const { canonicalizeRole, normalizeRole } = require('../utils/roles');
const { sendVerificationEmail } = require('../../services/emailService');

const getJwtSecret = () => {
  const jwtSecret = (process.env.JWT_SECRET || '').trim();
  if (!jwtSecret) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }
  return jwtSecret;
};

const getBackendUrl = () => {
  const backendUrl = (process.env.BACKEND_URL || '').trim();
  if (!backendUrl) {
    throw new Error('Missing required environment variable: BACKEND_URL');
  }
  return backendUrl.replace(/\/+$/, '');
};

exports.register = async (req, res) => {
  try {
    const JWT_SECRET = getJwtSecret();
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
      return error(res, 'Admin accounts cannot be created from signup', 403);
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: requestedRole === 'admin' ? 'Admin' : normalizedRole,
      isVerified: false,
      emailVerified: false,
      verificationToken
    });

    await user.save();

    const verificationUrl = `${getBackendUrl()}/api/auth/verify-email?token=${verificationToken}`;
    try {
      await sendVerificationEmail(user.email, verificationUrl);
    } catch (sendError) {
      await User.deleteOne({ _id: user._id });
      throw sendError;
    }

    return success(res, null, 'Verification email sent', 201);
  } catch (requestError) {
    console.error('Register error:', requestError);
    const isProduction = process.env.NODE_ENV === 'production';
    return error(res, isProduction ? 'Registration failed' : requestError.message, 500);
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return error(res, 'Verification token is required', 400);
    }

    const user = await User.findOne({ verificationToken: String(token) });
    if (!user) {
      return error(res, 'Invalid or expired verification token', 400);
    }

    user.isVerified = true;
    user.emailVerified = true;
    user.verificationToken = null;
    await user.save();

    return success(res, null, 'Email verified successfully');
  } catch (requestError) {
    const isProduction = process.env.NODE_ENV === 'production';
    return error(res, isProduction ? 'Email verification failed' : requestError.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const JWT_SECRET = getJwtSecret();
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

    console.log('Entered password:', password);
    console.log('Stored hash:', user?.password);
    const passwordMatches = user ? await user.comparePassword(password) : false;
    console.log('Password match:', passwordMatches);

    if (!user || !passwordMatches) {
      return error(res, 'Invalid credentials', 401);
    }

    const isEmailVerified = user.isVerified !== false && user.emailVerified !== false;
    if (!isEmailVerified && String(user.role).toLowerCase() !== 'admin') {
      return error(res, 'Please verify your email before logging in', 403);
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
  const JWT_SECRET = getJwtSecret();
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
    return success(res, users, 'Users fetched successfully');
  } catch (requestError) {
    console.error('Get users error:', requestError);
    const isProduction = process.env.NODE_ENV === 'production';
    return error(res, isProduction ? 'Failed to fetch users' : requestError.message, 500);
  }
};
