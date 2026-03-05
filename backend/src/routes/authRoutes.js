const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { checkAuth, checkRole } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimit');
const { ensureAdminAssignsAdminRole } = require('../middleware/rbac');

// Public endpoints
router.post('/register', authRateLimiter, ensureAdminAssignsAdminRole, authController.register);
router.post('/verify-email', authRateLimiter, authController.verifyEmail);
router.post('/login', authRateLimiter, authController.login);
router.post('/logout', authController.logout);

// Protected endpoints
router.get('/me', checkAuth, authController.me);

// Admin only
router.get('/users', checkAuth, checkRole('Admin'), authController.getAllUsers);

module.exports = router;
