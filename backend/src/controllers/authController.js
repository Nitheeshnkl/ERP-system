const User = require('../models/User');
const OtpVerification = require('../models/OtpVerification');
const bcrypt = require('bcrypt');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
const { success, error } = require('../utils/response');
const { canonicalizeRole, normalizeRole } = require('../utils/roles');
const { sendOTPEmail } = require('../../services/emailService');

const getJwtSecret = () => {
  const jwtSecret = (process.env.JWT_SECRET || '').trim();
  if (!jwtSecret) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }
  return jwtSecret;
};

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

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return error(res, 'Email already registered', 409);
    }

    if (requestedRole === 'admin') {
      return error(res, 'Admin accounts cannot be created from signup', 403);
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });
    console.log('[AUTH] OTP generated', { email: normalizedEmail, otp });
    const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_ROUNDS) || 10);

    await OtpVerification.deleteMany({ email: normalizedEmail });
    await OtpVerification.create({
      email: normalizedEmail,
      otp,
      signupData: {
        name,
        email: normalizedEmail,
        password: passwordHash,
        role: requestedRole === 'admin' ? 'Admin' : normalizedRole
      },
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    // Respond immediately so the frontend can open the OTP popup without waiting on SMTP.
    const response = success(res, { email: normalizedEmail }, 'Signup successful. Email verification required.', 201);

    // Fire-and-forget OTP email to avoid blocking the API response.
    setImmediate(async () => {
      try {
        const emailSent = await sendOTPEmail(normalizedEmail, otp);
        console.log('[MAIL] success', { email: normalizedEmail, sent: emailSent });
      } catch (sendError) {
        console.error('[MAIL] error', sendError);
      }
    });

    return response;
  } catch (requestError) {
    console.error('[AUTH] register error', requestError);
    const isProduction = process.env.NODE_ENV === 'production';
    return error(res, isProduction ? 'Registration failed' : requestError.message, 500);
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !String(email).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const existingOtp = await OtpVerification.findOne({ email: normalizedEmail });
    if (!existingOtp) {
      return res.status(404).json({
        success: false,
        message: 'No pending OTP for this email',
      });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });
    console.log('[OTP] Resending OTP', { email: normalizedEmail, otp });

    existingOtp.otp = otp;
    existingOtp.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await existingOtp.save();

    const emailSent = await sendOTPEmail(normalizedEmail, otp);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to resend OTP',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      email: normalizedEmail,
    });
  } catch (requestError) {
    console.error('[AUTH] resend OTP error', requestError);
    const isProduction = process.env.NODE_ENV === 'production';
    return res.status(500).json({
      success: false,
      message: isProduction ? 'Failed to resend OTP' : requestError.message,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log('[AUTH] verifying OTP', { email });

    if (!email || !otp) {
      return error(res, 'Email and OTP are required', 400);
    }

    const normalizedEmail = String(email).toLowerCase();
    const otpRecord = await OtpVerification.findOne({ email: normalizedEmail });
    if (!otpRecord) {
      return error(res, 'Invalid or expired OTP', 400);
    }

    if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
      await OtpVerification.deleteOne({ _id: otpRecord._id });
      return error(res, 'OTP has expired', 400);
    }

    if (String(otpRecord.otp) !== String(otp)) {
      return error(res, 'Invalid OTP', 400);
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      await OtpVerification.deleteOne({ _id: otpRecord._id });
      return error(res, 'Email already registered', 409);
    }

    const user = new User({
      ...otpRecord.signupData,
      isVerified: true,
      emailVerified: true
    });
    user.$locals = { passwordHashed: true };
    await user.save();
    await OtpVerification.deleteOne({ _id: otpRecord._id });

    return success(res, null, 'Email verified successfully');
  } catch (requestError) {
    const isProduction = process.env.NODE_ENV === 'production';
    return error(res, isProduction ? 'OTP verification failed' : requestError.message, 500);
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
