const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { checkAuth, checkRole } = require('../middleware/auth');

// All dashboard routes require authentication and role-based access
router.use(checkAuth);

// View dashboard: admin, sales, purchase, inventory
router.get('/metrics', checkRole('Admin', 'Sales', 'Purchase', 'Inventory'), dashboardController.getMetrics);
router.get('/chart', checkRole('Admin', 'Sales', 'Purchase', 'Inventory'), dashboardController.getChartData);

module.exports = router;
