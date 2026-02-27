const express = require('express');
const router = express.Router();
const { checkAuth, checkRole } = require('../middleware/auth');
const reportController = require('../controllers/reportController');

router.use(checkAuth);

router.get('/sales', checkRole('Admin', 'Sales', 'Purchase'), reportController.exportSalesCsv);
router.get('/invoices', checkRole('Admin', 'Sales', 'Purchase'), reportController.exportInvoicesCsv);

module.exports = router;
