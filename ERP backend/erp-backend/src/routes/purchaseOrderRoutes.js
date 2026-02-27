const express = require('express');
const router = express.Router();
const { checkAuth, checkRole } = require('../middleware/auth');
const purchaseOrderController = require('../controllers/purchaseOrderController');

router.use(checkAuth);

// View Purchase Orders: admin, purchase
router.get('/', checkRole('Admin', 'Purchase'), purchaseOrderController.getPurchaseOrders);
router.get('/:id', checkRole('Admin', 'Purchase'), purchaseOrderController.getPurchaseOrder);

// Create Purchase Order: admin, purchase
router.post('/', checkRole('Admin', 'Purchase'), purchaseOrderController.createPurchaseOrder);

// Edit Purchase Order: admin, purchase
router.put('/:id', checkRole('Admin', 'Purchase'), purchaseOrderController.updatePurchaseOrder);

// Delete Purchase Order: admin only
router.delete('/:id', checkRole('Admin'), purchaseOrderController.deletePurchaseOrder);

module.exports = router;