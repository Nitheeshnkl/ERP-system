const express = require('express');
const router = express.Router();
const { checkAuth, checkRole } = require('../middleware/auth');
const { validate, objectIdSchema } = require('../middleware/validation');
const purchaseOrderController = require('../controllers/purchaseOrderController');

router.use(checkAuth);

// View Purchase Orders: admin, purchase
router.get('/', checkRole('Admin', 'Purchase'), purchaseOrderController.getPurchaseOrders);
router.get('/:id', checkRole('Admin', 'Purchase'), validate(objectIdSchema, 'params'), purchaseOrderController.getPurchaseOrder);

// Create Purchase Order: admin, purchase
router.post('/', checkRole('Admin', 'Purchase'), purchaseOrderController.createPurchaseOrder);

// Edit Purchase Order: admin, purchase
router.put('/:id', checkRole('Admin', 'Purchase'), validate(objectIdSchema, 'params'), purchaseOrderController.updatePurchaseOrder);

// Delete Purchase Order: admin only
router.delete('/:id', checkRole('Admin'), validate(objectIdSchema, 'params'), purchaseOrderController.deletePurchaseOrder);

module.exports = router;
