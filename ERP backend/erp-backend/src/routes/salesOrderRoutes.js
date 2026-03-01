const express = require('express');
const router = express.Router();
const { checkAuth, checkRole } = require('../middleware/auth');
const salesOrderController = require('../controllers/salesOrderController');

router.use(checkAuth);

// View Sales Orders: admin, sales
router.get('/', checkRole('Admin', 'Sales'), salesOrderController.getSalesOrders);
router.get('/:id', checkRole('Admin', 'Sales'), salesOrderController.getSalesOrder);

// Create Sales Order: admin, sales
router.post('/', checkRole('Admin', 'Sales'), salesOrderController.createSalesOrder);

// Edit Sales Order: admin, sales
router.put('/:id', checkRole('Admin', 'Sales'), salesOrderController.updateSalesOrder);

// Delete Sales Order: admin only
router.delete('/:id', checkRole('Admin'), salesOrderController.deleteSalesOrder);

module.exports = router;
