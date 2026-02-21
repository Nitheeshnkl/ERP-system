const express = require('express');
const router = express.Router();
const { checkAuth } = require('../middleware/auth');
const salesOrderController = require('../controllers/salesOrderController');

router.use(checkAuth);

router.get('/', salesOrderController.getSalesOrders);
router.post('/', salesOrderController.createSalesOrder);
router.put('/:id', salesOrderController.updateSalesOrder);

module.exports = router;